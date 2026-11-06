// 2026 decision-tool regression tests: official thresholds + sensitive boundary cases.
// Source verification: AP-04, ACTION-PLAN-2026-11-06.md.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/almanya-2026-esikler.json','utf8')).data;
const cases=[];
function test(label,fn){try{fn();cases.push([label,true]);}catch(error){cases.push([label,false]);console.error('FAIL '+label+': '+error.message);}}
function simulate(page,initial,resultId){
  const html=fs.readFileSync(page,'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.includes('function calc()'));
  assert.equal(scripts.length,1,'one inline calculator script expected: '+page);
  const result={innerHTML:'',className:''};
  const ctx={
    document:{
      getElementById(id){return id===resultId?result:{value:Object.prototype.hasOwnProperty.call(initial,id)?String(initial[id]):''}},
      documentElement:{classList:{add(){}}},head:{appendChild(){}},createElement(){return {textContent:''}}
    },
    window:{},location:{search:''},URLSearchParams,console
  };
  vm.createContext(ctx);
  vm.runInContext(scripts[0],ctx,{filename:page,timeout:1500});
  return {result,ctx};
}
function blue(override={}){
  return simulate('blue-card-uygunluk-kontrolu-2026/index.html',{
    salary:50700,duration:'yes',route:'degree',match:'yes',low:'general',
    regulated:'no',itexp:'yes',...override
  },'result').result;
}
function net(override={}){
  return simulate('brutto-netto-hesaplayici-2026/index.html',{
    gross:4000,rent:1200,extra:2.9,children:1.8,church:0,saxony:0,...override
  },'out');
}
test('Official 2026 thresholds match the JSON',()=>{
  assert.equal(data.tax.grundfreibetrag_annual,12348);
  assert.equal(data.family.kindergeld_monthly_per_child,259);
  assert.equal(data.family.kinderzuschlag_max_monthly_per_child,297);
  assert.equal(data.family.kinderzuschlag_min_gross_income_couple_monthly,900);
  assert.equal(data.family.kinderzuschlag_min_gross_income_single_parent_monthly,600);
  assert.equal(data.eu_blue_card.general_salary_annual,50700);
  assert.equal(data.eu_blue_card.reduced_salary_annual,45934.2);
  assert.equal(data.opportunity_card.points_required,6);
  assert.equal(data.opportunity_card.finance_net_monthly,1091);
  assert.equal(data.social_insurance.health_and_care_bbg_monthly,5812.5);
  assert.equal(data.social_insurance.pension_and_unemployment_bbg_monthly,8450);
  assert.equal(data.social_insurance.gkv_average_additional_rate_percent,2.9);
});
test('Blue Card general threshold is inclusive',()=>assert.match(blue({salary:50700}).className,/ok/));
test('Blue Card 1-cent-below general threshold blocks',()=>assert.match(blue({salary:50699.99}).className,/stop/));
test('Reduced threshold requires BA approval follow-up',()=>{
  const r=blue({salary:45934.2,low:'shortage'});
  assert.match(r.className,/warn/);
  assert.match(r.innerHTML,/BA onayı/);
});
test('Reduced threshold 1 cent below blocks',()=>assert.match(blue({salary:45934.19,low:'shortage'}).className,/stop/));
test('Shortage profile above general threshold does not require BA approval on salary grounds',()=>{
  const r=blue({salary:50700,low:'shortage'});
  assert.match(r.className,/ok/);
  assert.doesNotMatch(r.innerHTML,/Ek idari şart/);
});
test('Degree-free IT route retains BA approval requirement at high salary',()=>{
  const r=blue({salary:55000,route:'it'});
  assert.match(r.className,/warn/);
  assert.match(r.innerHTML,/BA onayı/);
});
test('Blue Card missing contract duration is a blocker',()=>assert.match(blue({duration:'no'}).className,/warn/));
test('Blue Card missing IT experience is a blocker',()=>assert.match(blue({route:'it',itexp:'no'}).innerHTML,/Yeterlilik/));
test('Net tool shows a real negative rental balance, not zero',()=>{
  const r=net({gross:3000,rent:4500}).result;
  assert.match(r.innerHTML,/bütçe açığı/i);
  assert.match(r.innerHTML,/Kira sonrası<\/span><strong>-/);
  assert.match(r.innerHTML,/class="high"/);
});
test('Net tool with zero income and rent displays deficit',()=>{
  const r=net({gross:0,rent:1000}).result;
  assert.match(r.innerHTML,/bütçe açığı/i);
  assert.match(r.innerHTML,/Kira sonrası<\/span><strong>-/);
});
test('Net tool with rent below net has no deficit warning',()=>{
  const r=net({gross:4000,rent:600}).result;
  assert.doesNotMatch(r.innerHTML,/Uyarı: Kira net maaşı/);
});
test('2026 tax tariff respects tax-free and next bracket',()=>{
  const {ctx}=net({gross:2500,rent:0});
  assert.equal(ctx.tax2026(12348),0);
  assert(ctx.tax2026(17799)>0);
  assert(ctx.tax2026(69879)>=ctx.tax2026(69878));
});
test('Employee standard allowance explicitly represented in net formula',()=>{
  const html=fs.readFileSync('brutto-netto-hesaplayici-2026/index.html','utf8');
  assert(html.includes('annual-social*12-Math.min(1230,annual)'));
});
for(const [name,ok] of cases)console.log((ok?'PASS ':'FAIL ')+name);
const failed=cases.filter(x=>!x[1]);
if(failed.length)process.exit(1);
console.log('PASS 2026 eligibility and salary regression: '+cases.length+' cases');
