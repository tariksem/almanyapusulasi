// Diagnostic only: identical metadata can indicate untranslated localized pages.
// Run after localized HTML generation: node scripts/audit-i18n-metadata.js
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const urls = groups.flatMap(group => [...fs.readFileSync('sitemap-'+group+'.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname));
const paths = new Set(urls);
const decode = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
function metadata(file) {
  const html = fs.readFileSync(file,'utf8');
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description = [...html.matchAll(/<meta\b[^>]*>/gi)].find(match => /\bname\s*=\s*["']description["']/i.test(match[0]));
  const value = description && description[0].match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i);
  return {title: title ? decode(title[1]) : '',description: value ? decode(value[2]) : ''};
}
const findings = [];
for(const source of paths) {
  if(source.startsWith('/en/') || source.startsWith('/de/')) continue;
  const sourceFile = source==='/' ? 'index.html' : path.join(source.slice(1),'index.html');
  if(!fs.existsSync(sourceFile)) continue;
  const tr = metadata(sourceFile);
  for(const lang of ['en','de']) {
    const localized = '/'+lang+(source==='/'?'/':source);
    if(!paths.has(localized)) continue;
    const file = path.join(lang,source==='/'?'index.html':path.join(source.slice(1),'index.html'));
    if(!fs.existsSync(file)) {findings.push({source,lang,problem:'missing-file'});continue;}
    const target = metadata(file);
    for(const field of ['title','description']) {
      if(!target[field]) findings.push({source,lang,problem:'missing-'+field});
      else if(tr[field] && target[field]===tr[field]) findings.push({source,lang,problem:'identical-'+field});
    }
  }
}
const report = {checkedAt:new Date().toISOString(),status:'diagnostic-not-editorial-approval',findings};
if(process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
else {
 console.log('Localized metadata diagnostic: '+findings.length+' findings (identical text requires editorial review; not automatic proof of missing translation).');
 for(const finding of findings.slice(0,40)) console.log(finding.lang+' '+finding.source+' '+finding.problem);
}
assert.equal(findings.filter(f=>f.problem==='missing-file').length,0,'Sitemap references missing localized HTML');
if(process.argv.includes('--strict')) assert.equal(findings.length,0,'Localized metadata requires review');
