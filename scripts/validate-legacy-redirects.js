const fs=require('fs');
const path=require('path');

const mergeMap=fs.readFileSync('P0-MERGE-MAP.md','utf8');
const redirects=fs.readFileSync('_redirects','utf8');
const mappings=[];
for(const line of mergeMap.split(/\r?\n/)){
  const m=line.match(/^\| \`([^\`]+)\` \| (?:MERGED|NOINDEX\/REDIRECT) \| \`([^\`]+)\`/);
  if(m) mappings.push({source:m[1],destination:m[2]});
}
if(!mappings.length) throw new Error('No merged URL mappings found in P0-MERGE-MAP.md');

const sitemapText=fs.readdirSync('.')
  .filter(x=>/^sitemap.*\.xml$/.test(x))
  .map(x=>fs.readFileSync(x,'utf8'))
  .join('\n');

let failures=[];
for(const {source,destination} of mappings){
  const src=source.endsWith('/')?source:source+'/';
  const base=src.slice(0,-1);
  const dest='https://almanyapusulasi.de'+destination;
  const required=[
    `${src} ${dest} 301`,
    `${base} ${dest} 301`,
    `${src}index.html ${dest} 301`
  ];
  for(const rule of required){
    if(!redirects.includes(rule)) failures.push(`missing redirect: ${rule}`);
  }

  const sourceFile=path.join(src.replace(/^\//,''),'index.html');
  const destFile=path.join(destination.replace(/^\//,''),'index.html');
  if(!fs.existsSync(sourceFile)) failures.push(`missing merged source fallback: ${sourceFile}`);
  if(!fs.existsSync(destFile)) failures.push(`missing redirect destination: ${destFile}`);

  if(fs.existsSync(sourceFile)){
    const html=fs.readFileSync(sourceFile,'utf8');
    if(!html.includes(`rel="canonical" href="${dest}"`)) failures.push(`wrong fallback canonical: ${sourceFile}`);
    if(!html.includes('noindex,follow')) failures.push(`merged fallback must remain noindex,follow: ${sourceFile}`);
  }

  if(sitemapText.includes('https://almanyapusulasi.de'+src)) failures.push(`merged source still appears in XML sitemap: ${src}`);
}

if(failures.length){
  for(const x of failures) console.error('::error::'+x);
  process.exit(1);
}
console.log(`PASS legacy 301 consolidations: ${mappings.length} merged URLs, ${mappings.length*3} redirect variants`);
