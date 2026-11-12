const fs=require('node:fs');
const cp=require('node:child_process');
const SITE='https://almanyapusulasi.de';
const editorial=JSON.parse(fs.readFileSync('data/news-editorial.json','utf8')).items;
const today=(process.env.NEWS_AS_OF||new Date().toISOString().slice(0,10));
const editorialState=n=>{const slug=new URL(n.url).pathname.split('/').filter(Boolean).at(-1);const item=editorial[slug];if(!item)throw new Error('Missing editorial record: '+slug);return {...item,state:item.state==='published'&&item.expiresOn&&item.expiresOn<today?'archived':item.state};};

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
const activeNews=news.filter(n=>editorialState(n).state==='published');
const archiveNews=news.filter(n=>editorialState(n).state!=='published');
for(const n of news){
  const e=editorialState(n);
  const file=new URL(n.url).pathname.slice(1)+'index.html';
  const original=fs.readFileSync(file,'utf8');
  const clean=original.replace(/<aside data-editorial-status="true"[\s\S]*?<\/aside>/g,'');
  let html=clean;
  if(e.state!=='published'){
    const label=e.state==='review'?'Güncellik kontrolü bekliyor':'Arşiv kaydı';
    const note=e.note||'Bu haberin güncel durumunu resmî kaynaklardan kontrol edin.';
    const banner='<aside data-editorial-status="true" role="note" style="border-left:4px solid #F57C00;padding:14px 18px;margin:20px 0;background:#fff7ee;color:#102A43"><strong>'+escape(label)+'</strong><p>'+escape(note)+'</p><p>Yayın tarihi geçmiş bir içeriğin bugün geçerli olduğu varsayılmamalıdır.</p></aside>';
    if(!html.includes('<article class="article">'))throw new Error('Article body missing: '+file);
    html=html.replace('<article class="article">','<article class="article">'+banner);
  }
  if(html!==original)fs.writeFileSync(file,html);
}
if(activeNews.length){
  const cards=activeNews.slice(0,3).map(n=>'<a class="news-card" href="'+new URL(n.url).pathname+'"><div class="news-card-body"><div class="news-meta"><span class="news-tag">'+escape(n.category)+'</span><time datetime="'+n.date.slice(0,10)+'">'+new Date(n.date.slice(0,10)+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})+'</time></div><h3>'+escape(n.title)+'</h3><p>'+escape(n.description)+'</p><span class="news-read">Haberi ve etkisini oku →</span></div></a>').join('');
  const home=fs.readFileSync('index.html','utf8');
  const updated=home.replace(/(<section class="section news-home">[\s\S]*?<div class="news-grid">)[\s\S]*?(<\/div><\/div><\/section>)/,(_,a,b)=>a+cards+b);
  if(updated===home&&!home.includes(cards))throw new Error('Homepage news block not found');
  fs.writeFileSync('index.html',updated);
  // News archive is generated from the same NewsArticle metadata as homepage and RSS.
  // This avoids a manually maintained featured story/list becoming stale.
  const formatNewsDate=n=>new Date(n.date.slice(0,10)+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const featured=activeNews[0];
  const featuredBody='<div class="news-meta"><span class="news-tag">'+escape(featured.category)+'</span><time datetime="'+featured.date.slice(0,10)+'">'+formatNewsDate(featured)+'</time></div><h2>'+escape(featured.title)+'</h2><p>'+escape(featured.description)+'</p><a class="btn btn-primary" href="'+new URL(featured.url).pathname+'">Haberi oku →</a>';
  const archiveCards=activeNews.slice(1).map(n=>'<a class="news-card" href="'+new URL(n.url).pathname+'"><div class="news-card-body"><div class="news-meta"><span class="news-tag">'+escape(n.category)+'</span><time datetime="'+n.date.slice(0,10)+'">'+formatNewsDate(n)+'</time></div><h3>'+escape(n.title)+'</h3><p>'+escape(n.description)+'</p><span class="news-read">Haberi oku →</span></div></a>').join('');
  const archive=fs.readFileSync('haberler/index.html','utf8');
  const featurePattern=/(<div class="news-feature"><div class="news-feature-body">)[\s\S]*?(<\/div><\/div><\/div><\/section><section class="section news-latest">)/;
  const archivePattern=/(<section class="section news-latest">[\s\S]*?<div class="news-grid">)[\s\S]*?(<\/div><\/div><\/section>)/;
  if(!featurePattern.test(archive)||!archivePattern.test(archive))throw new Error('News archive feature/list markup not found');
  const archiveSection='<section class="section news-archive" id="arsiv"><div class="container"><div class="section-header"><span class="section-label">Haber arşivi</span><h2>Geçmiş duyurular ve yeniden doğrulama bekleyen haberler</h2><p>Süresi dolmuş haberler tarihsel kayıt olarak korunur. Kontrol bekleyenler güncel haber olarak önerilmez.</p></div><div class="news-grid">'+archiveNews.map(n=>{const e=editorialState(n);const label=e.state==='review'?'Güncellik kontrolü bekliyor':'Arşiv · Süresi doldu';return '<a class="news-card" href="'+new URL(n.url).pathname+'"><div class="news-card-body"><div class="news-meta"><span class="news-tag">'+escape(label)+'</span><time datetime="'+n.date.slice(0,10)+'">'+formatNewsDate(n)+'</time></div><h3>'+escape(n.title)+'</h3><p>'+escape(e.note||n.description)+'</p><span class="news-read">Arşiv kaydını oku →</span></div></a>'}).join('')+'</div></div></section>';
  const refreshed=archive.replace(featurePattern,(_,a,b)=>a+featuredBody+b).replace(archivePattern,(_,a,b)=>a+archiveCards+b).replace(/<section class="section news-archive" id="arsiv">[\s\S]*?<\/section>/,'').replace('<section class="section"><div class="container"><div class="section-header"><span class="section-label">Haberden karara</span>',archiveSection+'<section class="section"><div class="container"><div class="section-header"><span class="section-label">Haberden karara</span>');
  if(!refreshed.includes('id="arsiv"'))throw new Error('Archive insertion failed');
  if(!refreshed.includes('datetime="'+featured.date.slice(0,10)+'"'))throw new Error('News archive featured article was not updated');
  fs.writeFileSync('haberler/index.html',refreshed);
  const items=activeNews.map(n=>'<item><title>'+escape(n.title)+'</title><link>'+escape(n.url)+'</link><guid isPermaLink="true">'+escape(n.url)+'</guid><pubDate>'+new Date(n.date).toUTCString()+'</pubDate><category>'+escape(n.category)+'</category><description>'+escape(n.description)+'</description></item>').join('\n');
  fs.writeFileSync('rss.xml','<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Almanya Pusulası — Haberler</title><link>'+SITE+'/haberler/</link><description>Almanya’daki Türkleri ilgilendiren seçilmiş gelişmeler.</description><language>tr</language><lastBuildDate>'+new Date(activeNews[0].date).toUTCString()+'</lastBuildDate>\n'+items+'\n</channel></rss>\n');
}
fs.writeFileSync('scripts/redirect-map.json',JSON.stringify(Object.fromEntries(redirects),null,2)+'\n');
console.log('Generated '+pages.length+' unique sitemap URLs, '+activeNews.length+' active news, '+archiveNews.length+' archive/review items.');
module.exports={pages,news};
