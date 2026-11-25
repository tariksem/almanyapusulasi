const fs=require('node:fs');
const BASE=['almanyada-yasam','almanyada-yasam/cop-ayristirma-takvimi','almanyada-yasam/kiralik-ev-bulma','almanyada-yasam/komsuluk-ve-sessizlik','almanyada-yasam/arkadas-edinmek','almanyada-yasam/kita-ve-okul','almanyada-yasam/doktor-ve-acil','almanyada-yasam/ogrenci-yasami-ve-butce','almanyada-yasam/adres-kaydi-anmeldung','almanyada-yasam/rundfunkbeitrag','almanyada-yasam/telefon-internet-sozlesmeleri','blue-card','chancenkarte-firsat-karti','blue-card-uygunluk-kontrolu-2026','chancenkarte-puan-hesaplayici-2026'];
const CATALOGS=['data/priority-guide-translations.json','data/i18n-migration-translations.json','data/i18n-career-translations.json','data/i18n-family-translations.json','data/i18n-family-care-translations.json','data/i18n-health-finance-translations.json'];
const BULK_CATALOG='data/i18n-bulk-translations.json';
function curatedRoutes(){
 const result=new Set(BASE);
 for(const path of CATALOGS){
  const entries=JSON.parse(fs.readFileSync(path,'utf8')).items;
  for(const [slug,languages] of Object.entries(entries)){
   if(!/^[a-z0-9-]+$/.test(slug)||!languages.en||!languages.de)throw Error('Incomplete translation catalog: '+slug);
   result.add(slug);
  }
 }
 const news=JSON.parse(fs.readFileSync('data/news-languages.json','utf8')).items;
 for(const [slug,edition] of Object.entries(news)){
  if(!/^[a-z0-9-]+$/.test(slug)||!edition.tr||!edition.en||!edition.de)
   throw new Error('Incomplete multilingual news: '+slug);
  result.add('haberler/'+slug);
 }
 return [...result];
}
function bulkRoutes(){
 if(!fs.existsSync(BULK_CATALOG))return [];
 const catalog=JSON.parse(fs.readFileSync(BULK_CATALOG,'utf8'));
 return Object.keys(catalog.pages||{}).map(route=>{
  if(!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(route))throw Error('Invalid bulk translation route: '+route);
  return route;
 });
}
function translatedRoutes(){return [...new Set([...curatedRoutes(),...bulkRoutes()])];}
function translatedSlugs(){return translatedRoutes();}
function localizedFiles(){
 return ['en','de'].flatMap(lang=>translatedRoutes().map(route=>lang+'/'+route+'/index.html'));
}
module.exports={curatedRoutes,bulkRoutes,translatedRoutes,translatedSlugs,localizedFiles};
