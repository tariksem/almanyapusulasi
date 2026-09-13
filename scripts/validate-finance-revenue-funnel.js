#!/usr/bin/env node
'use strict';
const fs=require('fs');
const checks=[];
const errors=[];
function text(path){return fs.readFileSync(path,'utf8')}
function requireText(path,needle,label){const ok=text(path).includes(needle);checks.push({label,ok});if(!ok)errors.push(label)}
function forbidText(path,needle,label){const ok=!text(path).includes(needle);checks.push({label,ok});if(!ok)errors.push(label)}

requireText('almanyada-banka-hesabi-karsilastirma/index.html','href="/banka-secim-araci/"','Girokonto canonical page routes to bank selector');
requireText('almanyada-banka-hesabi-karsilastirma/index.html','data-affiliate-slot="bank-comparison"','Girokonto canonical page keeps bank affiliate slot');
forbidText('almanyada-banka-hesabi-karsilastirma/index.html','aktif affiliate banka bağlantısı yok','Girokonto page has no stale no-affiliate disclosure');

requireText('kredit-karsilastirma-2026/index.html','href="/kredi-secim-araci/"','Credit comparison routes through credit selector');
requireText('kredit-karsilastirma-2026/index.html','data-affiliate-slot="credit-comparison"','Credit comparison keeps verified affiliate slot');

requireText('kreditkarte-karsilastirma-2026/index.html','/assets/js/credit-card-core.js','Credit-card page loads decision core');
requireText('kreditkarte-karsilastirma-2026/index.html','id="cc-result"','Credit-card page has gated result container');
forbidText('kreditkarte-karsilastirma-2026/index.html','data-affiliate-slot="credit-card-comparison"','Credit-card affiliate is not rendered before decision result');

requireText('assets/js/credit-card-tool.js','credit-card-comparison','Credit-card qualified route uses credit-card affiliate');
requireText('assets/js/credit-card-tool.js','bank-comparison','Debit-first route cross-sells Girokonto instead');
requireText('assets/js/credit-card-tool.js','repayment_risk','Teilzahlung risk route blocks direct card affiliate push');

requireText('kredi-secim-araci/index.html','amount_band','Credit selector tracks only amount band');
forbidText('kredi-secim-araci/index.html','amount:amount','Credit selector does not send raw loan amount to analytics');
requireText('kredi-secim-araci/index.html',"ap_cookie_consent')==='accepted'",'Credit selector analytics is consent-gated');

requireText('finans/index.html','href="/almanyada-banka-hesabi-karsilastirma/"','Finance hub links canonical Girokonto page');
requireText('finans/index.html','href="/kredi-secim-araci/"','Finance hub exposes credit selector');
requireText('finans/index.html','href="/kreditkarte-karsilastirma-2026/"','Finance hub exposes credit-card decision page');
forbidText('finans/index.html','/girokonto-karsilastirma-2026/','Finance hub no longer routes to merged Girokonto URL');

for(const c of checks)console.log(`${c.ok?'PASS':'FAIL'} ${c.label}`);
if(errors.length){console.error(`Finance revenue funnel guard failed: ${errors.length} issue(s).`);process.exit(1)}
console.log('Finance revenue funnel guard: PASS');
