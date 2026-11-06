// Browser accessibility + broader CSP sampling. Non-sensitive summary JSON only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const report='audit-output/browser-accessibility-csp.json';
const checks=[
  {slug:'/',name:'home-mobile',mobile:true,width:390},
  {slug:'/',name:'home-desktop',width:1366},
  {slug:'/araclar/',name:'tools-mobile',mobile:true,width:390},
  {slug:'/haberler/',name:'news-desktop',width:1366},
  {slug:'/familienversicherung/',name:'family-gkv-mobile',mobile:true,width:390},
  {slug:'/nebenkosten-abrechnung-kontrolu/',name:'nebenkosten-mobile',mobile:true,width:390},
  {slug:'/sigorta-secim-araci/',name:'insurance-mobile',mobile:true,width:390},
  {slug:'/brutto-netto-hesaplayici-2026/',name:'salary-desktop',width:1366},
  {slug:'/chancenkarte-puan-hesaplayici-2026/',name:'opportunity-mobile',mobile:true,width:390},
  {slug:'/blue-card-uygunluk-kontrolu-2026/',name:'blue-card-desktop',width:1366},
  {slug:'/almanya-emeklilik-hesaplayici-2026/',name:'pension-mobile',mobile:true,width:390},
  {slug:'/vatandaslik-testi/',name:'citizenship-desktop',width:1366},
  {slug:'/embed-araclar/',name:'embed-guide-desktop',width:1366},
  {slug:'/',name:'home-320',mobile:true,width:320},
  {slug:'/araclar/',name:'tools-320',mobile:true,width:320},
  {slug:'/nebenkosten-abrechnung-kontrolu/',name:'nebenkosten-320',mobile:true,width:320},
  {slug:'/sigorta-secim-araci/',name:'insurance-320',mobile:true,width:320},
  {slug:'/familienversicherung/',name:'family-gkv-320',mobile:true,width:320}
];
const summaries=[],cspCounts=new Map();
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||undefined});
let fail=0;
try{
for(const item of checks){
  const ctx=await browser.newContext({viewport:{width:item.width,height:844},isMobile:!!item.mobile,hasTouch:!!item.mobile,locale:'tr-TR',serviceWorkers:'block'});
  await ctx.addInitScript(()=>{
    try{localStorage.setItem('ap_cookie_consent','rejected')}catch{}
    window.__apObservedCsp=[];
    document.addEventListener('securitypolicyviolation',event=>{
      let origin='';
      if(event.blockedURI){
        try{origin=new URL(event.blockedURI).origin}catch{origin=String(event.blockedURI).slice(0,40)}
      }
      window.__apObservedCsp.push({disposition:event.disposition,directive:event.effectiveDirective,blockedOrigin:origin});
    });
  });
  const page=await ctx.newPage();
  const row={page:item.name,viewport:item.width,violations:[],incompleteCount:0,cspCount:0,keyboardPass:null,overflowPixels:0,pass:false};
  try{
    const res=await page.goto(SITE+item.slug,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(res?.status(),200,'Unexpected page HTTP status');
    await page.waitForTimeout(250);
    // Axe is executed locally in Chromium. No external accessibility service receives the page.
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const axe=await page.evaluate(async()=>{
      const results=await window.axe.run(document,{
        runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}
      });
      return {
        violations:results.violations.map(v=>({
          id:v.id,impact:v.impact,count:v.nodes.length,
          selectors:v.nodes.slice(0,3).map(n=>String(n.target?.[0]||'').slice(0,130))
        })),
        incompleteCount:results.incomplete.length
      };
    });
    row.violations=axe.violations;
    row.incompleteCount=axe.incompleteCount;
    if(row.violations.length)console.log('A11Y FINDINGS '+item.name+' '+JSON.stringify(row.violations));
    row.overflowPixels=await page.evaluate(()=>Math.max(0,Math.round(
      document.documentElement.scrollWidth-(window.visualViewport?.width||window.innerWidth)
    )));
    const csp=await page.evaluate(()=>window.__apObservedCsp||[]);
    row.cspCount=csp.length;
    for(const v of csp){
      const key=JSON.stringify(v);
      cspCounts.set(key,(cspCounts.get(key)||0)+1);
    }
    // Keyboard interaction is a functional gate, independent of axe's static checks.
    if(item.mobile){
      await page.keyboard.press('Tab');
      assert(await page.evaluate(()=>document.activeElement?.classList.contains('skip-link')),
        'Skip-to-content is not the first keyboard target');
      await page.keyboard.press('Enter');
      const href=await page.locator('.skip-link').getAttribute('href');
      assert.equal(new URL(page.url()).hash,href,'Skip-to-content does not navigate to main content');
      const toggle=page.locator('.mobile-menu-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true','Mobile nav did not expand');
      assert(await page.locator('#ap-site-nav').evaluate(el=>getComputedStyle(el).display!=='none'),'Expanded menu is hidden');
      const more=page.locator('.nav-more summary');
      await more.click();
      assert(await page.locator('.nav-more').evaluate(el=>el.open),'Nested details menu did not open');
      await page.keyboard.press('Escape');
      assert(!await page.locator('.nav-more').evaluate(el=>el.open),'Escape failed to close nested menu');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false','Escape failed to close mobile nav');
      assert(await toggle.evaluate(el=>document.activeElement===el),'Keyboard focus did not return to nav toggle');
      row.keyboardPass=true;
    }
    if(item.name==='nebenkosten-mobile'){
      // An unsupported document must be rejected locally, with no OCR library
      // fetched or file sent to a remote server.
      const network=[];
      const onRequest=request=>network.push(request.url());
      page.on('request',onRequest);
      try{
        const input=page.locator('#nk-upload-file');
        assert.equal(await input.count(),1,'PDF/image file picker missing');
        await input.setInputFiles({name:'not-a-bill.txt',mimeType:'text/plain',buffer:Buffer.from('synthetic test only')});
        await page.locator('#nk-upload-status').getByText(/desteklenmiyor/i).waitFor({timeout:5000});
        assert.equal(network.filter(u=>/tesseract|pdf\.min\.js|\.pdf|not-a-bill/i.test(u)).length,0,
          'Unsupported document unexpectedly loaded OCR or transmitted content');
      }finally{page.off('request',onRequest);}
    }
    // Fail on serious and critical WCAG regressions; moderate findings remain in inventory.
    const blockers=row.violations.filter(x=>x.impact==='serious'||x.impact==='critical');
    assert.equal(blockers.length,0,'Serious or critical axe accessibility violations: '+blockers.map(x=>x.id).join(','));
    if(item.mobile)assert.equal(row.overflowPixels,0,'Mobile document horizontally overflows viewport by '+row.overflowPixels+'px');
    row.pass=true;
    console.log('PASS A11Y '+item.name+' axe violations='+row.violations.length+' CSP='+row.cspCount+' overflow='+row.overflowPixels+'px');

  }catch(e){
    fail++;
    row.error=String(e.message||e).slice(0,500);
    console.error('FAIL A11Y '+item.name+': '+row.error);
  }finally{
    summaries.push(row);
    await ctx.close();
  }
}
}finally{await browser.close();}
const inventory=[...cspCounts].map(([key,count])=>({...JSON.parse(key),count})).sort((a,b)=>b.count-a.count);
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync(report,JSON.stringify({
  date:new Date().toISOString(),site:SITE,
  pageCount:summaries.length,pages:summaries,cspInventory:inventory,
  limitation:'Axe and CSP violations are automated observations. OCR upload, full screen-reader use, third-party partner checkout, and manual WCAG review require separate tests.'
},null,2)+'\n');
console.log('CSP INVENTORY '+JSON.stringify(inventory.slice(0,30)));
console.log('A11Y INVENTORY '+summaries.reduce((n,r)=>n+r.violations.length,0)+' rule-page findings across '+summaries.length+' audited pages');
console.log('Audit saved '+report);
if(fail)process.exitCode=1;
else console.log('PASS browser accessibility/CSP sampling: '+summaries.length+' pages');
