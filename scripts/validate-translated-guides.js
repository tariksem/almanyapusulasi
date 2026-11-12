const fs=require('node:fs');
const assert=require('node:assert/strict');
const slugs=[['blue-card',11],['chancenkarte-firsat-karti',8]];
const site='https://almanyapusulasi.de';
for(const [slug,count] of slugs){
  const tr=fs.readFileSync(slug+'/index.html','utf8');
  for(const lang of ['en','de']){
    const path=lang+'/'+slug+'/index.html';
    assert.ok(fs.existsSync(path),'Missing translated guide '+path);
    const html=fs.readFileSync(path,'utf8');
    assert.ok(html.includes('<html lang="'+lang+'">'),path+' lang');
    assert.ok(html.includes('<link rel="canonical" href="'+site+'/'+lang+'/'+slug+'/">'),path+' canonical');
    for(const code of ['tr','en','de'])
      assert.ok(html.includes('hreflang="'+code+'"'),path+' alternate '+code);
    const headings=[...html.matchAll(/<h2 id="section-(\d+)">([^<]+)<\/h2>/g)];
    assert.equal(headings.length,count,path+' full section coverage');
    assert.equal(new Set(headings.map(m=>m[1])).size,count,path+' section IDs');
    const toc=[...html.matchAll(/<a href="#section-(\d+)">/g)];
    assert.equal(toc.length,count,path+' table of contents parity');
    assert.ok(html.includes('lang="tr" hreflang="tr"'),path+' Turkish tools clearly labeled');
    assert.ok(html.includes('<header class="site-header"></header>'),path+' shared header');
    assert.ok(html.includes('<footer class="footer"></footer>'),path+' shared footer');
    assert.ok(!html.includes('Bu rehberde'),path+' untranslated navigation');
    assert.ok(!html.includes('<a href="/en/unsupported'),path+' nonexistent link');
  }
  if(slug==='blue-card'){
    assert.ok(tr.includes('sözleşme süresi artı 3 ay'),'Turkish legal validity correction missing');
    for(const lang of ['en','de']){
      const h=fs.readFileSync(lang+'/'+slug+'/index.html','utf8');
      assert.ok(lang==='en'?h.includes('plus three months'):h.includes('zuzüglich drei Monaten'),'Blue Card validity mismatch '+lang);
    }
  }
}
console.log('Translated guide QA passed: 4 complete guide pages, section parity, correct source, hreflang, switches, shared layout.');
