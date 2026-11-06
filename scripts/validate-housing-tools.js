const fs=require('node:fs');
const assert=require('node:assert/strict');
const miet=require('../assets/js/miet-budget-core.js');
require('../assets/js/nebenkosten-core.js');
const nk=globalThis.NebenkostenCore;
let count=0;
function check(name,fn){fn();count++;console.log('PASS '+name);}
function rule(statement,id,today='2026-11-06'){
  return nk.analyze(statement,{today}).results.find(x=>x.ruleId===id);
}
check('Miet budget built-in cases',()=>assert.equal(miet.runTests().pass,true));
check('Nebenkosten built-in fixtures',()=>assert.equal(nk.runFixtures().pass,true));
const example={cold:'900',utilities:'220',heating:'80',electricity:'70',internet:'40',income:'3500',deposit:'2700',setup:'1200'};
check('Full deposit move-in total remains conservative',()=>assert.equal(miet.calculate(example).upfront,5210));
check('First of three equal deposit instalments reduces initial cash requirement',()=>assert.equal(miet.calculate(example).upfrontWithInstalment,3410));
check('Nettokaltmiete not Warmmiete sets deposit cap',()=>assert.equal(miet.calculate(example).depositLimit,2700));
check('Deposit exactly cap is accepted',()=>assert.equal(miet.calculate(example).depositOverLimit,false));
check('Deposit one cent above cap is flagged',()=>assert.equal(miet.calculate({...example,deposit:'2700,01'}).depositOverLimit,true));
check('Zero deposit first instalment remains zero',()=>assert.equal(miet.calculate({...example,deposit:'0'}).upfrontWithInstalment,2510));
check('Rental costs exceeding income preserve deficit',()=>{
  const x=miet.calculate({...example,income:'1000'});
  assert.equal(x.remaining,-310);
  assert.equal(x.band,'over_40');
});
check('German euro separators parse for cash figures',()=>assert.equal(miet.amount('1.234,56',true),1234.56));
check('Negative and malformed values rejected',()=>{
  assert.equal(miet.calculate({...example,cold:'-900'}).valid,false);
  assert.equal(miet.calculate({...example,utilities:'not-a-number'}).valid,false);
});
check('Landlord deadline 31 Dec 2025 ends 31 Dec 2026',()=>{
  const x=rule({billingPeriodEnd:'2025-12-31',receivedOn:'2026-12-31'},'R002');
  assert.equal(x.calculation.deadline,'2026-12-31');
  assert.equal(x.status,'pass');
});
check('Landlord deadline 15 June 2025 ends 15 June 2026',()=>{
  const x=rule({billingPeriodEnd:'2025-06-15',receivedOn:'2026-06-16'},'R002');
  assert.equal(x.calculation.deadline,'2026-06-15');
  assert.equal(x.status,'review');
});
check('Tenant objection deadline follows actual receipt date, not month end',()=>{
  const x=rule({receivedOn:'2025-08-07'},'R003','2026-08-08');
  assert.equal(x.calculation.deadline,'2026-08-07');
  assert.equal(x.calculation.daysRemaining,-1);
  assert.equal(x.status,'review');
});
check('Tenant deadline day itself is still timely',()=>{
  const x=rule({receivedOn:'2025-08-07'},'R003','2026-08-07');
  assert.equal(x.calculation.daysRemaining,0);
});
check('Leap day deadline clamps to 28 Feb in non-leap year',()=>{
  assert.equal(rule({receivedOn:'2024-02-29'},'R003','2025-03-01').calculation.deadline,'2025-02-28');
});
check('Tenant balance uses signed difference in integer cents',()=>{
  const x=rule({statedTenantCost:'899,99',statedAdvancePayments:'950',statedBalance:'-50,01'},'R005');
  assert.equal(x.status,'pass');
  assert.equal(x.calculation.expectedBalanceCents,-5001);
});
check('Wohngeld page differentiates monthly cold rent from actual Warmmiete',()=>{
  const x=fs.readFileSync('wohngeld/index.html','utf8');
  assert(x.includes('Bruttokaltmiete (Nettokaltmiete + soğuk işletme giderleri)'));
  assert(x.includes('Kindergeld ve Kinderzuschlag Wohngeld gelir hesabına dahil edilmez'));
});
check('Housing UI shows deposit instalment warning',()=>{
  const ui=fs.readFileSync('warmmiete-kira-butcesi-hesaplayici/index.html','utf8');
  const js=fs.readFileSync('assets/js/miet-budget-tool.js','utf8');
  assert(ui.includes('id="rent-deposit-note"'));
  assert(js.includes('x.upfrontWithInstalment'));
  assert(js.includes('x.depositOverLimit'));
});
check('Nebenkosten wizard progress exposes current step to assistive technology',()=>{
  const html=fs.readFileSync('nebenkosten-abrechnung-kontrolu/index.html','utf8');
  const js=fs.readFileSync('assets/js/nebenkosten-tool.js','utf8');
  assert(html.includes('role="progressbar" aria-label="Form adımı"'));
  assert(js.includes("setAttribute('aria-valuenow',String(step))"));
});
check('Dynamic cost fields have unique matching accessible labels',()=>{
  const js=fs.readFileSync('assets/js/nebenkosten-tool.js','utf8');
  assert(js.includes('let nextCostRowId=0'));
  for(const id of ['nk-cost-label','nk-cost-share','nk-building-total','nk-tenant-units','nk-total-units','nk-note']){
    assert(js.includes('for="'+id+'-${rowId}"'),'Missing label for '+id);
    assert(js.includes('id="'+id+'-${rowId}"'),'Missing input id '+id);
  }
});
check('Hidden file selectors and OCR progress have accessible names',()=>{
  const js=fs.readFileSync('assets/js/nebenkosten-upload.js','utf8');
  assert(js.includes('aria-label="PDF veya fotoğraf dosyası seç"'));
  assert(js.includes('aria-label="Kamerayla fotoğraf çek"'));
  assert(js.includes('aria-label="Belge okuma ilerlemesi"'));
  for(const id of ['nk-r-period-start','nk-r-period-end','nk-r-total','nk-r-advances','nk-r-balance','nk-r-balance-type']){
    assert(js.includes('for="'+id+'"'),'Unlabelled OCR field '+id);
  }
});
check('Nebenkosten privacy action and long headings remain readable on mobile',()=>{
  const css=fs.readFileSync('assets/nebenkosten-tool.css','utf8');
  assert(css.includes('.nk-privacy .privacy-settings-button{color:#102a43'));
  assert(css.includes('.nk-intro h1,.nk-step h2,.nk-card h3{overflow-wrap:anywhere}'));
});
console.log('PASS housing/Nebenkosten boundary checks: '+count+' cases');
