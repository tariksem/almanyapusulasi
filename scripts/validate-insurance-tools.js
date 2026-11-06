const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const core=require('../assets/js/insurance-priority-core.js');
const data=JSON.parse(fs.readFileSync('data/almanya-2026-esikler.json','utf8')).data;
let n=0;
function check(name,fn){fn();n++;console.log('PASS '+name);}
const scenario=overrides=>({income:'no',household:'no',legal:'no',travel:'no',car:'no',liability:'yes',...overrides});
check('New insurance priorities require all six answers',()=>{
  const x=core.rank({car:'yes'});
  assert.equal(x.valid,false);
  assert(x.missing.includes('liability'));
});
check('Unexpected answer values rejected',()=>assert.equal(core.rank(scenario({car:'maybe'})).valid,false));
check('Already insured liability is not recommended as a duplicate product',()=>{
  const x=core.rank(scenario());
  assert.deepEqual(x.visible,[]);
  assert.equal(x.existingLiability,true);
});
check('Missing liability is the first recommendation if no registered car',()=>{
  const x=core.rank(scenario({liability:'no'}));
  assert.deepEqual(x.visible,['liability']);
});
check('Registered car coverage is mandatory and ranks before private liability',()=>{
  const x=core.rank(scenario({car:'yes',liability:'no'}));
  assert.deepEqual(x.visible.slice(0,2),['car','liability']);
  assert.equal(x.carMandatory,true);
});
check('Car with existing private liability ranks only Kfz coverage',()=>{
  assert.deepEqual(core.rank(scenario({car:'yes'})).visible,['car']);
});
check('No registered car never produces Kfz insurance suggestion',()=>{
  assert(!core.rank(scenario({income:'yes',legal:'yes'})).visible.includes('car'));
});
check('Income dependency ranks occupational disability coverage',()=>{
  assert.deepEqual(core.rank(scenario({income:'yes'})).visible,['bu']);
});
check('Household replacement risk ranks household coverage',()=>{
  assert.deepEqual(core.rank(scenario({household:'yes'})).visible,['household']);
});
check('Travel risk is selected only when travel is answered yes',()=>{
  assert.deepEqual(core.rank(scenario({travel:'yes'})).visible,['travel']);
});
check('Legal risk raises legal cover without altering mandatory car first',()=>{
  assert.deepEqual(core.rank(scenario({car:'yes',legal:'yes'})).visible,['car','legal']);
});
check('Insurance ranking order is deterministic',()=>{
  const a=scenario({car:'yes',liability:'no',income:'yes',household:'yes',legal:'yes',travel:'yes'});
  assert.deepEqual(core.rank(a).visible,['car','liability','bu','household','legal','travel']);
  assert.deepEqual(core.rank(a).visible,core.rank(a).visible);
});
const family=fs.readFileSync('familienversicherung/index.html','utf8');
const thresholds=fs.readFileSync('almanya-2026-resmi-esikler/index.html','utf8');
check('2026 family GKV thresholds in published data are exact',()=>{
  assert.equal(data.family.familienversicherung_general_income_monthly,565);
  assert.equal(data.family.familienversicherung_minijob_income_monthly,603);
});
check('Family eligibility article states general and Minijob thresholds',()=>{
  assert(family.includes('genel düzenli toplam gelir sınırı'));
  assert(family.includes('ayda 565 €'));
  assert(family.includes('603 €'));
  assert(family.includes('590 € düzenli gelir'));
  assert(family.includes('Genel 565 € sınırının üstünde'));
  assert(!family.includes('genel olarak ayda 603 euroyu'));
});
check('FAQ JSON-LD also differentiates two thresholds',()=>{
  const text=[...family.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)][0][1];
  const schema=JSON.parse(text);
  const answer=schema['@graph'].find(e=>e['@type']==='FAQPage').mainEntity[0].acceptedAnswer.text;
  assert(answer.includes('565'));
  assert(answer.includes('603'));
});
check('Central 2026 data page displays both limits',()=>{
  assert(thresholds.includes('565 € / ay'));
  assert(thresholds.includes('603 € / ay'));
});
const page=fs.readFileSync('sigorta-secim-araci/index.html','utf8');
check('Insurance page loads the ranking core and offers a no-duplication explanation',()=>{
  assert(page.includes('/assets/js/insurance-priority-core.js'));
  assert(page.includes('window.InsurancePriorityCore.rank'));
  assert(page.includes('ikinci bir sigorta önerilmiyor'));
  assert(!page.includes("scores.liability-=55"));
});
function render(answers){
  const listeners={};
  const list={items:[],appendChild(node){this.items.push(node);},innerHTML:''};
  const intro={textContent:''};
  const result={classList:{add(){}},scrollIntoView(){}};
  const form={addEventListener:(name,handler)=>listeners[name]=handler};
  const ids={insuranceForm:form,result,priorityList:list,resultIntro:intro};
  const script=page.slice(page.lastIndexOf('<script>')+8,page.lastIndexOf('</script>'));
  class MockFormData{get(key){return answers[key];}}
  const context={document:{getElementById:id=>ids[id],createElement:()=>({innerHTML:'',className:''})},
    window:{InsurancePriorityCore:core},FormData:MockFormData,console};
  vm.runInNewContext(script,context,{timeout:1500});
  assert.equal(typeof listeners.submit,'function');
  listeners.submit({preventDefault(){}});
  return {list,intro};
}
check('Rendered car scenario clearly identifies mandatory protection',()=>{
  const x=render(scenario({car:'yes',liability:'no'}));
  assert(x.list.items[0].innerHTML.includes('Yasal zorunluluk'));
  assert(x.list.items[0].innerHTML.includes('Kfz-Haftpflicht'));
  assert(x.list.items[1].innerHTML.includes('Privathaftpflicht'));
});
check('Rendered already-covered liability scenario avoids irrelevant affiliate cards',()=>{
  const x=render(scenario());
  assert.equal(x.list.items.length,0);
  assert(x.intro.textContent.includes('ikinci bir sigorta önerilmiyor'));
});
console.log('PASS insurance/family eligibility regression: '+n+' checks');
