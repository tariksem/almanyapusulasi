const fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const SITE='https://almanyapusulasi.de';
const files=cp.execSync('git ls-files',{encoding:'utf8'}).trim().split(/\r?\n/).filter(p=>p==='index.html'||p.endsWith('/index.html'));
const redirects=new Set(Object.keys(JSON.parse(fs.readFileSync('scripts/redirect-map.json','utf8'))));
const expected=new Set();let blocks=0,scripts=0;
for(const file of files){
  const html=fs.readFileSync(file,'utf8'),path=file==='index.html'?'/':'/'+file.slice(0,-10);
  const canonical=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
  if(!redirects.has(path)&&canonical===SITE+path&&!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html))expected.add(canonical);
  for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/application\/ld\+json/.test(m[1])){JSON.parse(m[2]);blocks++;}
    else if(!/\bsrc=/.test(m[1])&&m[2].trim()){new vm.Script(m[2],{filename:file});scripts++;}
  }
  assert(!/\b(?:window\.)?gtag\(['"]event['"]/.test(html),file+': raw analytics event bypasses consent');
  for(const m of html.matchAll(/href=["'](\/[^"'#?]*)/g)){
    const p=decodeURIComponent(m[1]);if(p.startsWith('//'))continue;
    const rel=p.slice(1);
    assert(!rel||fs.existsSync(rel)||fs.existsSync(rel+'/index.html')||redirects.has(p),file+': missing internal link '+p);
  }
}
const urls=fs.readdirSync('.').filter(p=>/^sitemap-(?!index).*\.xml$/.test(p)).flatMap(p=>[...fs.readFileSync(p,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
assert.deepEqual(new Set(urls),expected,'Sitemap coverage differs from indexable HTML');
const page=fs.readFileSync('chancenkarte-puan-hesaplayici-2026/index.html','utf8');
const calcScript=[...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function result(overrides){
  const values={recognized:'no',formal:'yes',baseLanguage:'yes',finance:'yes',partial:'0',shortage:'0',exp:'0',de:'0',en:'0',age:'2',stay:'0',partner:'0',...overrides},out={};
  const context={document:{getElementById:id=>id==='out'?out:{value:values[id]},documentElement:{classList:{add(){}}}},window:{},URLSearchParams,location:{search:''}};
  vm.runInNewContext(calcScript,context);return out;
}
const recognized=result({recognized:'yes',baseLanguage:'no'});
assert(!recognized.innerHTML.includes('Temel dil')&&!recognized.innerHTML.includes('6 puan'),'Recognized route displays irrelevant requirements');
assert(recognized.innerHTML.includes('tam tanınmış yeterlilik'));
assert.equal(result({recognized:'yes',finance:'no'}).className,'result result-warn');
assert.equal(result({baseLanguage:'no',partial:'4'}).className,'result result-stop');
assert.equal(result({partial:'4'}).className,'result result-ok');
assert(fs.readFileSync('.github/workflows/deploy-cloudflare.yml','utf8').includes('cp data/almanya-2026-esikler.json dist/data/almanya-2026-esikler.json'));
JSON.parse(fs.readFileSync('data/almanya-2026-esikler.json','utf8'));
const news=files.filter(f=>f.startsWith('haberler/')&&!redirects.has('/'+f.slice(0,-10))).map(f=>fs.readFileSync(f,'utf8')).flatMap(t=>[...t.matchAll(/"datePublished":"([^"]+)"/g)].map(m=>m[1])).sort().at(-1);
assert(fs.readFileSync('index.html','utf8').includes('datetime="'+news.slice(0,10)+'"'));
assert(fs.readFileSync('rss.xml','utf8').includes(new Date(news).toUTCString()));
console.log('PASS audit regressions: '+files.length+' HTML files, '+blocks+' valid JSON-LD blocks, '+scripts+' valid inline scripts, '+urls.length+' unique sitemap URLs; Chancenkarte routes, links and news verified.');
