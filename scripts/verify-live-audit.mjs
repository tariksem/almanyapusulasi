import fs from 'node:fs';
const SITE='https://almanyapusulasi.de',errors=[];
async function get(url){
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'AlmanyaPusulasi-Audit/1.0'}});
  const body=await response.text();
  return {response,body};
}
function check(condition,message){if(!condition)errors.push(message);}
const hostTests=[
 ['http://almanyapusulasi.de/',308,SITE+'/'],
 ['http://www.almanyapusulasi.de/',308,SITE+'/'],
 ['https://www.almanyapusulasi.de/',308,SITE+'/'],
 ['https://www.almanyapusulasi.de/kindergeld-2026/',301,SITE+'/kindergeld/'],
 [SITE+'/araclar',308,SITE+'/araclar/']
];
await Promise.all(hostTests.map(async([url,status,target])=>{
 const {response}=await get(url);
 const location=response.headers.get('location');
 check(response.status===status&&location&&new URL(location,url).href===target,url+': '+response.status+' -> '+location);
}));
const home=await get(SITE+'/');
check(home.response.status===200,'Homepage status');
for(const header of ['strict-transport-security','content-security-policy','content-security-policy-report-only','x-content-type-options','referrer-policy','permissions-policy'])check(home.response.headers.has(header),'Missing header '+header);
check(home.body.includes('home-hubs-disclosure'),'Mobile topic disclosure missing');
check(!home.body.includes('Search Console verisinde görünmeye'),'Unverified homepage visibility claim remains');
const json=await get(SITE+'/data/almanya-2026-esikler.json');
check(json.response.status===200,'Public dataset status '+json.response.status);
try{JSON.parse(json.body);}catch{errors.push('Public dataset is not valid JSON');}
const schemaPages=['alman-emekli-maasi-turkiyede','almanya-emeklilik-hesaplayici-2026','almanya-emeklilik-sistemi','blue-card-is-kaybi-chancenkarte','emeklilik','lohnsteuerhilfeverein-2026','steuer-software-vergleich-2026','stromanbieter-wechseln-2026','stromtarif-karsilastirma-2026'];
await Promise.all(schemaPages.map(async slug=>{
 const {response,body}=await get(SITE+'/'+slug+'/');check(response.status===200,'Schema page status '+slug);
 for(const m of body.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{JSON.parse(m[1]);}catch{errors.push('Invalid live JSON-LD '+slug);}
}));
const sitemapIndex=await get(SITE+'/sitemap-index.xml');
const childUrls=[...sitemapIndex.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
check(childUrls.length===8,'Sitemap index child count '+childUrls.length);
const maps=await Promise.all(childUrls.map(get));
const urls=maps.flatMap(({body})=>[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
const localUrls=fs.readdirSync('.').filter(p=>/^sitemap-(?!index).*\.xml$/.test(p)).flatMap(p=>[...fs.readFileSync(p,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
check(new Set(urls).size===urls.length,'Duplicate live sitemap URLs');
check(urls.length===localUrls.length&&localUrls.every(u=>urls.includes(u)),'Live sitemap differs from local canonical inventory: '+urls.length+' / '+localUrls.length);
const rss=await get(SITE+'/rss.xml');
check((rss.body.match(/<item>/g)||[]).length===12,'RSS item count');
const privacy=await get(SITE+'/privacy/');
check(privacy.body.includes('“Gizlilik ayarları”'),'Privacy preference label not updated');
const consent=await get(SITE+'/assets/js/analytics-consent.js');
check(consent.body.includes('clearAnalyticsCookies')&&consent.body.includes('ga-disable-'),'Consent withdrawal fix missing');
const commercial=await get(SITE+'/assets/js/commercial-tracking.js');
check(commercial.body.includes('ap:analytics-ready')&&commercial.body.includes('return false'),'Commercial consent fix missing');
const affiliate=await get(SITE+'/assets/js/affiliate-slots.js');
check((affiliate.body.match(/enabled:true/g)||[]).length===18,'Affiliate configuration changed unexpectedly');
const chance=await get(SITE+'/chancenkarte-puan-hesaplayici-2026/');
check(chance.body.includes("checks=recognized?")&&!chance.body.includes("['Temel dil',recognized||lang]"),'Chancenkarte route fix missing');
console.log(JSON.stringify({sitemapUrls:urls.length,jsonStatus:json.response.status,errors},null,2));
if(errors.length)process.exitCode=1;
else console.log('PASS live audit: host redirects, headers, dataset, schema, discovery, consent and affiliate configuration.');
