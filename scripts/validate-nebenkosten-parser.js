const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/nebenkosten-upload-parser-v2.js','utf8');
const win={};vm.runInNewContext(source,{window:win},{timeout:1500});
const p=win.NebenkostenUploadParserV2;
let n=0;
function check(label,fn){fn();n++;console.log('PASS Nebenkosten upload parser: '+label);}
check('Full 2025 year is not misread as 2020',()=>{
  const a=p.findPeriod(['Abrechnungszeitraum 01.01.2025 bis 31.12.2025']);
  assert.equal(a.start,'2025-01-01');assert.equal(a.end,'2025-12-31');
});
check('Legacy two-digit 25 dates still work',()=>{
  const a=p.findPeriod(['Abrechnungszeitraum 01.01.25 - 31.12.25']);
  assert.equal(a.start,'2025-01-01');assert.equal(a.end,'2025-12-31');
});
check('Year 2020 and 2026 are preserved exactly',()=>{
  const a=p.findPeriod(['Abrechnungszeitraum 02.02.2020 - 07.11.2026']);
  assert.equal(a.start,'2020-02-02');assert.equal(a.end,'2026-11-07');
});
check('Leap day is valid only in a leap year',()=>{
  const a=p.findPeriod(['Abrechnungszeitraum 29.02.2024 - 31.12.2024']);
  assert.equal(a.start,'2024-02-29');
  const b=p.findPeriod(['Abrechnungszeitraum 29.02.2025 - 31.12.2025']);
  assert.equal(b.start,'');assert.equal(b.end,'');
});
check('Invalid and reversed periods are never accepted',()=>{
  const bad=p.findPeriod(['Abrechnungszeitraum 31.13.2025 - 31.12.2025']);
  assert.equal(bad.start,'');
  const reverse=p.findPeriod(['Abrechnungszeitraum 31.12.2025 - 01.01.2025']);
  assert.equal(reverse.start,'');
});
check('Monthly periods preserve calendar last day',()=>{
  const a=p.findPeriod(['Abrechnungszeitraum 01.2024 bis 02.2024']);
  assert.equal(a.start,'2024-01-01');assert.equal(a.end,'2024-02-29');
});
check('Synthetic 2025 bill separates advances, costs and Nachzahlung',()=>{
  const a=p.parse([
    'Nebenkostenabrechnung Testdokument',
    'Abrechnungszeitraum 01.01.2025 bis 31.12.2025',
    'Gesamtkosten 2700,00 EUR',
    'Vorauszahlungen 2400,00 EUR',
    'Nachzahlung 300,00 EUR',
    'Wasser 360,00 EUR'
  ].join('\n'));
  assert.equal(a.periodStart,'2025-01-01');assert.equal(a.periodEnd,'2025-12-31');
  assert.equal(a.advances,'2400,00');assert.equal(a.balance,'300,00');
  assert.equal(a.totalCost,'2700,00');
  assert.equal(a.balanceCredit,false);
});
check('Guthaben reduces derived total rather than adding it',()=>{
  const a=p.parse('Abrechnungszeitraum 01.01.2025 bis 31.12.2025\nVorauszahlungen 2400,00 EUR\nGuthaben 100,00 EUR');
  assert.equal(a.totalCost,'2300,00');assert.equal(a.balanceCredit,true);
});
check('No implicit guessed financial amounts without supporting numbers',()=>{
  const a=p.parse('Abrechnungszeitraum 01.01.2025 bis 31.12.2025\nNebenkostenabrechnung Beispiel');
  assert.equal(a.totalCost,'');assert.equal(a.advances,'');assert.equal(a.balance,'');
});
console.log('PASS '+n+' independent Nebenkosten PDF/OCR parser regression scenarios');
