// Living in Germany encyclopedia: locale, navigation, and search/filter contract.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const api=require('../assets/js/i18n-core.js');
const routes={tr:'almanyada-yasam/index.html',en:'en/almanyada-yasam/index.html',de:'de/almanyada-yasam/index.html'};
const paths={tr:'/almanyada-yasam/',en:'/en/almanyada-yasam/',de:'/de/almanyada-yasam/'};
const items=['muell','wohnung','nachbarn','freunde','kita','gesundheit','student','anmeldung','rundfunk','vertrag'];
for(const [lang,path] of Object.entries(routes)){
 const s=fs.readFileSync(path,'utf8');
 assert.ok(s.includes('<html lang="'+lang+'">'),path+' language');
 assert.ok(s.includes('rel="canonical" href="https://almanyapusulasi.de'+paths[lang]+'"'),path+' canonical');
 for(const [other,uri] of Object.entries(paths)){
  assert.ok(s.includes('hreflang="'+other+'" href="https://almanyapusulasi.de'+uri+'"'),path+' alternate '+other);
  assert.ok(s.includes('href="'+uri+'"'),path+' accessible language link '+other);
 }
 assert.equal((s.match(/class="ency-card"/g)||[]).length,10,path+' article count');
 for(const id of items)assert.ok(s.includes('id="'+id+'"'),path+' item '+id);
 for(const cat of ['home','social','family','student','new'])assert.ok(s.includes('data-filter="'+cat+'"'),path+' category '+cat);
 for(const asset of ['/assets/style.css','/assets/encyclopedia.css','/assets/encyclopedia.js','/assets/js/analytics-consent.js'])assert.ok(s.includes(asset),path+' asset '+asset);
 assert.ok(s.includes('id="ency-query"'),path+' search');
 assert.ok(s.includes('id="ency-empty"'),path+' no-results state');
 assert.ok(s.includes('https://verwaltung.bund.de/'),path+' official source');
 for(const other of Object.keys(paths)) assert.equal(api.equivalent(paths[lang],other),paths[other],lang+' -> '+other+' language switch');
}
// Each article is a standalone, source-backed page in three languages.
const chapters=['cop-ayristirma-takvimi','kiralik-ev-bulma','komsuluk-ve-sessizlik','arkadas-edinmek','kita-ve-okul','doktor-ve-acil','ogrenci-yasami-ve-butce','adres-kaydi-anmeldung','rundfunkbeitrag','telefon-internet-sozlesmeleri'];
for(const slug of chapters){
 const relatedPaths={tr:'/almanyada-yasam/'+slug+'/',en:'/en/almanyada-yasam/'+slug+'/',de:'/de/almanyada-yasam/'+slug+'/'};
 for(const [lang,route] of Object.entries(relatedPaths)){
  const file=route.slice(1)+'index.html';
  assert.ok(fs.existsSync(file),'Missing encyclopedia article '+file);
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('<html lang="'+lang+'">'),file+' language');
  assert.ok(html.includes('rel="canonical" href="https://almanyapusulasi.de'+route+'"'),file+' canonical');
  for(const [code,target] of Object.entries(relatedPaths)){
   assert.ok(html.includes('hreflang="'+code+'" href="https://almanyapusulasi.de'+target+'"'),file+' alternate '+code);
   assert.equal(api.equivalent(route,code),target,file+' cross-language route '+code);
  }
  assert.ok((html.match(/<section id="section-[1-4]">/g)||[]).length===4,file+' four explanatory sections');
  assert.ok((html.match(/data-ency-check=/g)||[]).length===3,file+' actionable checklist');
  for(const required of ['id="glossary"','id="sources"','id="checklist"','class="ency-related"','/assets/js/analytics-consent.js'])assert.ok(html.includes(required),file+' missing '+required);
  assert.ok(fs.readFileSync(routes[lang],'utf8').includes('href="'+route+'"'),routes[lang]+' does not link to article '+slug);
 }
}
// Source-referenced practical layers for the first four everyday-life topics.
const expandedChapters=['kiralik-ev-bulma','cop-ayristirma-takvimi','kita-ve-okul','adres-kaydi-anmeldung'];
for(const slug of expandedChapters){
 for(const lang of ['tr','en','de']){
  const file=(lang==='tr'?'':lang+'/')+'almanyada-yasam/'+slug+'/index.html';
  const source=fs.readFileSync(file,'utf8');
  for(const token of ['id="practical"','id="faq"','class="ency-steps"','class="ency-evidence"','href="#practical"','href="#faq"']){
   assert.ok(source.includes(token),file+' missing practical content '+token);
  }
  assert.ok((source.match(/<details><summary>/g)||[]).length>=2,file+' requires at least two common questions');
  assert.ok((source.match(/<li><p>/g)||[]).length>=4,file+' requires at least four practical steps');
 }
}
const shell=fs.readFileSync('assets/js/analytics-consent.js','utf8');
const ui=fs.readFileSync('assets/js/i18n-ui.js','utf8');
const registry=fs.readFileSync('scripts/i18n-registry.js','utf8');
assert.ok(ui.includes('function enrichTurkishNavigation()'),'TR site navigation enhancer');
assert.ok(ui.includes('secondary.appendChild(a)'),'TR secondary navigation entry');
assert.ok(ui.includes('"Living in Germany","Alltag in Deutschland","/almanyada-yasam/"'),'EN/DE site nav entry');
assert.ok(registry.includes("'almanyada-yasam'"),'i18n registry entry');
const search=fs.readFileSync('assets/encyclopedia.js','utf8');
for(const token of ['data-filter','aria-pressed','ency-query','ency-empty','normalize('])assert.ok(search.includes(token),'Search/filter functionality: '+token);
console.log('Encyclopedia checks passed: 10 subject summaries + 30 detailed guides, 3 locales, 120 explanatory sections, 90 checklist items, canonical/hreflang, links and shared navigation.');
