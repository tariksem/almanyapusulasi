const fs=require('node:fs');
const path=require('node:path');
const {translatedRoutes}=require('./i18n-registry.js');
const {fileFromPath,translatedHtml}=require('./bulk-i18n-lib.js');

const CATALOG='data/i18n-bulk-translations.json';
const catalog=JSON.parse(fs.readFileSync(CATALOG,'utf8'));
const routes=new Set(translatedRoutes());
const pages=Object.entries(catalog.pages||{});
const strings=catalog.strings||{};

if(pages.length!==185)throw new Error('Bulk catalog must contain the 185 verified backlog routes; found '+pages.length);
for(const [id,entry] of Object.entries(strings)){
  if(!entry.tr||!entry.en||!entry.de)throw new Error('Incomplete bulk translation string '+id);
}

for(const [route,page] of pages){
  if(!routes.has(route))throw new Error('Bulk route missing from publishing registry: '+route);
  const sourceFile=page.sourceFile||fileFromPath(page.path);
  const source=fs.readFileSync(sourceFile,'utf8');
  for(const lang of ['en','de']){
    const html=translatedHtml(source,{lang,translations:strings,routes});
    const output=path.join(lang,route,'index.html');
    fs.mkdirSync(path.dirname(output),{recursive:true});
    fs.writeFileSync(output,html);
  }
}

const runtimeIds=new Set(pages.flatMap(([,page])=>page.runtime||[]));
for(const lang of ['en','de']){
  const runtime={};
  for(const id of runtimeIds){
    const entry=strings[id];
    if(!entry||!entry[lang])throw new Error('Runtime translation missing: '+id+' '+lang);
    if(Object.hasOwn(runtime,entry.tr)&&runtime[entry.tr]!==entry[lang]){
      throw new Error('Conflicting runtime translations for '+lang+': '+entry.tr);
    }
    runtime[entry.tr]=entry[lang];
  }
  const output='assets/data/bulk-i18n-'+lang+'.json';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify({lang,routes:[...routes],translations:runtime})+'\n');
}

const coreFile='assets/js/i18n-core.js';
const core=fs.readFileSync(coreFile,'utf8');
const routeLiteral=JSON.stringify([...routes]);
const updated=core.replace(/const translatedRoutes=new Set\((\[[^;]+\])\);/,'const translatedRoutes=new Set('+routeLiteral+');');
if(updated===core&&!core.includes('const translatedRoutes=new Set('+routeLiteral+');'))throw new Error('Browser route registry marker missing');
fs.writeFileSync(coreFile,updated);

console.log('Generated '+pages.length*2+' bulk EN/DE pages, '+runtimeIds.size+' runtime UI translations and '+routes.size+' same-language routes.');
