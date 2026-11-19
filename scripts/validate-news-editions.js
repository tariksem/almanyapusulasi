const fs=require('node:fs');
const assert=require('node:assert/strict');
const {segmentId,translationEntry}=require('./bulk-i18n-lib.js');
const {metaDescription}=require('./news-meta.js');
const data=JSON.parse(fs.readFileSync('data/news-languages.json','utf8'));
const editorial=JSON.parse(fs.readFileSync('data/news-editorial.json','utf8')).items;
const SITE='https://almanyapusulasi.de';
const digits=s=>(String(s).match(/\d+/g)||[]).sort();

// Regression: a double-quoted description must preserve internal Turkish apostrophes.
const electricityHtml=fs.readFileSync('haberler/strom-netzentgelte-2027/index.html','utf8');
assert.equal(metaDescription(electricityHtml),
  data.revisions['strom-netzentgelte-2027'][0].tr,
  'Turkish apostrophe must not truncate the reviewed source summary');
assert.equal(metaDescription(`<meta name="description" content="Kasım'da karar açıklandı">`),
  "Kasım'da karar açıklandı");
assert.equal(metaDescription(`<meta content='Quoted "text" inside description' name='description'>`),
  'Quoted "text" inside description');
assert.equal(Object.keys(data.items).length,5,'Expected the five reviewed news editions');
const officialDomains=new Set(['www.bundesregierung.de','www.bundestag.de','www.bmas.de','www.bundesgesundheitsministerium.de']);
for(const [slug,story] of Object.entries(data.items)){
  assert.match(slug,/^[a-z0-9-]+$/);
  const status=editorial[slug];
  assert.ok(status&&status.state==='published',slug+' must have published editorial record');
  assert.equal(status.source,story.source,slug+' official source mismatch');
  assert.equal(status.sourceDate,story.sourceDate,slug+' official event date mismatch');
  assert.equal(status.verifiedOn,data.verifiedOn);
  assert.equal(status.legalStatus,story.legalStatus);
  assert.ok(status.reviewBy>=data.verifiedOn,slug+' review date expired');
  assert.ok(officialDomains.has(new URL(story.source).hostname),slug+' lacks official primary source');
  for(const field of ['title','description','category']){
    const tr=story.tr[field];
    assert.ok(tr&&story.en[field]&&story.de[field],slug+' missing '+field);
    const item=translationEntry(tr,{});
    assert.ok(item,slug+' source has no registered translation: '+field);
    assert.equal(segmentId(item.tr),segmentId(tr),slug+' source identity changed');
    for(const lang of ['en','de']){
      assert.equal(item[lang],story[lang][field],slug+' translation drift: '+lang+' '+field);
      const trDigits=digits(tr),targetDigits=digits(item[lang]);
      for(const number of new Set(trDigits))
        assert.ok(targetDigits.filter(d=>d===number).length>=trDigits.filter(d=>d===number).length,
          slug+' '+lang+' lost numeric fact '+number+' in '+field);
    }
  }
  for(const lang of ['tr','en','de']){
    const path=(lang==='tr'?'':lang+'/')+'haberler/'+slug+'/index.html';
    const html=fs.readFileSync(path,'utf8');
    const expectedUrl=SITE+(lang==='tr'?'/':'/'+lang+'/')+'haberler/'+slug+'/';
    assert.ok(html.includes('<html lang="'+lang+'">'),path+' language marker');
    assert.ok(html.includes('<link rel="canonical" href="'+expectedUrl+'">'),path+' canonical');
    assert.ok(html.includes('hreflang="tr"')&&html.includes('hreflang="en"')&&html.includes('hreflang="de"'),path+' locale alternates');
    assert.ok(html.includes(story.source),path+' official primary source');
    const json=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(json,path+' missing structured news data');
    const article=JSON.parse(json[1]);
    assert.equal(article['@type'],'NewsArticle');
    assert.equal(article.inLanguage,lang);
    assert.equal(article.mainEntityOfPage,expectedUrl);
    assert.equal(article.headline,story[lang].title);
    assert.equal(article.description,story[lang].description);
    assert.equal(article.datePublished,story.published);
    assert.equal(article.dateModified,data.verifiedOn);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,path+' h1');
    assert.equal((html.match(/<h2\b/g)||[]).length,5,path+' sections');
    assert.equal((html.match(/<li>/g)||[]).length,3,path+' action steps');
    assert.ok(html.includes(story[lang].status),path+' legal-status banner');
  }
}
for(const [slug,patches] of Object.entries(data.revisions||{})){
  const original=fs.readFileSync('haberler/'+slug+'/index.html','utf8');
  assert.equal(editorial[slug].verifiedOn,data.verifiedOn,slug+' correction not verified');
  assert.equal(editorial[slug].state,'published',slug+' corrected source not published');
  for(const item of patches){
    const translated=translationEntry(item.tr,{});
    assert.ok(translated&&translated.en===item.en&&translated.de===item.de,slug+' corrected claim missing translation');
    assert.ok(original.includes(item.tr),slug+' corrected claim no longer in source: '+item.tr);
    for(const lang of ['en','de']){
      const a=digits(item.tr),b=digits(item[lang]);
      for(const d of new Set(a))
        assert.ok(b.filter(x=>x===d).length>=a.filter(x=>x===d).length,
         slug+' '+lang+' lost numeric fact '+d+' in a legal-status correction');
    }
  }
}
console.log('Verified five official-source news editions in TR/EN/DE: 15 full pages, 15 translated headlines/summaries/categories, legal-status labels, dates and action steps.');
