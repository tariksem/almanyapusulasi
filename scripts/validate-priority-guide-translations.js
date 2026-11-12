const fs=require('node:fs'),assert=require('node:assert/strict');
const entries=JSON.parse(fs.readFileSync('data/priority-guide-translations.json','utf8')).items;
const allowed=new Set(['blue-card-suresiz-oturum','kindergeld','familienversicherung']);
assert.deepEqual(new Set(Object.keys(entries)),allowed);
for(const [slug,langs] of Object.entries(entries)){
 const turkish=fs.readFileSync(slug+'/index.html','utf8');
 for(const lang of ['en','de']){
  const d=langs[lang],file=lang+'/'+slug+'/index.html';
  const html=fs.readFileSync(file,'utf8');
  assert.ok(turkish.includes('<h1'),slug+' Turkish source missing');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file+' single h1');
  assert.ok(html.includes('<html lang="'+lang+'">'),file+' language');
  assert.ok(html.includes('<link rel="canonical" href="https://almanyapusulasi.de/'+lang+'/'+slug+'/">'),file+' canonical');
  for(const code of ['tr','en','de'])assert.ok(html.includes('hreflang="'+code+'"'),file+' '+code+' hreflang');
  assert.equal((html.match(/<h2 id="section-/g)||[]).length,d.sections.length,file+' complete sections');
  assert.equal((html.match(/<a href="#section-/g)||[]).length,d.sections.length,file+' TOC matching sections');
  assert.ok(html.includes(d.heading),file+' actual heading');
  assert.ok(html.includes('<header class="site-header"></header>'),file+' shared header');
  assert.ok(html.includes('<footer class="footer"></footer>'),file+' shared footer');
  assert.ok(!html.includes('kolaylaştıran')&&!html.includes('Resmî kaynaklar'),file+' untranslated source');
  for(const href of [...html.matchAll(/href='(\/[a-z0-9-]+\/)'/g)].map(m=>m[1])){
   assert.ok(html.includes('href=\''+href+'\' lang=\'tr\' hreflang=\'tr\''),file+' untranslated linked guide must be marked Turkish '+href);
  }
 }
}
console.log('Priority translations QA passed: 3 complete source-aligned guides in two languages.');
