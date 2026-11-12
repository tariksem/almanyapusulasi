const fs=require('node:fs');
const assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/news-editorial.json','utf8'));
const asOf=process.env.NEWS_AS_OF||new Date().toISOString().slice(0,10);
const allowed=new Set(['published','archived','review']);
let active=0,archived=0,review=0;
for(const [slug,e] of Object.entries(data.items)){
  assert.match(slug,/^[a-z0-9-]+$/);
  assert.ok(fs.existsSync('haberler/'+slug+'/index.html'),'Missing article: '+slug);
  assert.ok(allowed.has(e.state),'Invalid state: '+slug);
  for(const field of ['reviewBy','expiresOn'])if(e[field])assert.match(e[field],/^\d{4}-\d{2}-\d{2}$/);
  if(e.state==='published'&&e.expiresOn&&e.expiresOn<asOf)archived++;
  else if(e.state==='published')active++;
  else if(e.state==='review')review++;
  else archived++;
}
const required=fs.readdirSync('haberler',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).filter(x=>{
const html=fs.readFileSync('haberler/'+x+'/index.html','utf8');return html.includes('"@type":"NewsArticle"');
});
for(const slug of required)assert.ok(data.items[slug],'Untracked NewsArticle: '+slug);
const hub=fs.readFileSync('haberler/index.html','utf8');
assert.ok(hub.includes('id="arsiv"'),'Archive hub missing');
const expired='ruhr-tren-kapanmasi-ekim-2026';
const start=hub.indexOf('<section class="section news-archive"');
assert.ok(start>0);
assert.ok(hub.slice(start).includes('/haberler/'+expired+'/'),'Expired article missing from archive');
assert.ok(!hub.slice(0,start).includes('/haberler/'+expired+'/'),'Expired article still featured');
const rss=fs.readFileSync('rss.xml','utf8');
assert.ok(!rss.includes('/haberler/'+expired+'/'),'Expired article remains in RSS');
console.log('News editorial QA: '+active+' live, '+archived+' archived, '+review+' under review as of '+asOf);
