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
  // Some tools calculate on load; others wait for the user's button click.
  if(!result.innerHTML && typeof ctx.calc==='function')ctx.calc();
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
    gross:4000,rent:1200,extra:2.9,children:1.8,under23:'no',church:0,saxony:0,...override
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
test('2026 Pflegeversicherung age boundaries are sourced in data',()=>{
  assert.equal(data.social_insurance.care_childless_surcharge_from_age_years,23);
  assert.equal(data.social_insurance.care_additional_child_discount_until_age_years,25);
  assert.equal(data.social_insurance.care_childless_employee_share_under23_percent,1.8);
});
function netAmount(overrides){const x=net({...overrides,rent:0});return vm.runInContext('lastNet',x.ctx);}
test('Under-23 childless employee does not pay 0.6 point Pflege surcharge',()=>{
  const young=netAmount({gross:4000,children:2.4,under23:'yes'});
  const older=netAmount({gross:4000,children:2.4,under23:'no'});
  assert(young>older,'Under-23 take-home pay must be higher');
  assert(young-older>10&&young-older<25,'Net delta reflects a 0.6% lower PV employee contribution');
});
test('Age cutoff still works for childless Saxony employees',()=>{
  const young=netAmount({gross:4000,children:2.4,under23:'yes',saxony:0.5});
  const older=netAmount({gross:4000,children:2.4,under23:'no',saxony:0.5});
  assert(young>older,'Saxony must also exempt under-23 childless PV surcharge');
});
test('Under-23 option does not grant extra PV reduction to parents',()=>{
  const young=netAmount({gross:4000,children:1.8,under23:'yes'});
  const older=netAmount({gross:4000,children:1.8,under23:'no'});
  assert(Math.abs(young-older)<0.000001);
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

function kiz(override={}){
  return simulate('kinderzuschlag-uygunluk-kontrolu-2026/index.html',{
    family:'couple',income:900,home:'yes',child:'yes',kg:'yes',
    docs:'yes',housing:'yes',childIncome:'no',withBenefits:'yes',...override
  },'out').result;
}
function chance(override={}){
  return simulate('chancenkarte-puan-hesaplayici-2026/index.html',{
    recognized:'no',formal:'yes',baseLanguage:'yes',finance:'yes',
    partial:'4',shortage:'0',exp:'0',de:'0',en:'0',age:'2',stay:'0',partner:'0',...override
  },'out').result;
}
test('KiZ couple minimum gross income at exactly 900 passes',()=>assert.match(kiz({income:900}).className,/ok/));
test('KiZ couple 1 cent below 900 blocks',()=>assert.match(kiz({income:899.99}).className,/stop/));
test('KiZ single-parent minimum gross income at exactly 600 passes',()=>assert.match(kiz({family:'single',income:600}).className,/ok/));
test('KiZ single-parent 1 cent below 600 blocks',()=>assert.match(kiz({family:'single',income:599.99}).className,/stop/));
test('KiZ incomplete child-income data warns without an eligibility guarantee',()=>assert.match(kiz({childIncome:'unknown'}).className,/warn/));
test('Chancenkarte points route exactly six passes without blockers',()=>assert.match(chance().className,/result-ok/));
test('Chancenkarte five points fails even with language and financing',()=>assert.match(chance({age:'1'}).className,/result-stop/));
test('Chancenkarte recognized skilled-worker route does not require points or language',()=>{
  const r=chance({recognized:'yes',formal:'no',baseLanguage:'no',partial:'0',age:'0'});
  assert.match(r.className,/result-ok/);
  assert.doesNotMatch(r.innerHTML,/6 puan eşiği/);
});
test('Chancenkarte recognized route without financing warns',()=>assert.match(chance({recognized:'yes',finance:'no'}).className,/result-warn/));


function pension(override={}){
  return simulate('almanya-emeklilik-hesaplayici-2026/index.html',{
    points:1,access:1,type:1,...override
  },'out').result;
}
test('2026 pension point value has July 1 effective date',()=>{
  assert.equal(data.retirement.current_pension_value_eur,42.52);
  assert.equal(data.retirement.current_value_valid_from,'2026-07-01');
  assert.equal(data.retirement.previous_pension_value_eur,40.79);
});
test('Pension estimate for 1 point matches official 42.52 EUR',()=>{
  assert.match(pension().innerHTML,/42,52/);
});
test('Pension estimate for 10 points with 0.8 entry factor',()=>{
  assert.match(pension({points:10,access:0.8}).innerHTML,/340,16/);
});
test('Pension zero-point estimate remains zero',()=>{
  assert.match(pension({points:0}).innerHTML,/0,00/);
});

for(const [name,ok] of cases)console.log((ok?'PASS ':'FAIL ')+name);
const failed=cases.filter(x=>!x[1]);
if(failed.length)process.exit(1);
console.log('PASS 2026 eligibility and salary regression: '+cases.length+' cases');
