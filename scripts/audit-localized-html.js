#!/usr/bin/env node
'use strict';
// Run after localized pages have been generated: node scripts/audit-localized-html.js
// This is a structural audit, NOT a certificate of translation accuracy.
const fs = require('node:fs');
const path = require('node:path');
const groups = ['priority','migration','family','finance-housing','career','commercial','tools','news'];
const failures = [];
const results = {checked:0,missing:0,wrongLang:0,wrongCanonical:0,missingHreflang:0};
const unique = new Set();
const attr = (tag, name) => {
  const match = tag.match(new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\\'([^\\']*)\\')','i'));
  return match ? (match[1] ?? match[2]) : '';
};
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
    const file = path.join(lang,decodeURIComponent(url.pathname.slice(lang.length+2)),'index.html');
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
    const alternate = links.some(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('alternate') && attr(tag,'hreflang').toLowerCase()===lang);
    if (!alternate) { results.missingHreflang++; failures.push('Missing self hreflang: '+file); }
  }
}
console.log(JSON.stringify({...results,failures},null,2));
if (failures.length) process.exitCode = 1;
