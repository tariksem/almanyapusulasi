const fs=require('node:fs');
const cp=require('node:child_process');
const SITE='https://almanyapusulasi.de';
const files=cp.execSync('git ls-files',{encoding:'utf8'}).trim().split(/\r?\n/);
const changed=new Set(cp.execSync('git diff --name-only HEAD',{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim().split(/\r?\n/));
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const redirects=new Map(fs.readFileSync('_redirects','utf8').split(/\r?\n/).map(l=>l.trim().split(/\s+/)).filter(a=>a.length===3&&a[0].startsWith('/')&&/^30[18]$/.test(a[2])).map(a=>[a[0],a[1]]));
const groups=['priority','migration','family','finance-housing','career','commercial','tools','news'];
const memberships=new Map();
const lastmods=new Map();
for(const group of groups){
  const text=fs.readFileSync('sitemap-'+group+'.xml','utf8');
  for(const m of text.matchAll(/<url\s*>([\s\S]*?)<\/url\s*>/g)){
    const url=m[1].match(/<loc\s*>([^<]+)<\/loc\s*>/)?.[1];
    if(url&&!memberships.has(url))memberships.set(url,group);
    const date=m[1].match(/<lastmod\s*>([^<]+)<\/lastmod\s*>/)?.[1];
    if(date&&(!lastmods.has(url)||date>lastmods.get(url)))lastmods.set(url,date);
  }
}
const pages=[];
const news=[];
for(const file of files.filter(f=>f==='index.html'||f.endsWith('/index.html'))){
  const html=fs.readFileSync(file,'utf8');
  const path=file==='index.html'?'/':'/'+file.slice(0,-10);
  if(redirects.has(path)||/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html))continue;
  const canonical=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
  if(canonical!==SITE+path)continue;
  const schemas=[...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));
  const nodes=schemas.flatMap(s=>s['@graph']||[s]);
  const article=nodes.find(s=>s['@type']==='NewsArticle');
  const modified=nodes.map(s=>s.dateModified||s.datePublished).filter(Boolean).sort().at(-1)?.slice(0,10);
  const date=[modified,lastmods.get(canonical),changed.has(file)?new Date().toISOString().slice(0,10):null].filter(Boolean).sort().at(-1);
  pages.push({url:canonical,path,date});
  if(article){
    news.push({url:canonical,title:article.headline,description:article.description||html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1]||'',date:article.datePublished,category:article.articleSection||'Gündem'});
  }
}
pages.sort((a,b)=>a.url.localeCompare(b.url));
function classify(p){
  if(p.path.startsWith('/haberler/'))return 'news';
  if(memberships.has(p.url))return memberships.get(p.url);
  if(/hesaplayici|araci|motoru|kontrolu|planlayici|kontrol-paneli/.test(p.path))return 'tools';
  if(/karsilastirma|versicherung|strom|internet-tarife|girokonto|kredit/.test(p.path))return 'commercial';
  if(/kindergeld|kinderzuschlag|eltern|kinder|kita|aile|mutterschutz/.test(p.path))return 'family';
  if(/blue-card|chancenkarte|vatandas|denklik|goc|gelis|sperrkonto/.test(p.path))return 'migration';
  if(/kariyer|meslek|ausbildung|fahrer|elektroniker|almanca|schulbegleiter|lagerhelfer|sachbearbeiter/.test(p.path))return 'career';
  return 'finance-housing';
}
for(const group of groups){
  const body=pages.filter(p=>classify(p)===group).map(p=>'  <url><loc>'+escape(p.url)+'</loc>'+(p.date?'<lastmod>'+escape(p.date)+'</lastmod>':'')+'</url>').join('\n');
  fs.writeFileSync('sitemap-'+group+'.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+body+'\n</urlset>\n');
}
news.sort((a,b)=>b.date.localeCompare(a.date)||a.url.localeCompare(b.url));
if(news.length){
  const cards=news.slice(0,3).map(n=>'<a class="news-card" href="'+new URL(n.url).pathname+'"><div class="news-card-body"><div class="news-meta"><span class="news-tag">'+escape(n.category)+'</span><time datetime="'+n.date.slice(0,10)+'">'+new Date(n.date.slice(0,10)+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})+'</time></div><h3>'+escape(n.title)+'</h3><p>'+escape(n.description)+'</p><span class="news-read">Haberi ve etkisini oku →</span></div></a>').join('');
  const home=fs.readFileSync('index.html','utf8');
  const updated=home.replace(/(<section class="section news-home">[\s\S]*?<div class="news-grid">)[\s\S]*?(<\/div><\/div><\/section>)/,(_,a,b)=>a+cards+b);
  if(updated===home&&!home.includes(cards))throw new Error('Homepage news block not found');
  fs.writeFileSync('index.html',updated);
  const items=news.map(n=>'<item><title>'+escape(n.title)+'</title><link>'+escape(n.url)+'</link><guid isPermaLink="true">'+escape(n.url)+'</guid><pubDate>'+new Date(n.date).toUTCString()+'</pubDate><category>'+escape(n.category)+'</category><description>'+escape(n.description)+'</description></item>').join('\n');
  fs.writeFileSync('rss.xml','<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Almanya Pusulası — Haberler</title><link>'+SITE+'/haberler/</link><description>Almanya’daki Türkleri ilgilendiren seçilmiş gelişmeler.</description><language>tr</language><lastBuildDate>'+new Date(news[0].date).toUTCString()+'</lastBuildDate>\n'+items+'\n</channel></rss>\n');
}
fs.writeFileSync('scripts/redirect-map.json',JSON.stringify(Object.fromEntries(redirects),null,2)+'\n');
console.log('Generated '+pages.length+' unique sitemap URLs and '+news.length+' news items.');
module.exports={pages,news};
