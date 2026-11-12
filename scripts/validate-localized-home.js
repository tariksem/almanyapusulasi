const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
const sections=['hero','journey-sec','tools-sec','guides-sec','ap-live-discovery','news-home'];
const search=fs.readFileSync('assets/js/local-home-search.js','utf8');
assert.ok(search.includes('findForm')&&search.includes('searchResults'),'Localized search must use original homepage form');
for(const [lang,headline,button] of [['en','Choose the right path for you','Search'],['de','Wählen Sie Ihren passenden Weg','Suchen']]){
 const html=fs.readFileSync(lang+'/index.html','utf8');
 assert.ok(html.includes('<html lang="'+lang+'">'),lang+' language');
 assert.ok(html.includes('<link rel="canonical" href="https://almanyapusulasi.de/'+lang+'/">'),lang+' canonical');
 for(const section of sections){
  assert.ok(source.includes('class="'+section+'"')||source.includes('class="section '+section+'"'),section+' source');
  assert.ok(html.includes('class="'+section+'"')||html.includes('class="section '+section+'"'),section+' localized '+lang);
 }
 assert.ok(html.includes(headline),lang+' journey title');
 assert.ok(html.includes('>'+button+'<'),lang+' search button');
 assert.ok(html.includes('id="findForm"')&&html.includes('id="searchResults"'),lang+' search controls');
 assert.ok(html.includes('/assets/js/local-home-search.js'),lang+' search logic');
 assert.ok(html.includes('href="/'+lang+'/blue-card-uygunluk-kontrolu-2026/"'),lang+' Blue Card tool');
 assert.ok(html.includes('href="/'+lang+'/chancenkarte-puan-hesaplayici-2026/"'),lang+' Opportunity Card tool');
 assert.ok(html.includes('data-tr-only="1"'),lang+' untranslated link notice');
 for(const code of ['tr','en','de'])assert.ok(html.includes('hreflang="'+code+'"'),lang+' hreflang '+code);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,lang+' one H1');
}
console.log('EN/DE homepage structural parity passed: original V4.1 sections, search, same-language calculators and labeled Turkish links.');
