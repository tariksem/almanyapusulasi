#!/usr/bin/env node
'use strict';
// Post-generation structural audit; does not certify translation accuracy.
const fs = require('node:fs');
const path = require('node:path');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const failures = [];
const results = {checked:0,missing:0,wrongLang:0,wrongCanonical:0,missingHreflang:0};
const unique = new Set();
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
    if (unique.has(url.href)) { failures.push('Duplicate localized URL: '+url.href); continue; }
    unique.add(url.href);
    const lang = url.pathname.split('/')[1];
    let relative;
    try { relative = decodeURIComponent(url.pathname.slice(lang.length+2)); }
    catch { failures.push('Invalid percent-encoding in sitemap path: '+url.href); continue; }
    // A language homepage legitimately maps to en/index.html or de/index.html.
    // Reject traversal, encoded separators, NULs and absolute paths before filesystem access.
    const segments = relative.split('/').filter(Boolean);
    if (url.search || url.hash || relative.includes('\\\\') || relative.includes('\\0') ||
        segments.some(segment => segment === '.' || segment === '..' || segment.includes('\\\\')) ||
        segments.some(segment => segment.includes('/'))) {
      failures.push('Unsafe sitemap path: '+url.href); continue;
    }
    const file = path.join(lang,...segments,'index.html');
    results.checked++;
    if (!fs.existsSync(file)) { results.missing++; failures.push('Missing generated page: '+file); continue; }
    const html = fs.readFileSync(file,'utf8');
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
    if (attr(htmlTag,'lang').toLowerCase() !== lang) {
      results.wrongLang++; failures.push('Incorrect html lang: '+file);
    }
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
    const canonical = links.find(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('canonical'));
    if (!canonical || attr(canonical,'href').replace(/\/$/,'') !== url.href.replace(/\/$/,'')) {
      results.wrongCanonical++; failures.push('Missing or mismatched canonical: '+file);
    }
    const alternate = links.some(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('alternate') && attr(tag,'hreflang').toLowerCase()===lang && attr(tag,'href').replace(/\/$/,'')===url.href.replace(/\/$/,''));
    if (!alternate) { results.missingHreflang++; failures.push('Missing self hreflang: '+file); }
  }
}
console.log(JSON.stringify({...results,failures},null,2));
if (failures.length) process.exitCode = 1;
