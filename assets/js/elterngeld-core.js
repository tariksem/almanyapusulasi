(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.ElterngeldCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";

  function amount(value,required){
    var text=String(value==null?"":value).trim().replace(/\s/g,"");
    if(!text)return required?null:0;
    if(text.indexOf(",")>=0)text=text.replace(/\./g,"").replace(",",".");
    else if(/^\d{1,3}(\.\d{3})+$/.test(text))text=text.replace(/\./g,"");
    var n=Number(text);
    return Number.isFinite(n)&&n>=0?n:null;
  }

  function replacementRate(preNet){
    if(preNet>=1240)return 0.65;
    if(preNet>=1200)return 0.65+(1240-preNet)*0.0005;
    if(preNet>=1000)return 0.67;
    return Math.min(1,0.67+((1000-preNet)/2)*0.001);
  }

  function calculate(input){
    input=input||{};
    var before=amount(input.before,true);
    var after=amount(input.after,false);
    var otherIncome=amount(input.otherIncome,false);
    var fixedCosts=amount(input.fixedCosts,false);
    if([before,after,otherIncome,fixedCosts].some(function(x){return x===null;}))return {valid:false};

    var cappedBefore=Math.min(before,2770);
    var lostIncome=Math.max(0,cappedBefore-after);
    var rate=replacementRate(cappedBefore);
    var rawBenefit=lostIncome*rate;
    var basis=Math.max(300,Math.min(1800,rawBenefit));
    var householdBefore=before+otherIncome;
    var householdAfter=after+otherIncome+basis;
    var gap=Math.max(0,householdBefore-householdAfter);
    var gapRatio=householdBefore>0?gap/householdBefore*100:0;
    var remainingAfterFixed=householdAfter-fixedCosts;
    var band=gap<=0?"no_gap":gapRatio<10?"under_10":gapRatio<=25?"10_25":"over_25";

    return {
      valid:true,
      before:before,
      after:after,
      otherIncome:otherIncome,
      fixedCosts:fixedCosts,
      cappedBefore:cappedBefore,
      lostIncome:lostIncome,
      rate:rate,
      basis:basis,
      householdBefore:householdBefore,
      householdAfter:householdAfter,
      gap:gap,
      gapRatio:gapRatio,
      remainingAfterFixed:remainingAfterFixed,
      band:band,
      hasPostBirthIncome:after>0
    };
  }

  function close(a,b,tolerance){return Math.abs(a-b)<=(tolerance||0.01);}

  function runTests(){
    var a=calculate({before:"2000",after:"0",otherIncome:"0",fixedCosts:"0"});
    var b=calculate({before:"2000",after:"1200",otherIncome:"1500",fixedCosts:"2200"});
    var c=calculate({before:"3200",after:"1570",otherIncome:"0",fixedCosts:"0"});
    var d=calculate({before:"1200",after:"0",otherIncome:"0",fixedCosts:"0"});
    var e=calculate({before:"0",after:"0",otherIncome:"0",fixedCosts:"0"});
    var f=calculate({before:"2.000,50",after:"0",otherIncome:"1.500",fixedCosts:"2.000"});
    var cases=[
      {name:"official 2000 to 0 example",ok:a.valid&&close(a.basis,1300)},
      {name:"official 2000 to 1200 example",ok:b.valid&&close(b.basis,520)},
      {name:"official capped 3200 to 1570 example",ok:c.valid&&close(c.basis,780)},
      {name:"low-income 67 percent",ok:d.valid&&close(d.basis,804)},
      {name:"minimum basis benefit",ok:e.valid&&close(e.basis,300)},
      {name:"household flow calculation",ok:b.householdBefore===3500&&b.householdAfter===3220&&b.gap===280&&b.remainingAfterFixed===1020},
      {name:"german number parsing",ok:f.valid&&close(f.before,2000.5)&&f.otherIncome===1500&&f.fixedCosts===2000},
      {name:"negative input invalid",ok:calculate({before:"-1",after:"0"}).valid===false}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }

  return {amount:amount,replacementRate:replacementRate,calculate:calculate,runTests:runTests};
});