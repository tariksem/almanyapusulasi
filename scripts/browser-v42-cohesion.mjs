// Real-Chrome visual cohesion regression for the published V4 site.
// Checks shared identity, navigation, responsive overflow and screenshot samples.
// Uses synthetic sessions only: consent is explicitly rejected before page scripts.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const BASE='audit-output/v42-cohesion';
const routes=[
  '/','/goc-kariyer/','/araclar/','/saglik-sigortasi/',
  '/aile-cocuk/','/finans/','/vatandaslik/','/yerlesim/',
  '/blue-card/','/familienversicherung/','/kinderzuschlag/',
  '/private-krankenversicherung-pkv-2026/','/haberler/',
  '/brutto-netto-hesaplayici-2026/','/chancenkarte-puan-hesaplayici-2026/',
  '/nebenkosten-abrechnung-kontrolu/','/warmmiete-kira-butcesi-hesaplayici/',
  '/almanca-mektup-asistani/'
];
const captures=new Set([
  '/','/goc-kariyer/','/blue-card/','/familienversicherung/',
  '/araclar/','/brutto-netto-hesaplayici-2026/',
  '/nebenkosten-abrechnung-kontrolu/','/haberler/'
]);
fs.mkdirSync(BASE,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||'chrome'});
const failures=[],warnings=[],samples=[];
try{
  for(const mode of [{name:'desktop',width:1360,height:850,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]){
    const context=await browser.newContext({viewport:{width:mode.width,height:mode.height},isMobile:mode.mobile,hasTouch:mode.mobile,locale:'tr-TR',serviceWorkers:'block'});
    await context.addInitScript(()=>{try{localStorage.setItem('ap_cookie_consent','rejected')}catch{}});
    for(const route of routes){
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',err=>errors.push(String(err.message||err).slice(0,160)));
      try{
        const response=await page.goto(SITE+route,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(response?.status(),200,route+' HTTP status');
        await page.locator('.site-header .ap-secondary-nav').waitFor({timeout:12000});
        await page.locator('.footer .footer-grid').waitFor({timeout:12000});
        await page.waitForTimeout(220);
        const values=await page.evaluate(()=>{
          const header=document.querySelector('.site-header');
          const logo=header?.querySelector('img.site-brand-logo');
          const nav=header?.querySelector('.ap-secondary-nav');
          const footer=document.querySelector('.footer');
          const h=header?.getBoundingClientRect();
          const l=logo?.getBoundingClientRect();
          const styles=header?getComputedStyle(header):null;
          return {
            headerCount:document.querySelectorAll('.site-header').length,
            footerCount:document.querySelectorAll('footer.footer').length,
            logo:logo?.getAttribute('src')||'',
            logoWidth:l?.width||0,
            headerHeight:h?.height||0,
            bg:styles?.backgroundColor||'',
            navLinks:nav?.querySelectorAll('a').length||0,
            footerLinks:footer?.querySelectorAll('a').length||0,
            viewport:document.documentElement.clientWidth,
            pageWidth:document.documentElement.scrollWidth,
            unified:document.body.classList.contains('ap-unified'),
            headingCount:document.querySelectorAll('h1').length,
            appLoaded:!!document.querySelector('link[href*="v42-unified.css"]')
          };
        });
        const row={route,viewport:mode.name,...values,pageErrors:errors};
        samples.push(row);
        if(values.headerCount!==1||values.footerCount!==1)failures.push(mode.name+' '+route+' duplicate/missing global shell');
        if(values.navLinks<7||values.footerLinks<6)failures.push(mode.name+' '+route+' incomplete shared navigation/footer');
        if(!values.logo.includes('almanya-pusulasi-logo-64.png')||values.logoWidth<30)failures.push(mode.name+' '+route+' incorrect or missing canonical logo');
        if(values.headingCount!==1)failures.push(mode.name+' '+route+' H1 count '+values.headingCount);
        if(values.pageWidth>values.viewport+25)warnings.push(mode.name+' '+route+' horizontal overflow '+(values.pageWidth-values.viewport)+'px');
        if(route!=='/'&&!['/blue-card/','/goc-kariyer/','/brutto-netto-hesaplayici-2026/'].includes(route)&&!values.unified)failures.push(mode.name+' '+route+' unified theme class missing');
        if(!values.appLoaded)failures.push(mode.name+' '+route+' central stylesheet not loaded');
        if(errors.length)failures.push(mode.name+' '+route+' JS runtime errors: '+errors.join(' | '));
        if(captures.has(route)){
          const label=route==='/'?'home':route.replaceAll('/','-').slice(1,-1);
          await page.screenshot({path:path.join(BASE,mode.name+'-'+label+'.png'),animations:'disabled'});
        }
      }catch(err){failures.push(mode.name+' '+route+' '+String(err.message||err).slice(0,180))}
      finally{await page.close()}
    }
    await context.close();
  }
}finally{await browser.close()}
const report={tested:samples.length,totalExpected:routes.length*2,failures,warnings,samples};
fs.writeFileSync('audit-output/v42-browser-cohesion.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({tested:report.tested,expected:report.totalExpected,failures,warnings: warnings.slice(0,25)},null,2));
if(failures.length)process.exit(1);
