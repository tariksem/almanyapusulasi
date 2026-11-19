const assert=require('node:assert/strict');
const {translationEntry,translatedHtml,segmentId}=require('./bulk-i18n-lib.js');

const months=[
  ['Ocak','January','Januar'],['Şubat','February','Februar'],
  ['Mart','March','März'],['Nisan','April','April'],
  ['Mayıs','May','Mai'],['Haziran','June','Juni'],
  ['Temmuz','July','Juli'],['Ağustos','August','August'],
  ['Eylül','September','September'],['Ekim','October','Oktober'],
  ['Kasım','November','November'],['Aralık','December','Dezember']
];
for(const [tr,en,de] of months){
  assert.deepEqual(translationEntry(tr+' 2026',{}),
    {tr:tr+' 2026',en:en+' 2026',de:de+' 2026'});
  assert.deepEqual(translationEntry('12 '+tr+' 2026',{}),
    {tr:'12 '+tr+' 2026',en:en+' 12, 2026',de:'12. '+de+' 2026'});
  assert.deepEqual(translationEntry('Güncelleme: 12 '+tr+' 2026',{}),
    {tr:'Güncelleme: 12 '+tr+' 2026',en:'Updated: '+en+' 12, 2026',
     de:'Aktualisiert: 12. '+de+' 2026'});
}
// A revised legal claim is NOT a date. No unreviewed translation may be invented.
for(const phrase of ['Eylül 2026 yasa değişikliği','11.11.2026 komisyon kabulü',
 '12 Kasım 2026 tarihinde yürürlüğe girdi','2026','Eylül 2026 yılı']){
  assert.equal(translationEntry(phrase,{}),null,phrase+' must be catalog-gated');
}
const id=segmentId('Eylül 2026');
const reviewed={[id]:{tr:'Eylül 2026',en:'Editorially reviewed EN',de:'Redaktionell geprüft'}};
assert.equal(translationEntry('Eylül 2026',reviewed).en,'Editorially reviewed EN',
  'Catalog review must take precedence over generated dates');
const html='<!DOCTYPE html><html lang="tr"><head><link rel="canonical" href="https://almanyapusulasi.de/haberler/"></head><body><time>Eylül 2026</time><span>Güncelleme: 12 Kasım 2026</span></body></html>';
for(const [lang,expectedDate,expectedUpdate] of [
  ['en','September 2026','Updated: November 12, 2026'],
  ['de','September 2026','Aktualisiert: 12. November 2026']]){
  const rendered=translatedHtml(html,{lang,translations:{},routes:new Set(['haberler'])});
  assert.ok(rendered.includes('>'+expectedDate+'</time>'));
  assert.ok(rendered.includes('>'+expectedUpdate+'</span>'));
  assert.ok(rendered.includes('href="https://almanyapusulasi.de/'+lang+'/haberler/"'));
  assert.ok(rendered.includes('hreflang="tr"'));
}
assert.throws(()=>translatedHtml(html.replace('Eylül 2026','Hukuki durum değişti'),
  {lang:'en',translations:{},routes:new Set(['haberler'])}),/Missing en translation/,
  'New legal assertions must never be silently machine-translated or skipped');
console.log('Dynamic news archive EN/DE dates passed: 12 months x 3 formats, reviewed catalog priority, HTML output, SEO and strict non-date gating.');
