// Diagnostic only: do not mark a page translated solely because a route exists.
// Run after localized HTML generation: node scripts/audit-i18n-visible-text.js
const fs = require('node:fs');
const path = require('node:path');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const urls = [...new Set(groups.flatMap(group => [...fs.readFileSync('sitemap-'+group+'.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname)))];
const sources = urls.filter(url => !/^\/(en|de)\//.test(url));
function filename(url) { return path.join(url === '/' ? '' : url.slice(1), 'index.html'); }
function visible(html) {
  return html.replace(/<(script|style|svg|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<!--[^]*?-->/g,' ').replace(/<[^>]*>/g,' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt);/g,' ').replace(/\s+/g,' ').trim();
}
const findings=[];
for (const url of sources) {
  const trFile=filename(url);
  if (!fs.existsSync(trFile)) continue;
  const tr=visible(fs.readFileSync(trFile,'utf8'));
  for (const lang of ['en','de']) {
    const target='/'+lang+(url==='/'?'/':url);
    const localized=filename(target);
    if (!fs.existsSync(localized)) {
      findings.push({url,lang,reason:'missing-file'});
      continue;
    }
    const html=fs.readFileSync(localized,'utf8');
    const text=visible(html);
    if (tr.length>=200 && tr===text) findings.push({url,lang,reason:'identical-visible-text'});
    if (!new RegExp('<html\\b[^>]*\\blang=["\\']'+lang+'(?:-[^"\\']+)?["\\']','i').test(html))
      findings.push({url,lang,reason:'incorrect-html-lang'});
  }
}
const report={sourcePages:sources.length,checkedAt:new Date().toISOString(),findings,manualReviewRequired:true};
fs.writeFileSync('i18n-visible-text-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('Visible-text audit: '+findings.length+' findings; independent translation review remains required.');
if (findings.length) process.exitCode=1;
