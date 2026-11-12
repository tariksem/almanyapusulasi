const assert=require('node:assert/strict');
const fs=require('node:fs');
const l=require('../assets/js/i18n-core.js');
const memory={value:null,getItem(){return this.value;},setItem(_key,val){this.value=val;}};
assert.equal(l.normalize('de-CH'),'de');
assert.equal(l.normalize('en_US'),'en');
assert.equal(l.normalize('fr-FR'),null);
assert.equal(l.preferred(memory,['fr-FR','de-DE','en-US']),'de');
assert.equal(l.preferred(memory,['fr-FR']),'tr');
assert.equal(l.setPreference(memory,'en'),true);
assert.equal(l.preferred(memory,['de-DE']),'en');
assert.equal(l.languageFromPath('/en/'),'en');
assert.equal(l.languageFromPath('/de/'),'de');
assert.equal(l.home('en'),'/en/');
assert.equal(l.home('de'),'/de/');
assert.equal(l.home('fr'),'/');
const names=[['index.html','tr','/'],['en/index.html','en','/en/'],['de/index.html','de','/de/']];
for(const [path,lang,uri] of names){
 const html=fs.readFileSync(path,'utf8');
 assert.ok(html.includes('lang="'+lang+'"'),path+' lang');
 assert.ok(html.includes('<link rel="canonical" href="https://almanyapusulasi.de'+uri+'">'),path+' canonical');
 for(const [l,u] of [['tr','/'],['en','/en/'],['de','/de/']])
   assert.ok(html.includes('hreflang="'+l+'" href="https://almanyapusulasi.de'+u+'"'),path+' '+l+' hreflang');
}
const shell=fs.readFileSync('assets/js/analytics-consent.js','utf8');
for(const asset of ['i18n-core.js','i18n-ui.js','i18n.css'])assert.ok(shell.includes(asset),'Shared shell missing '+asset);
const ui=fs.readFileSync('assets/js/i18n-ui.js','utf8');
assert.ok(ui.includes('location.assign(api.home(target))'),'Selection not routed');
assert.ok(ui.includes('location.replace(api.home(pref)'),'Browser preference not routed');
const css=fs.readFileSync('assets/i18n.css','utf8');
assert.ok(css.includes('@media(max-width:650px)'),'Mobile CSS absent');
console.log('i18n foundation checks passed: language normalization, preferences, routes, SEO, shell and responsive CSS.');
