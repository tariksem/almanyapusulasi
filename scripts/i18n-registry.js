const fs=require('node:fs');
const BASE=['blue-card','chancenkarte-firsat-karti','blue-card-uygunluk-kontrolu-2026','chancenkarte-puan-hesaplayici-2026'];
const CATALOGS=['data/priority-guide-translations.json','data/i18n-migration-translations.json','data/i18n-career-translations.json','data/i18n-family-translations.json','data/i18n-family-care-translations.json'];
function translatedSlugs(){
 const result=new Set(BASE);
 for(const path of CATALOGS){
  const entries=JSON.parse(fs.readFileSync(path,'utf8')).items;
  for(const [slug,languages] of Object.entries(entries)){
   if(!/^[a-z0-9-]+$/.test(slug)||!languages.en||!languages.de)throw Error('Incomplete translation catalog: '+slug);
   result.add(slug);
  }
 }
 return [...result];
}
function localizedFiles(){
 return ['en','de'].flatMap(lang=>translatedSlugs().map(slug=>lang+'/'+slug+'/index.html'));
}
module.exports={translatedSlugs,localizedFiles};
