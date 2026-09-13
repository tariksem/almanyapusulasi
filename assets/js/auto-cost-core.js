(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.AutoCostCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  var MODES=["owned","financed","leased"];
  function amount(value,required){
    var text=String(value==null?"":value).trim().replace(/\s/g,"");
    if(!text)return required?null:0;
    if(text.indexOf(",")>=0)text=text.replace(/\./g,"").replace(",",".");
    else if(/^\d{1,3}(\.\d{3})+$/.test(text))text=text.replace(/\./g,"");
    var n=Number(text);
    return Number.isFinite(n)&&n>=0?n:null;
  }
  function positive(value){var n=amount(value,true);return n!==null&&n>0?n:null;}
  function calculate(input){
    input=input||{};
    var mode=MODES.indexOf(input.mode)>=0?input.mode:null;
    var payment=amount(input.payment,false),insurance=amount(input.insurance,true),tax=amount(input.tax,false),km=positive(input.km),consumption=positive(input.consumption),unitPrice=positive(input.unitPrice),maintenance=amount(input.maintenance,false),tires=amount(input.tires,false),parking=amount(input.parking,false),other=amount(input.other,false),depreciation=amount(input.depreciation,false);
    var values=[payment,insurance,tax,km,consumption,unitPrice,maintenance,tires,parking,other,depreciation];
    if(!mode||values.some(function(x){return x===null;})||(mode!=="owned"&&payment<=0))return {valid:false};
    if(mode!=="owned")depreciation=0;
    var energy=km/100*consumption*unitPrice;
    var categories=[
      {key:"payment",label:mode==="leased"?"Leasing":"Kredi ödemesi",annual:mode==="owned"?0:payment*12},
      {key:"insurance",label:"Kfz sigortası",annual:insurance},
      {key:"energy",label:"Yakıt / enerji",annual:energy},
      {key:"tax",label:"Kfz-Steuer",annual:tax},
      {key:"maintenance",label:"Bakım, servis ve HU",annual:maintenance},
      {key:"tires",label:"Lastik",annual:tires},
      {key:"parking",label:"Park / garaj",annual:parking*12},
      {key:"other",label:"Diğer",annual:other*12}
    ];
    var operatingAnnual=categories.slice(1).reduce(function(sum,x){return sum+x.annual;},0);
    var cashAnnual=operatingAnnual+categories[0].annual;
    var economicAnnual=mode==="owned"&&depreciation>0?operatingAnnual+depreciation:mode==="leased"?cashAnnual:null;
    var primaryAnnual=economicAnnual===null?cashAnnual:economicAnnual;
    var breakdown=categories.filter(function(x){return x.annual>0;});
    if(mode==="owned"&&depreciation>0)breakdown.push({key:"depreciation",label:"Değer kaybı",annual:depreciation});
    breakdown.sort(function(a,b){return b.annual-a.annual;});
    var complete=mode==="leased"||(mode==="owned"&&depreciation>0);
    var costBand=primaryAnnual/12<400?"under_400":primaryAnnual/12<=700?"400_700":"over_700";
    var kmBand=km<10000?"under_10k":km<=20000?"10k_20k":"over_20k";
    return {valid:true,mode:mode,energyType:input.energyType==="electric"?"electric":"fuel",payment:payment,insurance:insurance,km:km,energyAnnual:energy,operatingAnnual:operatingAnnual,cashAnnual:cashAnnual,cashMonthly:cashAnnual/12,economicAnnual:economicAnnual,primaryAnnual:primaryAnnual,primaryMonthly:primaryAnnual/12,perKm:primaryAnnual/km,insuranceShare:cashAnnual>0?insurance/cashAnnual*100:0,depreciation:depreciation,complete:complete,costBand:costBand,kmBand:kmBand,breakdown:breakdown,largest:breakdown[0]||null};
  }
  function runTests(){
    var base={mode:"owned",energyType:"fuel",insurance:"900",tax:"180",km:"15000",consumption:"6,5",unitPrice:"1,75",maintenance:"700",tires:"300",parking:"50",other:"20",depreciation:"2500"};
    var owned=calculate(base);
    var financed=calculate(Object.assign({},base,{mode:"financed",payment:"350"}));
    var leased=calculate(Object.assign({},base,{mode:"leased",payment:"400"}));
    var cases=[
      {name:"German decimal energy",ok:owned.energyAnnual===1706.25},
      {name:"owned economic total",ok:owned.economicAnnual===7126.25},
      {name:"owned cash excludes depreciation",ok:owned.cashAnnual===4626.25},
      {name:"financed cash includes payment",ok:financed.cashAnnual===8826.25},
      {name:"financed avoids false economic total",ok:financed.economicAnnual===null},
      {name:"financed ignores depreciation",ok:financed.depreciation===0},
      {name:"leased ignores depreciation",ok:leased.depreciation===0&&leased.economicAnnual===9426.25},
      {name:"cost per km",ok:Math.abs(owned.perKm-0.4750833333)<0.000001},
      {name:"required payment",ok:calculate(Object.assign({},base,{mode:"financed",payment:""})).valid===false},
      {name:"negative invalid",ok:calculate(Object.assign({},base,{insurance:"-1"})).valid===false},
      {name:"zero km invalid",ok:calculate(Object.assign({},base,{km:"0"})).valid===false},
      {name:"German thousands",ok:amount("1.200",true)===1200}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {amount:amount,calculate:calculate,runTests:runTests};
});
