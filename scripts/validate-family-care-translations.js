const fs=require('node:fs'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/i18n-family-care-translations.json','utf8')).items;
const refs={'mutterschutz-mutterschaftsgeld':7,'kita-platz-almanya':7,'kinderkrankengeld-2026':6};
for(const [slug,count] of Object.entries(refs)){
 const original=fs.readFileSync(slug+'/index.html','utf8');
 assert.equal((original.match(/<h2\b/g)||[]).length,count,'Turkish source structure changed: '+slug);
 for(const lang of ['en','de']){
  const sections=data[slug][lang].sections;
  assert.equal(sections.length,count,'Missing translated sections: '+lang+'/'+slug);
  const html=fs.readFileSync(lang+'/'+slug+'/index.html','utf8');
  assert.equal((html.match(/<h2 id="section-/g)||[]).length,count,'Missing rendered sections');
  assert.ok(html.includes('hreflang="'+lang+'"'),'Missing reciprocal language reference');
 }
}
for(const lang of ['en','de']){
 const m=fs.readFileSync(lang+'/mutterschutz-mutterschaftsgeld/index.html','utf8');
 const k=fs.readFileSync(lang+'/kinderkrankengeld-2026/index.html','utf8');
 assert.ok(m.includes('13'),'Maternity cap missing');
 for(const n of ['15','30','35','70'])assert.ok(k.includes(n),'Kinderkrankengeld missing '+n);
}
console.log('New family care translations: source structure and statutory figures verified.');
