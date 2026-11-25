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
const shell=fs.readFileSync('assets/js/analytics-consent.js','utf8');
const ui=fs.readFileSync('assets/js/i18n-ui.js','utf8');
const registry=fs.readFileSync('scripts/i18n-registry.js','utf8');
assert.ok(ui.includes('function enrichTurkishNavigation()'),'TR site navigation enhancer');
assert.ok(ui.includes('secondary.appendChild(a)'),'TR secondary navigation entry');
assert.ok(ui.includes('"Living in Germany","Alltag in Deutschland","/almanyada-yasam/"'),'EN/DE site nav entry');
assert.ok(registry.includes("'almanyada-yasam'"),'i18n registry entry');
const search=fs.readFileSync('assets/encyclopedia.js','utf8');
for(const token of ['data-filter','aria-pressed','ency-query','ency-empty','normalize('])assert.ok(search.includes(token),'Search/filter functionality: '+token);
console.log('Encyclopedia checks passed: 3 locales, 10 aligned articles, category/search UI, canonical/hreflang, links and shared navigation.');
