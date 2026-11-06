(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.InsurancePriorityCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const required=['income','household','legal','travel','car','liability'];
  // Priority is determined by risk/mandatory cover, never partner commission.
  // A confirmed existing private-liability policy should not trigger a duplicate sale.
  function rank(input){
    const answers=input||{};
    const missing=required.filter(k=>answers[k]!=='yes'&&answers[k]!=='no');
    if(missing.length)return {valid:false,missing,visible:[],scores:{}};
    const scores={
      car:answers.car==='yes'?150:0, // registered car: Kfz-Haftpflicht legally mandatory
      liability:answers.liability==='no'?110:0,
      bu:answers.income==='yes'?90:0,
      household:answers.household==='yes'?70:0,
      legal:answers.legal==='yes'?55:0,
      travel:answers.travel==='yes'?50:0
    };
    const order=['car','liability','bu','household','legal','travel'];
    const visible=order.filter(k=>scores[k]>0).sort((a,b)=>scores[b]-scores[a]||order.indexOf(a)-order.indexOf(b));
    return {valid:true,missing:[],visible,scores,
      existingLiability:answers.liability==='yes',
      carMandatory:answers.car==='yes'};
  }
  return {rank};
});
