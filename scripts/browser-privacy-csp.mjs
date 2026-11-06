// Real Chromium network/consent and CSP inventory check for almanyapusulasi.de.
// Only synthetic test data is used. The report contains aggregated origins and directives.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL || 'https://almanyapusulasi.de';
const REPORT='audit-output/browser-privacy-csp.json';
const summaries=[];
const allViolations=[];
const trackedHosts=/(\.|^)(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com|cloudflareinsights\.com)$/i;
function isTracking(url){
  try{const u=new URL(url);return trackedHosts.test(u.hostname)||u.pathname==='/cdn-cgi/rum';}catch{return false;}
}
function safeOrigin(uri){
  if(!uri)return '(none)';
  try{return new URL(uri).origin;}catch{return String(uri).slice(0,32);}
}
async function recordViolations(page,label){
  const raw=await page.evaluate(()=>window.__apCspViolations||[]);
  for(const v of raw)allViolations.push({...v,page:label});
  return raw.length;
}
function check(condition,message){assert.ok(condition,message);}

const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||undefined});
let failures=0;
try{
  for(const scenario of [
    {name:'desktop-home',path:'/',size:{width:1360,height:800}},
    {name:'mobile-home',path:'/',size:{width:390,height:844},mobile:true},
    {name:'mobile-nebenkosten',path:'/nebenkosten-abrechnung-kontrolu/',size:{width:390,height:844},mobile:true},
    {name:'desktop-insurance',path:'/sigorta-secim-araci/',size:{width:1360,height:800}}
  ]){
    const context=await browser.newContext({
      viewport:scenario.size,isMobile:!!scenario.mobile,hasTouch:!!scenario.mobile,
      locale:'tr-TR',serviceWorkers:'block'
    });
    const page=await context.newPage();
    const traffic=[];
    let probeLeak=false;
    page.on('request',req=>{
      if(isTracking(req.url())){
        traffic.push({host:safeOrigin(req.url()),phase:page.__apPhase||'initial'});
        if(req.url().includes('synthetic_token'))probeLeak=true;
      }
    });
    await page.addInitScript(()=>{
      window.__apCspViolations=[];
      document.addEventListener('securitypolicyviolation',event=>{
        let blocked=event.blockedURI||'';
        try{blocked=new URL(blocked).origin;}catch{blocked=blocked.slice(0,32);}
        window.__apCspViolations.push({
          disposition:event.disposition,
          directive:event.effectiveDirective,
          blockedOrigin:blocked
        });
      });
    });
    const row={scenario:scenario.name,preConsentTracking:0,acceptedTracking:0,cspViolations:0,pass:false};
    try{
      page.__apPhase='before-consent';
      const response=await page.goto(SITE+scenario.path+'?ap_privacy_probe=synthetic_token',{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response.status(),200,'Page HTTP response');
      const headers=response.headers();
      for(const key of ['content-security-policy','content-security-policy-report-only','strict-transport-security','x-content-type-options']){
        check(!!headers[key],'Required security header missing: '+key);
      }
      check(headers['content-security-policy'].includes('frame-ancestors'),'Enforced frame protection missing');
      check(headers['content-security-policy-report-only'].includes("default-src 'self'"),'Report-only policy missing');
      check((headers['cache-control']||'').includes('no-transform'),'Cloudflare auto-injection protection missing');
      await page.locator('.cookie-banner .cookie-reject').waitFor({timeout:12000});
      await page.waitForTimeout(600);
      row.preConsentTracking=traffic.filter(x=>x.phase==='before-consent').length;
      assert.equal(row.preConsentTracking,0,'Tracking request before acceptance');
      assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0,'Google tag loaded before acceptance');
      assert.equal(await page.locator('script[src*="cloudflareinsights.com"]').count(),0,'Cloudflare beacon injected without opt-in');
      assert.equal(await page.evaluate(()=>localStorage.getItem('ap_cookie_consent')),null,'New visitor has stored consent');

      // Explicit refusal, then reload: remain rejected with no Google tag.
      await page.locator('.cookie-banner .cookie-reject').click();
      assert.equal(await page.evaluate(()=>localStorage.getItem('ap_cookie_consent')),'rejected');
      row.cspViolations+=await recordViolations(page,scenario.name+'-before-consent');
      page.__apPhase='rejected-reload';
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForTimeout(400);
      assert.equal(traffic.filter(x=>x.phase==='rejected-reload').length,0,'Tracking resumed after rejected reload');
      assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0);

      // From privacy settings, user can change mind and opt in.
      await page.locator('.privacy-settings-link').click();
      await page.locator('.cookie-banner .cookie-accept').waitFor();
      page.__apPhase='after-opt-in';
      if(scenario.name==='mobile-nebenkosten'){
        const geometry=await page.evaluate(()=>{
          const info=sel=>{
            const el=document.querySelector(sel),r=el?.getBoundingClientRect(),style=el?getComputedStyle(el):null;
            if(!r)return null;
            const cx=r.left+r.width/2,cy=r.top+r.height/2,hit=document.elementFromPoint(cx,cy);
            return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:style.display,position:style.position,centerHit:hit?.className||hit?.tagName};
          };
          const maxVisible=visualViewport?visualViewport.width:innerWidth;
          const overflow=[...document.querySelectorAll('body *')]
            .filter(el=>!el.closest('.cookie-banner'))
            .map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,cl:String(el.className||'').slice(0,60),x:Math.round(r.x),right:Math.round(r.right),width:Math.round(r.width)}})
            .filter(x=>x.right>maxVisible+3 || x.width>maxVisible+3)
            .sort((a,b)=>b.right-a.right).slice(0,14);
          return {innerWidth:innerWidth,innerHeight:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollY:scrollY,
            metaViewport:document.querySelector('meta[name="viewport"]')?.content,
            viewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,offsetTop:visualViewport.offsetTop}:null,
            overflow,
            banner:info('.cookie-banner'),inner:info('.cookie-banner-inner'),actions:info('.cookie-actions'),
            reject:info('.cookie-reject'),accept:info('.cookie-accept')};
        });
        console.log('MOBILE CONSENT GEOMETRY '+JSON.stringify(geometry));
      }
      await page.locator('.cookie-banner .cookie-accept').click();
      await page.waitForFunction(()=>window.__apGaLoaded===true,null,{timeout:12000});
      await page.waitForTimeout(700);
      assert.equal(await page.evaluate(()=>localStorage.getItem('ap_cookie_consent')),'accepted');
      check(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count()===1,'Google tag is missing or duplicated after consent');
      check(await page.evaluate(()=>window['ga-disable-G-2E8PT2LRG1']===false),'GA was not enabled after consent');
      const config=await page.evaluate(()=>{
        const entries=window.dataLayer||[];
        const item=entries.find(x=>x[0]==='config');
        return item?.[2]?.page_location||'';
      });
      assert.equal(config,SITE+scenario.path,'GA page_location must strip query tokens');
      row.acceptedTracking=traffic.filter(x=>x.phase==='after-opt-in').length;
      check(row.acceptedTracking>0,'Google tag did not make an observable network request after opt-in');
      check(!probeLeak,'Probe token leaked into tracking network request');

      // Explicit revocation should remove existing first-party GA cookies and block new events.
      await page.evaluate(()=>{
        document.cookie='_ga=TEST_COOKIE; path=/; SameSite=Lax';
        document.cookie='_ga_2E8PT2LRG1=TEST_COOKIE; path=/; SameSite=Lax';
      });
      await page.locator('.privacy-settings-link').click();
      await page.locator('.cookie-banner .cookie-reject').click();
      check(await page.evaluate(()=>window['ga-disable-G-2E8PT2LRG1']===true),'GA remains enabled after revocation');
      check(await page.evaluate(()=>!document.cookie.split(';').some(x=>x.trim().startsWith('_ga'))),'GA cookies remain after withdrawal');
      const noNewEvent=await page.evaluate(()=>{
        const old=(window.dataLayer||[]).length;
        window.APAnalytics.track('ap_smoke_after_revocation');
        return (window.dataLayer||[]).length===old;
      });
      check(noNewEvent,'Tracking API accepted an event after withdrawal');
      row.cspViolations+=await recordViolations(page,scenario.name+'-opted-in');
      // A fresh page in the same storage context separates late in-flight
      // requests from the old Google script from genuinely new tracking.
      const isolated=await context.newPage(),isolatedTraffic=[];
      isolated.on('request',req=>{if(isTracking(req.url()))isolatedTraffic.push(safeOrigin(req.url()));});
      try{
        await isolated.goto(SITE+scenario.path+'?ap_privacy_probe=synthetic_token',{waitUntil:'domcontentloaded'});
        await isolated.waitForTimeout(500);
        assert.equal(await isolated.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0);
        assert.equal(await isolated.locator('script[src*="cloudflareinsights.com"]').count(),0);
        assert.equal(isolatedTraffic.length,0,'Fresh page restarted tracking after consent withdrawal: '+isolatedTraffic.join(','));
      }finally{await isolated.close();}
      row.cspViolations+=await recordViolations(page,scenario.name+'-withdrawn');
      row.pass=true;
      console.log('PASS browser '+scenario.name+' — no pre-consent traffic, opt-in, revocation, reload, security headers');
    }catch(e){
      failures++;
      row.error=String(e.message||e).slice(0,1000);
      console.error('FAIL browser '+scenario.name+': '+row.error);
      try{row.cspViolations+=await recordViolations(page,scenario.name+'-failed');}catch{}
    }finally{
      summaries.push(row);
      await context.close();
    }
  }
}finally{await browser.close();}
const counts=new Map();
for(const v of allViolations){
  const k=JSON.stringify(v);
  counts.set(k,(counts.get(k)||0)+1);
}
const inventory=[...counts].map(([k,count])=>({...JSON.parse(k),count})).sort((a,b)=>b.count-a.count);
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync(REPORT,JSON.stringify({
  date:new Date().toISOString(),
  site:SITE,
  summary:summaries,
  cspInventory:inventory,
  limitation:'CSP reports are an observed browser sample, not a proof of zero violations across all URLs or browsers.'
},null,2)+'\n');
console.log('CSP report-only observed violation inventory (first 25 rows):');
console.log(JSON.stringify(inventory.slice(0,25),null,2));
console.log('Browser report saved to '+REPORT);
if(failures)process.exitCode=1;
else console.log('PASS real Chromium browser network consent/CSP audit: '+summaries.length+' scenarios');
