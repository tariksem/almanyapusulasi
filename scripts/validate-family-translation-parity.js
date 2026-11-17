const fs=require('node:fs');
const assert=require('node:assert/strict');
const records=JSON.parse(fs.readFileSync('data/i18n-family-translations.json','utf8')).items;
const expected={
 'kindergeld-turkiyedeki-cocuk-2026':{headings:9,fragments:['5,11','12,78','30,68','35,79'],links:['kindergeld','kinderzuschlag']},
 'elterngeld-2026':{headings:13,fragments:['175.000','1.800','900','32'],links:['elternzeit-almanya','familienversicherung']},
 'elternzeit-almanya':{headings:12,fragments:['32','13','7'],links:['elterngeld-2026']}
};
for(const [slug,config] of Object.entries(expected)){
 const src=fs.readFileSync(slug+'/index.html','utf8');
 assert.equal((src.match(/<h2\b/gi)||[]).length,config.headings,slug+' source heading count changed: needs editorial mapping update');
 for(const lang of ['en','de']){
  const translated=records[slug][lang];
  assert.equal(translated.sections.length,config.headings,slug+' '+lang+' every Turkish section must have a counterpart');
  const built=fs.readFileSync(lang+'/'+slug+'/index.html','utf8');
  assert.equal((built.match(/<h2 id="section-/g)||[]).length,config.headings,slug+' '+lang+' rendered sections');
  assert.equal((built.match(/<a href="#section-/g)||[]).length,config.headings,slug+' '+lang+' table of contents');
  for(const link of config.links)assert.ok(built.includes('/'+lang+'/'+link+'/'),slug+' '+lang+' link mismatch: '+link);
  assert.ok(!built.includes('lang="tr">')&&!built.includes('kolaylaştıran'),slug+' '+lang+' Turkish remnants');
 }
}
for(const lang of ['en','de']){
 const html=fs.readFileSync(lang+'/kindergeld-turkiyedeki-cocuk-2026/index.html','utf8');
 for(const n of (lang==='en'?['5.11','12.78','30.68','35.79']:['5,11','12,78','30,68','35,79']))assert.ok(html.includes(n),lang+' Turkish cross-border amount '+n);
 assert.equal((html.match(/<tr>/g)||[]).length,5,'four special payment tiers required');
}
console.log('3-family-topic source-to-translation section parity validated for both EN/DE; special Turkey rates preserved.');
