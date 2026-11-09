// Live partner placement and affiliate consent audit.
// All partner clicks are intercepted in the same page before navigation:
// no synthetic traffic is sent to partner tracking endpoints.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const REPORT='audit-output/browser-affiliate-csp.json';
const cases=[
  {page:'/stromtarif-karsilastirma-2026/',key:'electricity-comparison',provider:'CHECK24',host:'a.check24.net'},
  {page:'/haftpflicht-karsilastirma-2026/',key:'insurance-comparison',provider:'TARIFCHECK',host:'a.partner-versicherung.de'},
  {page:'/private-krankenversicherung-pkv-2026/',key:'pkv-comparison',provider:'TARIFCHECK',host:'a.partner-versicherung.de'},
  {page:'/kfz-versicherung-karsilastirma-2026/',key:'kfz-insurance',provider:'TARIFCHECK',host:'a.partner-versicherung.de'},
  {page:'/berufsunfaehigkeitsversicherung/',key:'bu-comparison',disabled:true}
];
const rows=[],allViolations=[];
function partnerHost(u){
  try{return ['a.partner-versicherung.de','a.check24.net'].includes(new URL(u).hostname);}
  catch{return false;}
}
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||undefined});
let failures=0;
try{
  for(const item of cases){
    const context=await browser.newContext({viewport:{width:1366,height:844},locale:'tr-TR',serviceWorkers:'block'});
    await context.addInitScript(()=>{
      try{localStorage.setItem('ap_cookie_consent','rejected');}catch{}
      window.__apPartnerCancelled=0;
      window.__apPartnerCsp=[];
      document.addEventListener('click',event=>{
        const anchor=event.target?.closest?.('a[data-track="affiliate_click"]');
        if(anchor){event.preventDefault();window.__apPartnerCancelled++;}
      },true);
      document.addEventListener('securitypolicyviolation',event=>{
        let blocked='';
        try{blocked=new URL(event.blockedURI).origin;}catch{blocked=String(event.blockedURI||'').slice(0,40);}
        window.__apPartnerCsp.push({
          disposition:event.disposition,directive:event.effectiveDirective,blockedOrigin:blocked
        });
      });
    });
    const page=await context.newPage();
    const remotePartnerRequests=[];
    page.on('request',req=>{
      if(partnerHost(req.url()))remotePartnerRequests.push({host:new URL(req.url()).hostname,method:req.method()});
    });
    const row={page:item.page,key:item.key,pass:false,partnerRequests:[],csp:[]};
    try{
      const response=await page.goto(SITE+item.page,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response.status(),200,'Page must load');
      const slot=page.locator('[data-affiliate-slot="'+item.key+'"]');
      assert.equal(await slot.count(),1,'Missing expected commercial slot');
      if(item.disabled){
        assert.equal(await slot.locator('a[data-track="affiliate_click"]').count(),0,'Disabled BU product has a live partner link');
        assert.equal(remotePartnerRequests.length,0,'A disabled BU placement still requested partner resources');
        row.pass=true;console.log('PASS partner '+item.key+' — mismatched BU offer disabled');
      }else{
        const link=slot.locator('a[data-track="affiliate_click"]');
        await link.waitFor({state:'visible',timeout:10000});
        const meta=await link.evaluate(a=>({
          url:a.href,target:a.target,rel:a.rel,
          provider:a.getAttribute('data-commercial-provider'),
          area:a.getAttribute('data-commercial-area'),
          text:a.textContent.trim()
        }));
        const url=new URL(meta.url);
        assert.equal(url.protocol,'https:');
        assert.equal(url.host,item.host);
        assert.equal(meta.target,'_blank','External partner must open separate window');
        assert(meta.rel.split(/\s+/).includes('noopener'),'Missing cross-window opener protection');
        assert(meta.rel.split(/\s+/).includes('sponsored'),'Missing paid-link disclosure attribute');
        assert.equal(meta.provider,item.provider,'Incorrect partner attribution provider');
        assert.equal(meta.area,item.key,'Incorrect placement attribution');
        const disclosure=await slot.locator('.affiliate-disclosure').innerText();
        assert(disclosure.includes('komisyon'),'Paid placement must disclose commission');
        assert.equal(await slot.locator('iframe').count(),0,'Unrequested third-party iframe in slot');
        assert.equal(remotePartnerRequests.length,0,'Partner was contacted without an explicit click');

        // The capture listener prevents default navigation but still allows
        // bubbling to the existing commercial analytics event listener.
        const before=await page.evaluate(()=>window.dataLayer?.filter(e=>e[0]==='event'&&e[1]==='affiliate_click').length||0);
        await link.click();
        const afterReject=await page.evaluate(()=>window.dataLayer?.filter(e=>e[0]==='event'&&e[1]==='affiliate_click').length||0);
        assert.equal(afterReject,before,'Rejected consent must suppress affiliate analytics');
        assert.equal(await page.evaluate(()=>window.__apPartnerCancelled),1,'Synthetic external click was not safely intercepted');
        assert.equal(remotePartnerRequests.length,0,'Synthetic click contacted live affiliate provider');

        await page.locator('.privacy-settings-link').click();
        await page.locator('.cookie-banner .cookie-accept').click();
        await page.waitForFunction(()=>localStorage.getItem('ap_cookie_consent')==='accepted'&&window.__apGaLoaded===true,null,{timeout:12000});
        await link.click();
        const recorded=await page.evaluate(()=>{
          const e=(window.dataLayer||[]).filter(x=>x[0]==='event'&&x[1]==='affiliate_click');
          return e.length?{name:e[e.length-1][1],args:e[e.length-1][2]}:null;
        });
        assert(recorded,'Affiliate click not recorded after opt-in');
        assert.equal(recorded.args.partner,item.provider);
        assert.equal(recorded.args.commercial_area,item.key);
        assert.equal(recorded.args.link_url,url.origin+url.pathname,'Analytics leaked referral query parameters');
        assert(!recorded.args.link_url.includes('partner_id')&&!recorded.args.link_url.includes('pid='),'Partner IDs leaked to click analytics');
        assert.equal(remotePartnerRequests.length,0,'Accepted synthetic click must not contact affiliate service');
        assert.equal(await page.evaluate(()=>window.__apPartnerCancelled),2,'Synthetic click must be intercepted twice');
        row.pass=true;
        console.log('PASS partner '+item.key+' — disclosure, consent, sanitized events, no synthetic partner visit');
      }
    }catch(e){
      failures++;
      row.error=String(e?.message||e).slice(0,750);
      console.error('FAIL partner '+item.key+': '+row.error);
    }finally{
      row.partnerRequests=remotePartnerRequests;
      row.csp=await page.evaluate(()=>window.__apPartnerCsp||[]).catch(()=>[]);
      allViolations.push(...row.csp.map(x=>({...x,case:item.key})));
      if(row.csp.length)console.log('PARTNER CSP '+item.key+' '+JSON.stringify(row.csp.slice(0,15)));
      rows.push(row);
      await context.close();
    }
  }
}finally{await browser.close();}
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync(REPORT,JSON.stringify({
  createdAt:new Date().toISOString(),site:SITE,cases:rows,cspInventory:allViolations,
  scope:'Partner links verified in local Chromium DOM. Navigation is intercepted before the network. No synthetic partner clicks, leads or conversions.',
  limitation:'Partner-side redirect/checkout availability and genuine conversion attribution are not verified.'
},null,2)+'\n');
console.log('Partner CSP inventory '+JSON.stringify(allViolations.slice(0,20)));
console.log('Partner audit saved '+REPORT);
if(failures)process.exitCode=1;
else console.log('PASS affiliate browser security/consent audit: '+rows.length+' placements');
