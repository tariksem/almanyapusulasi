// Live Chrome CSP audit for static editorial pages with consent lifecycle.
// Checks real page scripts and Google Analytics after explicit consent only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const REPORT='audit-output/browser-editorial-csp.json';
const pages=[
  '/familienversicherung/',
  '/krankenkasse-degistirme/',
  '/is-birakinca-saglik-sigortasi/',
  '/wohngeld/',
  '/kindergeld/',
  '/haberler/',
  '/almanya-2026-resmi-esikler/',
  '/berufsunfaehigkeitsversicherung/'
];
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||undefined});
const records=[];
let failures=0;
const trackingHost=/(^|\.)((?:googletagmanager|google-analytics|analytics\.google)\.com|cloudflareinsights\.com)$/i;
const isTracking=url=>{try{return trackingHost.test(new URL(url).hostname);}catch{return false;}};
try{
  for(const path of pages){
    const ctx=await browser.newContext({viewport:{width:1280,height:780},locale:'tr-TR',serviceWorkers:'block'});
    await ctx.addInitScript(()=>{
      try{localStorage.setItem('ap_cookie_consent','rejected');}catch{}
      window.__apEditorialCsp=[];
      document.addEventListener('securitypolicyviolation',e=>{
        let origin='';
        try{origin=new URL(e.blockedURI).origin;}catch{origin=String(e.blockedURI||'').slice(0,32);}
        window.__apEditorialCsp.push({directive:e.effectiveDirective,disposition:e.disposition,blockedOrigin:origin});
      });
    });
    const page=await ctx.newPage();const trackerRequests=[],localFailures=[];
    let phase='before-consent';
    page.on('request',r=>{if(isTracking(r.url()))trackerRequests.push({phase,origin:new URL(r.url()).origin});});
    page.on('requestfailed',r=>{
      try{const u=new URL(r.url());if(u.origin===SITE)localFailures.push({type:r.resourceType(),path:u.pathname});}catch{}
    });
    const row={path,pass:false,csp:[],phases:{},failedLocalRequests:[]};
    try{
      const response=await page.goto(SITE+path+'?synthetic_csp_probe=not_personal',{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response?.status(),200);
      const csp=response.headers()['content-security-policy']||'';
      for(const rule of ["frame-ancestors 'self'","object-src 'none'","base-uri 'self'",
                         "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
                         "connect-src 'self' https://*.google-analytics.com",
                         "frame-src 'none'","form-action 'self'"]){
        assert(csp.includes(rule),'Missing enforced CSP directive: '+rule);
      }
      assert.equal(await page.locator('iframe').count(),0,'Unexpected embedded iframe');
      assert.equal(await page.locator('form').count(),0,'Unexpected form needs review before CSP enforcement');
      await page.waitForTimeout(300);
      row.phases.beforeConsent=trackerRequests.length;
      assert.equal(row.phases.beforeConsent,0,'Google/Cloudflare tracking sent without analytics consent');
      assert.equal(await page.locator('script[src*="googletagmanager.com"]').count(),0,'Google script preloaded despite rejection');
      assert.equal(await page.locator('script[src*="cloudflareinsights.com"]').count(),0,'Cloudflare analytics injected despite rejection');
      assert.equal(await page.evaluate(()=>localStorage.getItem('ap_cookie_consent')),'rejected');

      // Real UI click, no forged consent in a test-only API.
      phase='after-acceptance';
      await page.locator('.privacy-settings-link').click();
      await page.locator('.cookie-banner .cookie-accept').click();
      await page.waitForFunction(()=>window.__apGaLoaded===true&&localStorage.getItem('ap_cookie_consent')==='accepted',
        null,{timeout:12000});
      assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(),1,'Google tag missing or duplicated');
      const gaConfig=await page.evaluate(()=>{
        const item=(window.dataLayer||[]).find(x=>x[0]==='config');
        return item?.[2]?.page_location||'';
      });
      assert.equal(gaConfig,SITE+path,'Tracking URL leaked synthetic query value');
      await page.waitForTimeout(400);
      row.phases.afterAcceptance=trackerRequests.filter(x=>x.phase==='after-acceptance').length;
      assert(row.phases.afterAcceptance>=1,'No Google Analytics script request after consent');

      // Explicit withdrawal and independent new page, to avoid in-flight old-script requests.
      await page.locator('.privacy-settings-link').click();
      await page.locator('.cookie-banner .cookie-reject').click();
      assert.equal(await page.evaluate(()=>localStorage.getItem('ap_cookie_consent')),'rejected');
      assert(await page.evaluate(()=>window['ga-disable-G-2E8PT2LRG1']===true),'Google Analytics not disabled on withdrawal');
      const fresh=await ctx.newPage();const freshTracking=[];
      fresh.on('request',r=>{if(isTracking(r.url()))freshTracking.push(new URL(r.url()).origin);});
      try{
        await fresh.goto(SITE+path,{waitUntil:'domcontentloaded',timeout:30000});
        await fresh.waitForTimeout(400);
        assert.equal(freshTracking.length,0,'Tracking resumed after withdrawal in fresh tab: '+freshTracking.join(','));
        assert.equal(await fresh.locator('script[src*="googletagmanager.com"]').count(),0);
      }finally{await fresh.close();}
      row.phases.afterWithdrawal=0;
      row.csp=await page.evaluate(()=>window.__apEditorialCsp||[]);
      assert.equal(row.csp.filter(x=>x.disposition==='enforce').length,0,
        'Enforced CSP blocked page resources: '+JSON.stringify(row.csp));
      assert.equal(localFailures.length,0,'Local JS/CSS request failed: '+JSON.stringify(localFailures));
      row.pass=true;
      console.log('PASS editorial CSP '+path+' — consent, analytics, withdrawal, scripts, no enforce violations');
    }catch(e){
      failures++;
      row.error=String(e?.message||e).slice(0,850);
      row.csp=await page.evaluate(()=>window.__apEditorialCsp||[]).catch(()=>[]);
      console.error('FAIL editorial CSP '+path+': '+row.error);
    }finally{
      row.failedLocalRequests=localFailures;
      row.trackerOrigins=[...new Set(trackerRequests.map(x=>x.origin))].sort();
      records.push(row);await ctx.close();
    }
  }
}finally{await browser.close();}
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync(REPORT,JSON.stringify({
  createdAt:new Date().toISOString(),site:SITE,
  scope:'Eight selected static editorial pages with explicit Google Analytics consent lifecycle.',
  results:records,
  limitations:'Browser sampling is not a full screen-reader audit or coverage of interactive calculators.',
},null,2)+'\n');
console.log('Editorial CSP report saved '+REPORT);
if(failures)process.exitCode=1;
else console.log('PASS browser editorial CSP + consent audit: '+records.length+' pages');
