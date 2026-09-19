const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8');}
function must(text,needle,label){if(!text.includes(needle)) throw new Error(label+': missing '+needle);}
const home=read('index.html'),priority=read('sitemap-priority.xml'),family=read('sitemap-family.xml'),commercial=read('sitemap-commercial.xml'),finance=read('sitemap-finance-housing.xml'),indexnow=read('.github/workflows/indexnow.yml');
const opportunity=['/blue-card-uygunluk-kontrolu-2026/','/chancenkarte-puan-hesaplayici-2026/','/kinderzuschlag-uygunluk-kontrolu-2026/','/banka-secim-araci/','/brutto-netto-hesaplayici-2026/'];
for(const p of opportunity){must(home,'href="'+p+'"','homepage acquisition');must(priority,'https://almanyapusulasi.de'+p,'priority sitemap');}
for(const p of ['/kindergeld/','/kindergeld-turkiyedeki-cocuk-2026/','/kinderzuschlag/','/kinderzuschlag-uygunluk-kontrolu-2026/','/wohngeld/']) must(family,'https://almanyapusulasi.de'+p,'family sitemap');
const kindergeld=read('kindergeld/index.html');
must(kindergeld,"Almanya'da çocuk parası ne kadar 2026",'Kindergeld GSC query alignment');
const revenue=['/kredi-secim-araci/','/kredit-karsilastirma-2026/','/kreditkarte-karsilastirma-2026/','/risikolebensversicherung-2026/'];
for(const p of revenue){must(commercial,'https://almanyapusulasi.de'+p,'commercial sitemap');must(finance,'https://almanyapusulasi.de'+p,'finance sitemap');}
must(indexnow,"changed_sitemaps=[p for p in changed if p.startswith('sitemap-')",'IndexNow sitemap discovery');
console.log('PASS acquisition P0');
