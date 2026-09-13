(function(){
  "use strict";
  var C=window.TasarrufCore, form=document.getElementById("savings-form"), result=document.getElementById("savings-result"), list=document.getElementById("result-list");
  if(!C||!form||!result||!list)return;
  var started=false, viewed=false;
  var money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0});
  var PRODUCTS={
    electricity:{title:"Elektrik",icon:"⚡",guide:"/stromtarif-karsilastirma-2026/",guideLabel:"Karşılaştırma rehberi",slot:"electricity-comparison"},
    gas:{title:"Gaz",icon:"🔥",guide:null,guideLabel:"",slot:null},
    internet:{title:"Ev interneti",icon:"🌐",guide:"/internet-tarife-karsilastirma-2026/",guideLabel:"Toplam maliyeti karşılaştır",slot:"internet-comparison"},
    mobile:{title:"Mobil hatlar",icon:"📱",guide:"/telefon-internet/",guideLabel:"Telefon ve internet rehberi",slot:null},
    car:{title:"Kfz sigortası",icon:"🚘",guide:"/kfz-versicherung-karsilastirma-2026/",guideLabel:"Kapsamı karşılaştır",slot:"kfz-insurance"},
    insurance:{title:"Sigorta",icon:"🛡️",guide:"/sigorta-secim-araci/",guideLabel:"Sigorta önceliğini kontrol et",slot:null}
  };
  var INSURANCE={
    haftpflicht:{title:"Privathaftpflicht",guide:"/haftpflicht-karsilastirma-2026/",slot:"haftpflicht-comparison"},
    hausrat:{title:"Hausrat",guide:"/hausratversicherung/",slot:"hausrat-comparison"},
    rechtsschutz:{title:"Rechtsschutz",guide:"/rechtsschutzversicherung/",slot:"rechtsschutz-comparison"}
  };

  function track(name,params){try{var payload=Object.assign({tool_name:"tasarruf_kontrolu"},params||{});if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);}catch(e){}}
  function markViewed(){if(viewed)return;try{if(localStorage.getItem("ap_cookie_consent")!=="accepted")return;}catch(e){return;}viewed=true;track("tool_view",{tool_path:location.pathname});}
  document.addEventListener("ap:analytics-ready",markViewed);
  document.addEventListener("DOMContentLoaded",function(){setTimeout(markViewed,0);});

  function syncCard(card){var active=card.querySelector(".category-active").checked;card.classList.toggle("is-active",active);card.querySelectorAll(".contract-fields input,.contract-fields select").forEach(function(el){el.disabled=!active;});}
  document.querySelectorAll(".contract-card").forEach(function(card){var check=card.querySelector(".category-active");check.addEventListener("change",function(){syncCard(card);});syncCard(card);});
  form.addEventListener("input",function(){if(started)return;started=true;track("tool_start");},{once:true});

  function readCard(card){
    var key=card.dataset.category, p=Object.assign({},PRODUCTS[key]), active=card.querySelector(".category-active").checked;
    if(!active)return null;
    var rawCost=card.querySelector(".contract-cost").value, age=card.querySelector(".contract-age").value, signal=card.querySelector(".contract-signal").value;
    if(key==="insurance"){var type=card.querySelector(".insurance-type").value, cfg=INSURANCE[type];p.title=cfg.title;p.guide=cfg.guide;p.slot=cfg.slot;p.insuranceType=type;}
    var assessment=C.assess({cost:rawCost,unit:card.dataset.unit,age:age,signal:signal});
    return {key:key,p:p,cost:assessment.cost,annual:assessment.annual,age:age,signal:signal,status:assessment.status,reason:assessment.reason};
  }
  function rank(x){return x.status==="check"?0:x.status==="missing"?1:2;}
  function renderItem(item){
    var labels={check:"Kontrol et",low:"Düşük öncelik",missing:"Veri eksik"}, el=document.createElement("article");
    el.className="contract-result status-"+item.status;
    var action=item.p.guide?'<a class="btn btn-secondary" href="'+item.p.guide+'" data-track="contract_result_click" data-commercial-area="savings-check" data-commercial-target="'+item.key+'">'+item.p.guideLabel+'</a>':"";
    var slot=item.status==="check"&&item.p.slot?'<div data-affiliate-slot="'+item.p.slot+'" aria-live="polite"></div>':"";
    el.innerHTML='<div class="result-head"><h3>'+item.p.icon+' '+item.p.title+'</h3><span class="result-status">'+labels[item.status]+'</span></div><p>'+item.reason+'</p>'+(item.annual!==null?'<p class="result-cost">Yıllık mevcut ödeme: '+money.format(item.annual)+'</p>':"")+(action?'<div class="result-actions">'+action+'</div>':"")+slot;
    list.appendChild(el);
    if(slot&&window.APAffiliate){window.APAffiliate.renderAll(el);if(el.querySelector(".affiliate-slot.is-active"))track("affiliate_slot_view",{commercial_area:item.p.slot,result_category:item.key,slot_active:true});}
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    var items=Array.from(document.querySelectorAll(".contract-card")).map(readCard).filter(Boolean), error=document.getElementById("savings-error");
    if(!items.length){error.hidden=false;return;}
    error.hidden=true;items.sort(function(a,b){return rank(a)-rank(b);});list.innerHTML="";items.forEach(renderItem);
    var total=items.reduce(function(sum,x){return sum+(x.annual||0);},0), checks=items.filter(function(x){return x.status==="check";}).length, missing=items.filter(function(x){return x.status==="missing";}).length, household=document.getElementById("household-size").value;
    document.getElementById("annual-total").textContent=money.format(total);
    document.getElementById("result-summary-text").textContent=(household==="5"?"5+":household)+" kişilik hane için "+(checks?checks+" kategori yeniden kontrol edilmeli"+(missing?"; "+missing+" kategoride veri eksik.":"."):missing?missing+" kategoride karar için veri eksik.":"seçili sözleşmeler yakın zamanda kontrol edilmiş görünüyor.");
    result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"start"});
    track("free_result_viewed",{categories_count:items.length,check_count:checks,missing_count:missing,household_size:household,annual_spend_bucket:total<1000?"under_1000":total<3000?"1000_2999":total<6000?"3000_5999":"6000_plus"});
    if(window.APDecision)window.APDecision.complete("savings","Sözleşme kontrol sıramı oluşturdum",{check_count:checks,categories_count:items.length,household_size:household});
  });
  document.addEventListener("click",function(event){var a=event.target.closest&&event.target.closest(".affiliate-slot a");if(a)track("affiliate_clicked",{commercial_area:a.getAttribute("data-commercial-area")||"",partner:a.getAttribute("data-commercial-provider")||""});});
  document.getElementById("reminder-interest").addEventListener("click",function(){track("premium_clicked",{offer_type:"contract_reminders",destination:"email_interest"});});
  document.getElementById("savings-reset").addEventListener("click",function(){result.hidden=true;list.innerHTML="";form.scrollIntoView({behavior:"smooth",block:"start"});track("tool_reset");});
  var selfTest=C.runTests();if(!selfTest.pass){console.error("Tasarruf core tests failed",selfTest);form.querySelector(".savings-submit").disabled=true;}
})();
