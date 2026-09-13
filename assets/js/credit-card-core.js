(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CreditCardCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function yes(v){return v===true||v==='yes';}
  function assess(input){
    input=input||{};
    var useCase=input.useCase||'daily';
    var foreign=yes(input.foreign);
    var rental=yes(input.rental);
    var cash=yes(input.cash);
    var repay=input.repay||'full';
    if(!['daily','travel','mixed'].includes(useCase)||!['full','partial','unknown'].includes(repay))return {valid:false};
    var route,slot,criteria=[];
    if(repay==='partial'){
      route='repayment_risk';slot='';
      criteria=['Teilzahlungszins','otomatik tam ödeme ayarı','toplam borç maliyeti'];
    }else if(rental||useCase==='travel'||useCase==='mixed'||foreign){
      route='credit_likely';slot='credit-card-comparison';
      criteria=['gerçek kredi kartı / charge yapısı','yıllık ücret','yabancı para ücreti','ATM koşulları'];
      if(rental)criteria.unshift('otel/araç kiralama depozito kabulü');
    }else{
      route='debit_first';slot='bank-comparison';
      criteria=['Girokonto toplam maliyeti','debit kart ücreti','ATM ağı','mobil ödeme'];
    }
    if(cash&&!criteria.includes('ATM koşulları'))criteria.push('ATM koşulları');
    return {valid:true,route:route,affiliateSlot:slot,criteria:criteria,foreign:foreign,rental:rental,cash:cash,repay:repay,useCase:useCase};
  }
  function runTests(){
    var a=assess({useCase:'daily',foreign:'no',rental:'no',cash:'no',repay:'full'});
    var b=assess({useCase:'travel',foreign:'yes',rental:'yes',cash:'yes',repay:'full'});
    var c=assess({useCase:'mixed',foreign:'yes',rental:'no',cash:'no',repay:'partial'});
    var d=assess({useCase:'oops',repay:'full'});
    var cases=[
      {name:'daily use routes to debit/girokonto first',ok:a.valid&&a.route==='debit_first'&&a.affiliateSlot==='bank-comparison'},
      {name:'travel rental routes to credit card comparison',ok:b.valid&&b.route==='credit_likely'&&b.affiliateSlot==='credit-card-comparison'&&b.criteria[0].includes('depozito')},
      {name:'partial repayment blocks affiliate push',ok:c.valid&&c.route==='repayment_risk'&&c.affiliateSlot==='' },
      {name:'invalid use case rejected',ok:d.valid===false}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {assess:assess,runTests:runTests};
});
