const fs=require('node:fs');
const assert=require('node:assert/strict');
const shell=fs.readFileSync('assets/js/analytics-consent.js','utf8');
const script=fs.readFileSync('assets/js/local-search.js','utf8');
const css=fs.readFileSync('assets/i18n.css','utf8');
assert.match(script,/addEventListener\("submit"/);
assert.match(script,/addEventListener\("input"/);
assert.match(script,/\.dataset\.search/);
assert.match(css,/\.ap-topic-card\[hidden\]/);
assert.match(css,/@media\(max-width:650px\)/);
assert.ok(shell.includes('Localized landing pages are rendered by i18n-ui'));
const expected=[['en','Search',"I'm moving to Germany"],['de','Suchen','Ich möchte nach Deutschland']];
for(const [lang,button,journey] of expected){
 const html=fs.readFileSync(lang+'/index.html','utf8');
 for(const needle of ['id="ap-local-search"','id="ap-local-search-input"','id="ap-guide-results"','id="ap-no-results"','id="migration"','id="living"','id="family"','id="tools"','id="news"','/assets/js/local-search.js',button,journey]){
  assert.ok(html.includes(needle),lang+' missing '+needle);
 }
 const cards=[...html.matchAll(/<article class="ap-locale-card ap-topic-card" id="([^"]+)"[^>]*data-search="([^"]+)"/g)];
 assert.equal(cards.length,6,lang+' must have six searchable cards');
 const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
 for(const href of [...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1])){
  assert.ok(ids.has(href),lang+' broken local anchor #'+href);
 }
 for(const m of [...html.matchAll(/<a[^>]+href="(\/[^"]+)"[^>]*>/g)]){
  assert.ok(m[0].includes('lang="tr"')&&m[0].includes('hreflang="tr"'),lang+' Turkish guide link must be labeled as Turkish: '+m[0]);
 }
 assert.ok(html.includes('on this page')||html.includes('auf dieser Seite'),lang+' missing language coverage transparency');
}
const ui=fs.readFileSync('assets/js/i18n-ui.js','utf8');
assert.ok(ui.includes('ap-local-header-nav'), 'Localized navigation missing');
console.log('Localized EN/DE homepage QA: six searchable cards each, no broken anchors, explicit Turkish links, responsive navigation.');
