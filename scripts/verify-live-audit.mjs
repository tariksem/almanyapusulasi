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
check(home.response.headers.get('strict-transport-security')==='max-age=2592000','30-day HSTS not deployed');
const [allowedEmbed,deniedEmbed]=await Promise.all([
 get(SITE+'/almanya-emeklilik-hesaplayici-2026/?embed=1'),
 get(SITE+'/araclar/?embed=1')
]);
check(allowedEmbed.response.status===200 &&
      allowedEmbed.response.headers.get('content-security-policy')?.includes('https:') &&
      !allowedEmbed.response.headers.has('x-frame-options'),
      'Approved tool iframe embed no longer works');
check(deniedEmbed.response.status===200 &&
      deniedEmbed.response.headers.get('content-security-policy')==="frame-ancestors 'self'" &&
      deniedEmbed.response.headers.get('x-frame-options')==='SAMEORIGIN',
      'Non-tool page can bypass frame protection with ?embed=1');

check(!home.body.includes('Search Console verisinde görünmeye'),'Unverified homepage visibility claim remains');
const json=await get(SITE+'/data/almanya-2026-esikler.json');
check(json.response.status===200,'Public dataset status '+json.response.status);
let officialData=null;
try{officialData=JSON.parse(json.body);}catch{errors.push('Public dataset is not valid JSON');}
check(officialData?.data?.family?.familienversicherung_general_income_monthly===565&&
      officialData?.data?.family?.familienversicherung_minijob_income_monthly===603,
      '2026 family GKV 565/603 thresholds missing from live dataset');
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
const localRss=fs.readFileSync('rss.xml','utf8');
const liveRssGuids=[...rss.body.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)].map(m=>m[1]);
const localRssGuids=[...localRss.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)].map(m=>m[1]);
check(liveRssGuids.length===localRssGuids.length&&localRssGuids.every(id=>liveRssGuids.includes(id)),'Live RSS differs from generated source: '+liveRssGuids.length+' / '+localRssGuids.length);
const privacy=await get(SITE+'/privacy/');
check(privacy.body.includes('“Gizlilik ayarları”'),'Privacy preference label not updated');
const consent=await get(SITE+'/assets/js/analytics-consent.js');
check(consent.body.includes('clearAnalyticsCookies')&&consent.body.includes('ga-disable-'),'Consent withdrawal fix missing');
const commercial=await get(SITE+'/assets/js/commercial-tracking.js');
check(commercial.body.includes('ap:analytics-ready')&&commercial.body.includes('return false'),'Commercial consent fix missing');
const affiliate=await get(SITE+'/assets/js/affiliate-slots.js');
check((affiliate.body.match(/enabled:true/g)||[]).length===18,'Affiliate configuration changed unexpectedly');
const [rentCore,nebenCore,wohngeld,rentPage]=await Promise.all([
  get(SITE+'/assets/js/miet-budget-core.js'),
  get(SITE+'/assets/js/nebenkosten-core.js'),
  get(SITE+'/wohngeld/'),
  get(SITE+'/warmmiete-kira-butcesi-hesaplayici/')
]);
check(rentCore.response.status===200&&rentCore.body.includes('upfrontWithInstalment')&&rentCore.body.includes('depositOverLimit'),'Live housing deposit calculation not deployed');
check(nebenCore.response.status===200&&nebenCore.body.includes('addCalendarMonths')&&!nebenCore.body.includes('addMonthsEndOfMonth'),'Live Nebenkosten day-exact deadline fix not deployed');
check(wohngeld.response.status===200&&wohngeld.body.includes('Bruttokaltmiete (Nettokaltmiete + soğuk işletme giderleri)'),'Live Wohngeld rental-cost guidance not deployed');
check(rentPage.response.status===200&&rentPage.body.includes('id="rent-deposit-note"'),'Live move-in deposit note missing');
const [familyArticle,insuranceCore,insuranceTool,officialThresholds]=await Promise.all([
  get(SITE+'/familienversicherung/'),
  get(SITE+'/assets/js/insurance-priority-core.js'),
  get(SITE+'/sigorta-secim-araci/'),
  get(SITE+'/almanya-2026-resmi-esikler/')
]);
check(familyArticle.response.status===200&&familyArticle.body.includes('ayda 565 €')&&
      familyArticle.body.includes('603 €')&&
      !familyArticle.body.includes('genel olarak ayda 603 euroyu'),
      'Live Familienversicherung 565/603 income correction missing');
check(insuranceCore.response.status===200&&insuranceCore.body.includes('existingLiability')&&
      insuranceCore.body.includes('carMandatory'),
      'Live insurance priority core missing');
check(insuranceTool.response.status===200&&insuranceTool.body.includes('window.InsurancePriorityCore.rank'),
      'Live insurance selection tool not linked to validated ranking core');
check(officialThresholds.response.status===200&&officialThresholds.body.includes('Familienversicherung genel sınırı')&&
      officialThresholds.body.includes('Familienversicherung / Minijob'),
      'Live 2026 data center missing distinct family GKV limits');
const chance=await get(SITE+'/chancenkarte-puan-hesaplayici-2026/');
check(chance.body.includes("checks=recognized?")&&!chance.body.includes("['Temel dil',recognized||lang]"),'Chancenkarte route fix missing');
console.log(JSON.stringify({sitemapUrls:urls.length,jsonStatus:json.response.status,errors},null,2));
if(errors.length)process.exitCode=1;
else console.log('PASS live audit: host redirects, headers, dataset, schema, housing/legal deadlines, discovery, consent and affiliate configuration.');
