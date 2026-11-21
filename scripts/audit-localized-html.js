#!/usr/bin/env node
'use strict';
// Post-generation structural audit; does not certify translation accuracy.
const fs = require('node:fs');
const path = require('node:path');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const failures = [];
const results = {checked:0,byLanguage:{en:0,de:0},missing:0,wrongLang:0,wrongCanonical:0,missingHreflang:0,blockedIndexing:0};
const unique = new Set();
const expectedOrigin = 'https://almanyapusulasi.de';
let localizedCount = 0;
function attr(tag, name) {
  const match = tag.match(new RegExp('\\b'+name+'\\s*=\\s*["\\x27]([^"\\x27]*)["\\x27]', 'i'));
  return match ? match[1] : '';
}
for (const group of groups) {
  const sitemap = 'sitemap-'+group+'.xml';
  if (!fs.existsSync(sitemap)) { failures.push('Missing sitemap: '+sitemap); continue; }
  const xml = fs.readFileSync(sitemap,'utf8');
  for (const m of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
    let url;
    try { url = new URL(m[1].replace(/&amp;/g,'&')); }
    catch { failures.push('Invalid sitemap URL: '+m[1]); continue; }
    if (!/^\/(en|de)\//.test(url.pathname)) continue;
    localizedCount++;
    if (url.origin !== expectedOrigin || url.username || url.password) {
      failures.push('Unexpected localized sitemap origin: '+url.href); continue;
    }
    if (unique.has(url.href)) { failures.push('Duplicate localized URL: '+url.href); continue; }
    unique.add(url.href);
    const lang = url.pathname.split('/')[1];
    let relative;
    try { relative = decodeURIComponent(url.pathname.slice(lang.length+2)); }
    catch { failures.push('Invalid percent-encoding in sitemap path: '+url.href); continue; }
    // A language homepage legitimately maps to en/index.html or de/index.html.
    // Reject traversal, encoded separators, NULs and absolute paths before filesystem access.
    const segments = relative.split('/').filter(Boolean);
    // Decoding once must not introduce an encoded path separator or dot segment.
    // Reject encoded slashes/backslashes and nested percent encodings rather than normalizing them.
    if (/%(?:2f|5c|2e|25)/i.test(url.pathname)) {
      failures.push('Encoded path control character: '+url.href); continue;
    }
    if (url.search || url.hash || /[\\\\\x00-\x1f\x7f]/.test(relative) ||
        segments.some(segment => segment === '.' || segment === '..' || /[\\\\\x00-\x1f\x7f]/.test(segment)) ||
        segments.some(segment => segment.includes('/'))) {
      failures.push('Unsafe sitemap path: '+url.href); continue;
    }
    const file = path.join(lang,...segments,'index.html');
    results.checked++;
    results.byLanguage[lang]++;
    if (!fs.existsSync(file)) { results.missing++; failures.push('Missing generated page: '+file); continue; }
    const html = fs.readFileSync(file,'utf8');
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
    if (attr(htmlTag,'lang').toLowerCase() !== lang) {
      results.wrongLang++; failures.push('Incorrect html lang: '+file);
    }
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
    // Sitemap pages must not carry explicit noindex directives.
    const robots = [...html.matchAll(/<meta\\b[^>]*>/gi)]
      .map(m => m[0])
      .filter(tag => ['robots', 'googlebot'].includes(attr(tag, 'name').toLowerCase()));
    if (robots.some(tag => /(?:^|[,\\s])(?:noindex|none)(?:$|[,\\s])/i.test(attr(tag, 'content')))) {
      results.blockedIndexing++;
      failures.push('Localized sitemap page blocks indexing: '+file);
    }
    const canonical = links.find(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('canonical'));
    if (!canonical || attr(canonical,'href').replace(/\/$/,'') !== url.href.replace(/\/$/,'')) {
      results.wrongCanonical++; failures.push('Missing or mismatched canonical: '+file);
    }
    const alternate = links.some(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('alternate') && attr(tag,'hreflang').toLowerCase()===lang && attr(tag,'href').replace(/\/$/,'')===url.href.replace(/\/$/,''));
    if (!alternate) { results.missingHreflang++; failures.push('Missing self hreflang: '+file); }
  }
}
if (!localizedCount) failures.push('No localized EN/DE URLs found in sitemap groups');
for (const lang of ['en','de']) {
  if (!results.byLanguage[lang]) failures.push('No '+lang.toUpperCase()+' pages were audited');
}
console.log(JSON.stringify({...results,localizedCount,failures},null,2));
if (failures.length) process.exitCode = 1;
