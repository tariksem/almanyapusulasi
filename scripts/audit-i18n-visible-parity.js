// Diagnostic audit: identical long visible paragraphs in Turkish and localized HTML.
// This is not a linguistic accuracy test. Review flagged passages manually.
const fs = require('node:fs');
const path = require('node:path');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const decode = s => s.replace(/&(?:nbsp|amp|lt|gt|quot|#39|#x27);/gi, m => ({
  '&nbsp;':' ', '&amp;':'&', '&lt;':'<', '&gt;':'>', '&quot;':'"', '&#39;':"'", '&#x27;':"'"
})[m.toLowerCase()] || m);
function paragraphs(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ')
    .replace(/<\/?(?:br|p|div|section|article|li|h[1-6]|td|th)\b[^>]*>/gi,'\n')
    .replace(/<[^>]*>/g,' ');
  return [...new Set(decode(clean).split(/\n+/).map(s => s.replace(/\s+/g,' ').trim())
    .filter(s => s.length >= 100 && s.split(/\s+/).length >= 12))];
}
function htmlFile(urlPath) {
  return urlPath === '/' ? 'index.html' : path.join(urlPath.slice(1),'index.html');
}
const sourcePaths = new Set();
for (const group of groups) {
  const xml = fs.readFileSync('sitemap-'+group+'.xml','utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(match[1]).pathname;
    if (!/^\/(?:en|de)\//.test(pathname)) sourcePaths.add(pathname);
  }
}
const findings=[], missing=[];
for (const source of [...sourcePaths].sort()) {
  const trFile = htmlFile(source);
  if (!fs.existsSync(trFile)) { missing.push({source,language:'tr',file:trFile}); continue; }
  const originals = new Set(paragraphs(fs.readFileSync(trFile,'utf8')));
  for (const language of ['en','de']) {
    const localized = '/'+language+(source === '/' ? '/' : source);
    const targetFile = htmlFile(localized);
    if (!fs.existsSync(targetFile)) { missing.push({source,language,file:targetFile}); continue; }
    const target = paragraphs(fs.readFileSync(targetFile,'utf8'));
    const identical = target.filter(s => originals.has(s));
    if (identical.length) findings.push({source,language,identicalCount:identical.length,
      samples:identical.slice(0,3).map(s=>s.slice(0,240))});
  }
}
const report = {sourceCount:sourcePaths.size,checkedLocalizedPages:sourcePaths.size*2-missing.filter(x=>x.language!=='tr').length,
  missing, flaggedPages:findings.length, findings,
  limitation:'Identical long visible paragraphs are review candidates; absence of flags does not establish translation accuracy.'};
const json=JSON.stringify(report,null,2)+'\n';
if (process.argv.includes('--json')) process.stdout.write(json);
else console.log('Visible text parity audit: '+report.flaggedPages+' flagged localized pages; '+missing.length+' missing files. Use --json for details.');
if (process.argv.includes('--strict') && (findings.length || missing.length)) process.exitCode=1;
