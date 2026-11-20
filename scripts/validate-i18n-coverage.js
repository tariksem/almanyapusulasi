const fs=require('node:fs');
const assert=require('node:assert/strict');
const {curatedRoutes}=require('./i18n-registry.js');
const groups=['priority','migration','family','finance-housing','career','commercial','tools','news'];
const urls=groups.flatMap(g=>[...fs.readFileSync('sitemap-'+g+'.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname));
const pathSet=new Set(urls);
assert.equal(pathSet.size,urls.length,'Duplicate sitemap URLs distort i18n coverage');
const turkish=[...pathSet].filter(p=>!p.startsWith('/en/')&&!p.startsWith('/de/')).sort();
const local=lang=>turkish.filter(p=>pathSet.has('/'+lang+(p==='/'?'/':p)));
const en=local('en'),de=local('de');
const englishMissing=turkish.filter(p=>!en.includes(p));
const germanMissing=turkish.filter(p=>!de.includes(p));
const singleLanguage=turkish.filter(p=>en.includes(p)!==de.includes(p));
const orphanLocalized=[...pathSet].filter(p=>p.startsWith('/en/')||p.startsWith('/de/')).filter(p=>{
 const source=p.replace(/^\/(en|de)/,'');
 return !pathSet.has(source);
}).sort();
assert.deepEqual(orphanLocalized,[],'Localized sitemap URLs without Turkish source: '+orphanLocalized.join(', '));
const published=turkish.filter(p=>en.includes(p)&&de.includes(p));
assert.ok(fs.existsSync('i18n-bulk-verification.json'),'Bulk translations may not count as complete before QA');
const bulkReport=JSON.parse(fs.readFileSync('i18n-bulk-verification.json','utf8'));
assert.equal(bulkReport.status,'automated-structural-functional-language-qa-passed');
assert.equal(bulkReport.routes,185);
const verified=new Set(['/',...curatedRoutes().map(route=>'/'+route+'/'),...bulkReport.verifiedPaths]);
const complete=published.filter(p=>verified.has(p));
const missing=turkish.filter(p=>!complete.includes(p));
const coverage={
  date:new Date().toISOString().slice(0,10),
  turkishPages:turkish.length,
  englishPages:en.length,
  germanPages:de.length,
  completeTopics:complete.length,
  remainingTopics:missing.length,
  missingEnglishPaths:englishMissing,
  missingGermanPaths:germanMissing,
  singleLanguagePaths:singleLanguage,
  orphanLocalizedPaths:orphanLocalized,
  publishedButUnverified:published.filter(p=>!verified.has(p)),
  completePaths:complete,
  missingPaths:missing
};
for(const p of published){
 const tr=p==='/'?'index.html':p.slice(1)+'index.html';
 for(const lang of ['en','de']){
  const loc=lang+(p==='/'?'/index.html':p+'index.html');
  assert.ok(fs.existsSync(loc),'Localized URL indexed without corresponding file: '+loc);
 }
 assert.ok(fs.existsSync(tr),'Turkish source missing for '+p);
}
const essential=['/','/blue-card/','/chancenkarte-firsat-karti/','/kindergeld/','/familienversicherung/','/blue-card-suresiz-oturum/','/almanya-saglik-sigortasi-gkv-pkv/','/almanyada-ev-kiralama-rehberi/'];
for(const p of essential)assert.ok(complete.includes(p),'Essential EN/DE parity missing: '+p);
fs.writeFileSync('i18n-coverage.json',JSON.stringify(coverage,null,2)+'\n');
console.log('i18n coverage: '+complete.length+'/'+turkish.length+' Turkish source URLs have both EN and DE editions; '+missing.length+' still need translation.');
console.log('Missing EN: '+englishMissing.length+'; missing DE: '+germanMissing.length+'; single-language pages: '+singleLanguage.length+'.');
console.log('Remaining pages sample: '+missing.slice(0,20).join(', '));
