(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.FamilyBenefitsCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  var ALLOWED=["new_baby","regular_child","adult_child","abroad_turkey","tight_budget","housing_pressure","sick_child","childcare"];
  var ROUTES={
    elterngeld:{group:"elterngeld",title:"Elterngeld tahminini hesaplayın",text:"Doğum nedeniyle oluşabilecek gelir kaybı için ücretsiz tahmini görün.",href:"/elterngeld-hesaplayici-2026/",priority:100},
    mutterschutz:{group:"birth",title:"Mutterschutz ve Mutterschaftsgeld",text:"Doğum öncesi ve sonrası koruma ile ödeme yolunu kontrol edin.",href:"/mutterschutz-mutterschaftsgeld/",priority:55},
    elternzeit:{group:"birth",title:"Elternzeit planı",text:"İşverene bildirim ve süre planlamasını ayrı değerlendirin.",href:"/elternzeit-almanya/",priority:50},
    kindergeld:{group:"kindergeld",title:"Kindergeld ön kontrolünü açın",text:"Temel ödeme, çocuk sayısı ve sonraki adımı kontrol edin.",href:"/kindergeld-hesaplayici-2026/",priority:90},
    kindergeld_apply:{group:"kindergeld",title:"Kindergeld başvuru rehberi",text:"Başvuru yolu ve hazırlanabilecek belgeleri görün.",href:"/kindergeld-basvuru/",priority:45},
    adult:{group:"kindergeld",title:"18 yaş sonrası Kindergeld",text:"Eğitim, Ausbildung veya üniversite devam koşullarını doğrulayın.",href:"/kindergeld-18-yas/",priority:95},
    turkey:{group:"cross_border",title:"Türkiye’de yaşayan çocuk için Kindergeld",text:"Sınır ötesi dosyanın özel kontrol noktalarını ana ödemeden ayırın.",href:"/kindergeld-turkiyedeki-cocuk-2026/",priority:98},
    kiz:{group:"kiz",title:"Kinderzuschlag blokaj kontrolünü açın",text:"Kesin tutar iddiası olmadan temel şartları ve eksik dosyayı görün.",href:"/kinderzuschlag-uygunluk-kontrolu-2026/",priority:96},
    wohngeld:{group:"housing",title:"Wohngeld yolunu kontrol edin",text:"Konut desteğinde gelir ve kira değerlendirmesinin nasıl çalıştığını görün.",href:"/wohngeld/",priority:92},
    rent:{group:"housing",title:"Gerçek konut bütçesini hesaplayın",text:"Warmmiete, elektrik, internet ve başlangıç nakdini ayırın.",href:"/warmmiete-kira-butcesi-hesaplayici/",priority:40},
    sick:{group:"care",title:"Kinderkrankengeld rehberi",text:"Hasta çocuk için izin, ödeme ve bildirim yolunu kontrol edin.",href:"/kinderkrankengeld-2026/",priority:94},
    kita:{group:"care",title:"Kita başvuru yolunu açın",text:"Yerel başvuru ve çocuk bakım sürecini planlayın.",href:"/kita-platz-almanya/",priority:93}
  };
  var MAP={
    new_baby:["elterngeld","mutterschutz","elternzeit"],
    regular_child:["kindergeld","kindergeld_apply"],
    adult_child:["adult","kindergeld"],
    abroad_turkey:["turkey","kindergeld"],
    tight_budget:["kiz","wohngeld"],
    housing_pressure:["wohngeld","rent"],
    sick_child:["sick"],
    childcare:["kita"]
  };
  function evaluate(input){
    var selected=(Array.isArray(input)?input:[]).filter(function(x,i,a){return ALLOWED.indexOf(x)>=0&&a.indexOf(x)===i;});
    if(!selected.length)return {valid:false,primary:[],secondary:[]};
    var keys=[];selected.forEach(function(code){(MAP[code]||[]).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});
    var routes=keys.map(function(k){return Object.assign({key:k},ROUTES[k]);}).sort(function(a,b){return b.priority-a.priority;});
    var primary=routes.filter(function(x){return x.priority>=90;});
    var secondary=routes.filter(function(x){return x.priority<90;});
    return {valid:true,primary:primary,secondary:secondary,total:routes.length,multiple:selected.length>1};
  }
  function runTests(){
    var baby=evaluate(["new_baby"]),budget=evaluate(["tight_budget","housing_pressure"]),abroad=evaluate(["abroad_turkey"]),adult=evaluate(["adult_child"]),all=evaluate(ALLOWED);
    var cases=[
      {name:"empty invalid",ok:evaluate([]).valid===false},
      {name:"new baby routes to Elterngeld",ok:baby.primary[0].key==="elterngeld"&&baby.secondary.some(function(x){return x.key==="mutterschutz";})},
      {name:"budget routes to KiZ and Wohngeld",ok:budget.primary.some(function(x){return x.key==="kiz";})&&budget.primary.some(function(x){return x.key==="wohngeld";})},
      {name:"duplicate Wohngeld removed",ok:budget.primary.filter(function(x){return x.key==="wohngeld";}).length===1},
      {name:"Turkey route first",ok:abroad.primary[0].key==="turkey"},
      {name:"adult route included",ok:adult.primary.some(function(x){return x.key==="adult";})},
      {name:"unknown scenario ignored",ok:evaluate(["unknown"]).valid===false},
      {name:"all route URLs unique",ok:new Set(all.primary.concat(all.secondary).map(function(x){return x.href;})).size===all.total},
      {name:"multiple flag",ok:budget.multiple===true}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {evaluate:evaluate,runTests:runTests};
});
