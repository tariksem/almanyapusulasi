// Synthetic, read-only user journey checks for key V4.2 calculators.
// Nothing is submitted to external sites; no analytics consent is granted.
import fs from 'node:fs';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const cases=[
  {path:'/brutto-netto-hesaplayici-2026/',field:'#gross',value:'6500',action:'button[onclick="calc()"]',result:'#out'},
  {path:'/netto-brutto-hesaplayici-2026/',field:'#target',value:'3500',action:'button[onclick="calc()"]',result:'#out'},
  {path:'/almanya-emeklilik-hesaplayici-2026/',field:'#points',value:'55',action:'button[onclick="calc()"]',result:'#out'},
  {path:'/blue-card-uygunluk-kontrolu-2026/',field:'#salary',value:'13000',action:'button[onclick="calc()"]',result:'#result'},
  {path:'/chancenkarte-puan-hesaplayici-2026/',field:'#recognized',value:'yes',action:'button[onclick="calc()"]',result:'#out'}
];
const screenshots='audit-output/v42-tool-flows';
fs.mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||'chrome'});
const failures=[],samples=[];
try{
  for(const mode of [
    {name:'desktop',width:1366,height:820,mobile:false},
    {name:'mobile',width:390,height:844,mobile:true}
  ]){
    const context=await browser.newContext({viewport:{width:mode.width,height:mode.height},isMobile:mode.mobile,hasTouch:mode.mobile,locale:'tr-TR',serviceWorkers:'block'});
    await context.addInitScript(()=>{try{localStorage.setItem('ap_cookie_consent','rejected')}catch{}});
    for(const test of cases){
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',err=>errors.push(String(err.message||err).slice(0,170)));
      try{
        const response=await page.goto(SITE+test.path,{waitUntil:'domcontentloaded',timeout:30000});
        if(response?.status()!==200)throw Error('HTTP '+response?.status());
        await page.locator('.site-header .ap-secondary-nav').waitFor({timeout:12000});
        const result=page.locator(test.result);
        await result.waitFor({state:'attached',timeout:12000});
        const before=(await result.innerText()).trim();
        const input=page.locator(test.field);
        await input.selectOption?.(test.value).catch(()=>{}) ;
        if(await input.evaluate(el=>el.tagName!=='SELECT')) await input.fill(test.value);
        await page.locator(test.action).click();
        const after=(await result.innerText()).trim();
        if(!after||after===before)throw Error('Result unchanged after modifying '+test.field);
        const dimensions=await page.evaluate(()=>({
          viewport:document.documentElement.clientWidth,
          pageWidth:document.documentElement.scrollWidth,
          resultVisible:(()=>{const el=document.querySelector('#out,#result');return !!el&&getComputedStyle(el).display!=='none'})()
        }));
        if(dimensions.pageWidth>dimensions.viewport+25)throw Error('Horizontal overflow '+(dimensions.pageWidth-dimensions.viewport));
        if(!dimensions.resultVisible)throw Error('Result hidden');
        if(errors.length)throw Error('JavaScript error: '+errors.join('; '));
        samples.push({path:test.path,mode:mode.name,changed:true,overflow:dimensions.pageWidth-dimensions.viewport});
        if(test.path==='/brutto-netto-hesaplayici-2026/'){
          await page.screenshot({path:screenshots+'/'+mode.name+'-salary-result.png',animations:'disabled'});
        }
      }catch(e){failures.push(mode.name+' '+test.path+' '+String(e.message||e).slice(0,220))}
      finally{await page.close()}
    }
    await context.close();
  }
}finally{await browser.close()}
const report={tested:samples.length,expected:cases.length*2,failures,samples};
fs.writeFileSync('audit-output/v42-tool-flows.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({tested:report.tested,expected:report.expected,failures},null,2));
if(failures.length)process.exit(1);
