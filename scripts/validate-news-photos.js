// Build-time gate: every recently published editorial story must use a real,
// downloadable and license-audited photograph on every locale and in news cards.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const photos=JSON.parse(fs.readFileSync('data/news-photos.json','utf8')).items;
const editions=JSON.parse(fs.readFileSync('data/news-languages.json','utf8')).items;
const origin='https://almanyapusulasi.de';
const archive=fs.readFileSync('haberler/index.html','utf8');
const home=fs.readFileSync('index.html','utf8');
let checked=0;
for(const slug of Object.keys(editions)){
  const item=photos[slug];
  assert.ok(item,slug+': missing photo manifest entry');
  assert.equal(item.license,'CC0 1.0',slug+': newer article must use audited CC0 image');
  assert.equal(item.licenseUrl,'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.ok(item.page.startsWith('https://commons.wikimedia.org/wiki/File:'),slug+': missing Commons licensing page');
  assert.ok(item.author&&item.alt&&item.altI18n?.en&&item.altI18n?.de,slug+': incomplete image credits');
  assert.equal(item.image,'/assets/news/photos/'+slug+'.jpg');
  const local=item.image.slice(1);
  assert.ok(fs.existsSync(local),slug+': photo was not downloaded');
  const buffer=fs.readFileSync(local);
  assert.ok(buffer.length>10000,slug+': downloaded file is too small');
  assert.ok(buffer[0]===255&&buffer[1]===216&&buffer[2]===255,slug+': downloaded photo is not JPEG');
  for(const lang of ['tr','en','de']){
    const file=(lang==='tr'?'':lang+'/')+'haberler/'+slug+'/index.html';
    const html=fs.readFileSync(file,'utf8');
    const img='<img src="'+item.image+'"';
    const expectedAlt=lang==='tr'?item.alt:item.altI18n[lang];
    assert.ok(html.includes(img),file+': licensed photo missing');
    assert.ok(html.includes('alt="'+expectedAlt.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"'),file+': image alt not localized');
    assert.equal((html.match(/data-news-photo="licensed"/g)||[]).length,1,file+': duplicate photo figure');
    assert.ok(html.includes('href="'+item.page+'"'),file+': photo author link missing');
    assert.ok(html.includes('href="'+item.licenseUrl+'"'),file+': CC0 license link missing');
    assert.ok(html.includes('<meta property="og:image" content="'+origin+item.image+'">'),file+': social image missing');
    const structured=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(structured,file+': missing NewsArticle schema');
    const parsed=JSON.parse(structured[1]);
    assert.deepEqual(parsed.image,[origin+item.image],file+': structured image mismatch');
    checked++;
  }
  const link='/haberler/'+slug+'/';
  const archiveCard=archive.match(new RegExp('<a class="news-card" href="'+link.replaceAll('/','\\/')+'">([\\s\\S]*?)<\\/a>'));
  assert.ok(archiveCard,slug+': not in the Turkish news archive');
  assert.ok(archiveCard[1].includes(item.image),slug+': archive shows category placeholder, not photo');
  if(home.includes('href="'+link+'"')){
    const homeCard=home.match(new RegExp('<a class="news-card" href="'+link.replaceAll('/','\\/')+'">([\\s\\S]*?)<\\/a>'));
    assert.ok(homeCard&&homeCard[1].includes(item.image),slug+': homepage shows placeholder');
  }
}
console.log('News photo QA passed: '+checked+' localized article figures; five image files, legal credits, social metadata, archive/home card images.');
