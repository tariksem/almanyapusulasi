(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.UmzugCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  var TASKS=[
    {id:"handover",phase:"before",scenarios:["arrival","domestic"],title:"Konut teslimini belgeleyin",description:"Anahtarları, mevcut kusurları ve sayaç değerlerini fotoğraf veya tutanakla kaydedin.",href:"/kira-teslim-tutanagi-uebergabeprotokoll/"},
    {id:"old-home",phase:"before",scenarios:["domestic"],tenant:true,title:"Eski konutun teslim ve Kaution dosyasını tamamlayın",description:"Teslim tutanağını, anahtarları ve depozito belgelerini saklayın.",href:"/kaution-depozito-geri-alma/"},
    {id:"anmeldung",phase:"first",scenarios:["arrival","domestic"],title:"Anmeldung / Ummeldung işlemini hazırlayın",description:"Yeni adres kaydı ve Wohnungsgeberbestätigung için belediye sürecini kontrol edin.",href:"/almanya-adres-kaydi-anmeldung/"},
    {id:"health",phase:"first",scenarios:["arrival"],title:"Sağlık sigortası yolunuzu netleştirin",description:"GKV, aile kapsamı veya PKV durumunu işe ve aile yapısına göre doğrulayın.",href:"/saglik-sigortasi/"},
    {id:"bank",phase:"first",scenarios:["arrival"],title:"Banka hesabı ve ödeme düzenini kurun",description:"Maaş, kira ve otomatik ödemeler için uygun hesap yolunu belirleyin.",href:"/banka-secim-araci/"},
    {id:"post",phase:"first",scenarios:["domestic"],title:"Posta ve önemli kurumlar için adres değişikliğini planlayın",description:"Banka, sigorta, işveren ve aboneliklerde eski adres kalmadığını kontrol edin.",href:"/almanyada-gerekli-belgeler/"},
    {id:"electricity",phase:"weeks",scenarios:["arrival","domestic"],title:"Elektrik sayacı ve sözleşmesini kontrol edin",description:"Teslim günündeki sayaç değerini saklayın ve yeni adresteki tedarik durumunu netleştirin.",href:"/almanyada-elektrik-aboneligi/"},
    {id:"internet",phase:"weeks",scenarios:["arrival","domestic"],title:"İnternet ve telefon taşınmasını kontrol edin",description:"Yeni adreste kullanılabilirlik, taşıma, başlangıç tarihi ve fesih koşullarını doğrulayın.",href:"/telefon-internet-sozlesmesi-fesih-tasinma/"},
    {id:"tax",phase:"weeks",scenarios:["arrival"],title:"Steuer-ID sürecini takip edin",description:"Vergi kimliği ulaştığında işveren ve gerekli işlemler için güvenli biçimde saklayın.",href:"/steuer-id-vergi-kimlik-numarasi/"},
    {id:"radio",phase:"weeks",scenarios:["arrival","domestic"],title:"Rundfunkbeitrag hane durumunu bildirin",description:"Aynı hanede mevcut ödeme olup olmadığını ve adres değişikliğini kontrol edin.",href:"/rundfunkbeitrag-nedir-nasil-odenir/"},
    {id:"liability",phase:"weeks",scenarios:["arrival","domestic"],tenant:true,title:"Privathaftpflicht kapsamını değerlendirin",description:"Kiracı ve hane risklerinde teminatın kimleri kapsadığını kontrol edin.",href:"/haftpflicht-karsilastirma-2026/"},
    {id:"kindergeld",phase:"family",scenarios:["arrival"],family:true,title:"Kindergeld hak ve başvuru yolunu kontrol edin",description:"Aile durumunuza göre başvuru belgelerini ve doğru süreci inceleyin.",href:"/kindergeld-basvuru/"},
    {id:"family-address",phase:"family",scenarios:["domestic"],family:true,title:"Aile ödemelerinde adres değişikliğini bildirin",description:"Familienkasse ve ilgili aile kurumlarındaki adres bilgisini kontrol edin.",href:"/kindergeld-adres-degisikligi/"},
    {id:"school",phase:"family",scenarios:["arrival","domestic"],family:true,title:"Kita veya okul işlemlerini başlatın",description:"Yerel kayıt, ulaşım ve gerekli belge süreçlerini yeni adres için doğrulayın.",href:"/kita-platz-almanya/"},
    {id:"car",phase:"vehicle",scenarios:["arrival","domestic"],car:true,title:"Araç adresi, tescil ve sigortayı kontrol edin",description:"Araç belgeleri ve poliçedeki adres bilgilerinin güncel olduğundan emin olun.",href:"/arac-tescili-zulassung/"}
  ];
  function buildPlan(profile){
    profile=profile||{};
    var scenario=profile.scenario==="domestic"?"domestic":"arrival";
    return TASKS.filter(function(task){
      if(task.scenarios.indexOf(scenario)<0)return false;
      if(task.family&&!profile.family)return false;
      if(task.car&&!profile.car)return false;
      if(task.tenant&&!profile.tenant)return false;
      return true;
    }).map(function(task){return Object.assign({},task);});
  }
  function signature(profile){return [profile.scenario==="domestic"?"domestic":"arrival",profile.family?1:0,profile.car?1:0,profile.tenant?1:0].join("-");}
  function runTests(){
    var cases=[
      {ok:buildPlan({scenario:"arrival",tenant:true}).some(function(x){return x.id==="health";}),name:"arrival includes health"},
      {ok:!buildPlan({scenario:"domestic",tenant:true}).some(function(x){return x.id==="health";}),name:"domestic excludes health"},
      {ok:buildPlan({scenario:"arrival",family:true,tenant:true}).some(function(x){return x.id==="kindergeld";}),name:"family adds kindergeld"},
      {ok:!buildPlan({scenario:"arrival",family:false,tenant:true}).some(function(x){return x.id==="kindergeld";}),name:"single excludes kindergeld"},
      {ok:buildPlan({scenario:"domestic",car:true,tenant:false}).some(function(x){return x.id==="car";}),name:"car adds vehicle task"},
      {ok:!buildPlan({scenario:"arrival",tenant:false}).some(function(x){return x.id==="liability";}),name:"non-tenant excludes tenant task"}
    ];
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {buildPlan:buildPlan,signature:signature,runTests:runTests};
});
