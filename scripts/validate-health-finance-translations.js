const fs=require('node:fs'), assert=require('node:assert/strict');
const items=JSON.parse(fs.readFileSync('data/i18n-health-finance-translations.json','utf8')).items;
const sourceSections={'wohngeld':11,'krankenkasse-degistirme':8,'is-birakinca-saglik-sigortasi':11};
for(const [slug,num] of Object.entries(sourceSections)){
 const original=fs.readFileSync(slug+'/index.html','utf8');
 assert.equal((original.match(/<h2\b/g)||[]).length,num,'Source H2 structure changed: '+slug);
 for(const lang of ['en','de']){
  assert.equal(items[slug][lang].sections.length,num,'Translation missing H2 sections: '+slug+' '+lang);
  const html=fs.readFileSync(lang+'/'+slug+'/index.html','utf8');
  assert.equal((html.match(/<h2 id="section-/g)||[]).length,num,'Rendered translated H2 mismatch');
  for(const l of ['tr','en','de'])assert.ok(html.includes('hreflang="'+l+'"'),'Hreflang missing');
 }
}
for(const lang of ['en','de']){
 const switcher=fs.readFileSync(lang+'/krankenkasse-degistirme/index.html','utf8');
 assert.ok(switcher.includes('12'),'Membership switch threshold missing');
 assert.ok(switcher.includes('Wahltarif Krankengeld'),'Important special-case exception missing');
 const job=fs.readFileSync(lang+'/is-birakinca-saglik-sigortasi/index.html','utf8');
 assert.ok(job.includes(lang==='en'?'1,318.33':'1.318,33'),'Minimum assessment base missing');
 assert.ok(job.includes(lang==='en'?'222.80':'222,80'),'Health contribution example missing');
 const w=fs.readFileSync(lang+'/wohngeld/index.html','utf8');
 assert.ok(w.includes('Bruttokaltmiete')&&w.includes('Kinderzuschlag'),'Wohngeld key concepts missing');
}
console.log('Wohngeld and GKV switching 2026: source section counts and key values verified.');
