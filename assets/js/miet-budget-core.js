(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.MietBudgetCore=api;
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
  function calculate(input){
    input=input||{};
    var cold=amount(input.cold,true),utilities=amount(input.utilities,true),heating=amount(input.heating,false),electricity=amount(input.electricity,false),internet=amount(input.internet,false),other=amount(input.other,false),income=amount(input.income,false),deposit=amount(input.deposit,false),setup=amount(input.setup,false);
    var values=[cold,utilities,heating,electricity,internet,other,income,deposit,setup];
    if(values.some(function(x){return x===null;}))return {valid:false};
    var warm=cold+utilities+heating,monthly=warm+electricity+internet+other,hasIncome=income>0,remaining=hasIncome?income-monthly:null,ratio=hasIncome?monthly/income*100:null;
    var band=!hasIncome?"no_income":ratio<30?"under_30":ratio<=40?"30_40":"over_40";
    return {valid:true,warm:warm,monthly:monthly,income:income,remaining:remaining,ratio:ratio,upfront:deposit+setup+monthly,deposit:deposit,setup:setup,band:band};
  }
  function runTests(){
    var a=calculate({cold:"900",utilities:"220",heating:"80",electricity:"70",internet:"40",other:"0",income:"3500",deposit:"2700",setup:"1200"});
    var b=calculate({cold:"900,50",utilities:"200",income:""});
    var cases=[
      {name:"monthly total",ok:a.monthly===1310},
      {name:"warm total",ok:a.warm===1200},
      {name:"remaining income",ok:a.remaining===2190},
      {name:"upfront includes first month",ok:a.upfront===5210},
      {name:"ratio band",ok:a.band==="30_40"},
      {name:"comma decimal",ok:b.valid&&b.warm===1100.5},
      {name:"German thousands",ok:amount("1.200",true)===1200},
      {name:"optional empty values",ok:b.monthly===1100.5&&b.band==="no_income"},
      {name:"negative invalid",ok:calculate({cold:"-1",utilities:"200"}).valid===false}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {amount:amount,calculate:calculate,runTests:runTests};
});
