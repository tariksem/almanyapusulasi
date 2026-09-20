const fs=require('fs');

const expected=[
  'sitemap-priority.xml',
  'sitemap-migration.xml',
  'sitemap-family.xml',
  'sitemap-finance-housing.xml',
  'sitemap-career.xml',
  'sitemap-commercial.xml',
  'sitemap-tools.xml',
  'sitemap-news.xml'
];

function locs(file){
  const text=fs.readFileSync(file,'utf8');
  if(!/<sitemapindex\b/.test(text)) throw new Error(file+': root is not sitemapindex');
  const out=[...text.matchAll(/<loc>https:\/\/almanyapusulasi\.de\/([^<]+)<\/loc>/g)].map(m=>m[1]);
  if(new Set(out).size!==out.length) throw new Error(file+': duplicate sitemap entries');
  for(const name of out){
    if(name==='sitemap.xml'||name==='sitemap-index.xml') throw new Error(file+': nested sitemap index reference '+name);
    if(!fs.existsSync(name)) throw new Error(file+': referenced file missing '+name);
    const child=fs.readFileSync(name,'utf8');
    if(!/<urlset\b/.test(child)) throw new Error(file+': child is not URL sitemap '+name);
  }
  return out;
}

for(const file of ['sitemap-index.xml','sitemap.xml']){
  const actual=locs(file);
  const missing=expected.filter(x=>!actual.includes(x));
  const extra=actual.filter(x=>!expected.includes(x));
  if(missing.length||extra.length) throw new Error(file+': structure mismatch missing='+missing.join(',')+' extra='+extra.join(','));
}

const robots=fs.readFileSync('robots.txt','utf8');
const sitemapLines=robots.split(/\r?\n/).filter(x=>/^Sitemap:/i.test(x.trim())).map(x=>x.trim());
const expectedRobot=[
  'Sitemap: https://almanyapusulasi.de/sitemap-index.xml',
  'Sitemap: https://almanyapusulasi.de/rss.xml'
];
if(JSON.stringify(sitemapLines)!==JSON.stringify(expectedRobot)){
  throw new Error('robots.txt sitemap declarations must contain only primary sitemap index + RSS feed');
}
if(!fs.existsSync('rss.xml')) throw new Error('rss.xml missing');
console.log('PASS sitemap structure: one primary index, no nested indexes, RSS submitted separately');
