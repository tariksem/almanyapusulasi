const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8');}
function must(text,needle,label){if(!text.includes(needle)) throw new Error(label+': missing '+needle);}
const home=read('index.html'),priority=read('sitemap-priority.xml'),family=read('sitemap-family.xml'),commercial=read('sitemap-commercial.xml'),finance=read('sitemap-finance-housing.xml'),indexnow=read('.github/workflows/indexnow.yml'),redirects=read('_redirects');
const opportunity=['/blue-card-uygunluk-kontrolu-2026/','/chancenkarte-puan-hesaplayici-2026/','/kinderzuschlag-uygunluk-kontrolu-2026/','/banka-secim-araci/','/brutto-netto-hesaplayici-2026/'];
const allSitemaps=fs.readdirSync('.').filter(p=>/^sitemap-(?!index).*\.xml$/.test(p)).map(read).join('\n');
for(const p of opportunity){must(home,'href="'+p+'"','homepage acquisition');const needle='https://almanyapusulasi.de'+p;must(priority,needle,'priority sitemap');const entry=priority.match(new RegExp('<url><loc>'+needle+'<\/loc><lastmod>([^<]+)<\/lastmod><\/url>'));if(!entry||entry[1]<'2026-09-19')throw new Error('priority freshness '+p);}
for(const p of ['/kindergeld/','/kindergeld-turkiyedeki-cocuk-2026/','/kinderzuschlag/','/kinderzuschlag-uygunluk-kontrolu-2026/','/wohngeld/']) must(allSitemaps,'https://almanyapusulasi.de'+p,'sitemap coverage');
const kindergeld=read('kindergeld/index.html');
must(kindergeld,"Almanya'da çocuk parası ne kadar 2026",'Kindergeld GSC query alignment');
must(redirects,'/kindergeld-2026/ https://almanyapusulasi.de/kindergeld/ 301','Kindergeld legacy 301');
must(redirects,'/kindergeld-2026/index.html https://almanyapusulasi.de/kindergeld/ 301','Kindergeld legacy index 301');
const revenue=['/kredi-secim-araci/','/kredit-karsilastirma-2026/','/kreditkarte-karsilastirma-2026/','/risikolebensversicherung-2026/'];
for(const p of revenue)must(allSitemaps,'https://almanyapusulasi.de'+p,'revenue sitemap coverage');
must(indexnow,"changed_sitemaps=[p for p in changed if p.startswith('sitemap-')",'IndexNow sitemap discovery');
console.log('PASS acquisition P0');
