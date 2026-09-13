(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.RisikolebenCore=api;
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

  function wholeYears(value){
    var n=Number(String(value==null?"":value).trim());
    if(!Number.isFinite(n)||n<1||n>40)return null;
    return Math.round(n);
  }

  function needBand(value){
    if(value<=0)return "covered";
    if(value<100000)return "under_100k";
    if(value<250000)return "100_250k";
    if(value<500000)return "250_500k";
    return "500k_plus";
  }

  function termBand(years){
    if(years<=10)return "1_10";
    if(years<=20)return "11_20";
    return "21_plus";
  }

  function calculate(input){
    input=input||{};
    var debt=amount(input.debt,false);
    var monthlyGap=amount(input.monthlyGap,true);
    var years=wholeYears(input.years);
    var specialNeeds=amount(input.specialNeeds,false);
    var liquidAssets=amount(input.liquidAssets,false);
    var existingCover=amount(input.existingCover,false);
    if([debt,monthlyGap,specialNeeds,liquidAssets,existingCover].some(function(x){return x===null;})||years===null)return {valid:false};

    var incomeGapTotal=monthlyGap*12*years;
    var grossNeed=debt+incomeGapTotal+specialNeeds;
    var offsets=liquidAssets+existingCover;
    var estimatedNeed=Math.max(0,grossNeed-offsets);

    return {
      valid:true,
      debt:debt,
      monthlyGap:monthlyGap,
      years:years,
      specialNeeds:specialNeeds,
      liquidAssets:liquidAssets,
      existingCover:existingCover,
      incomeGapTotal:incomeGapTotal,
      grossNeed:grossNeed,
      offsets:offsets,
      estimatedNeed:estimatedNeed,
      needBand:needBand(estimatedNeed),
      termBand:termBand(years),
      hasDebt:debt>0,
      hasOffsets:offsets>0
    };
  }

  function runTests(){
    var a=calculate({debt:"250000",monthlyGap:"2000",years:"10",specialNeeds:"0",liquidAssets:"40000",existingCover:"0"});
    var b=calculate({debt:"0",monthlyGap:"1.500,50",years:"15",specialNeeds:"20.000",liquidAssets:"50.000",existingCover:"25.000"});
    var c=calculate({debt:"0",monthlyGap:"0",years:"10",specialNeeds:"0",liquidAssets:"100000",existingCover:"0"});
    var cases=[
      {name:"debt plus income gap less assets",ok:a.valid&&a.incomeGapTotal===240000&&a.grossNeed===490000&&a.estimatedNeed===450000&&a.needBand==="250_500k"},
      {name:"german number parsing",ok:b.valid&&Math.abs(b.monthlyGap-1500.5)<0.001&&b.specialNeeds===20000&&b.offsets===75000},
      {name:"need never below zero",ok:c.valid&&c.estimatedNeed===0&&c.needBand==="covered"},
      {name:"term bands",ok:termBand(10)==="1_10"&&termBand(11)==="11_20"&&termBand(21)==="21_plus"},
      {name:"negative input invalid",ok:calculate({monthlyGap:"-1",years:"10"}).valid===false},
      {name:"term outside range invalid",ok:calculate({monthlyGap:"1000",years:"41"}).valid===false}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }

  return {amount:amount,wholeYears:wholeYears,needBand:needBand,termBand:termBand,calculate:calculate,runTests:runTests};
});