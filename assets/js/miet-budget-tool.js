(function(){
  "use strict";
  var C=window.MietBudgetCore,form=document.getElementById("rent-form"),result=document.getElementById("rent-result");
  if(!C||!form||!result)return;
  var started=false,viewed=false,offerViewed=false,money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0});
  function track(name,params){try{var payload=Object.assign({tool_name:"miet_budget_check"},params||{});if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);}catch(e){}}
  function markViewed(){if(viewed)return;try{if(localStorage.getItem("ap_cookie_consent")!=="accepted")return;}catch(e){return;}viewed=true;track("tool_view",{tool_path:location.pathname});}
  document.addEventListener("ap:analytics-ready",markViewed);document.addEventListener("DOMContentLoaded",function(){setTimeout(markViewed,0);});
  form.addEventListener("input",function(){if(!started){started=true;track("tool_start");}},{once:true});
  function value(id){return document.getElementById(id).value;}
  function renderNextSteps(x,electricity){
    var title=document.getElementById("rent-next-title"),copy=document.getElementById("rent-next-copy"),wg=document.getElementById("rent-wohngeld-card"),offer=document.getElementById("rent-electricity-offer"),guide=document.getElementById("rent-electricity-guide"),slot=offer&&offer.querySelector("[data-affiliate-slot]");
    if(x.band==="over_40"){title.textContent="Önce destek hakkını, sonra değiştirilebilir giderleri kontrol edin";copy.textContent="Konut maliyeti bütçenizde yüksek pay tutuyor. Wohngeld ihtimalini ve yıllık Nebenkosten hesabını doğrulayın; elektrik ayrı sözleşmeyse tarifeyi ayrıca karşılaştırın.";}
    else if(x.band==="30_40"){title.textContent="Bütçeyi güçlendirecek üç kontrol";copy.textContent="Konut gideri önemli bir pay kullanıyor. Wohngeld ihtimalini elemeden önce hane bilgilerinizi hazırlayın; Nebenkosten ve elektrik gibi ayrı giderleri de kontrol edin.";}
    else if(x.band==="under_30"){title.textContent="Toplamı doğrulayın, gereksiz sabit gider bırakmayın";copy.textContent="Konut gideri gelirinizin yüzde 30'unun altında görünüyor. Yine de yıllık Nebenkosten ve ayrı elektrik sözleşmesinin toplam maliyetini kontrol etmek anlamlı olabilir.";}
    else {title.textContent="Aylık toplam hazır; gelir oranını isterseniz tamamlayın";copy.textContent="Net hane geliri olmadan Wohngeld sinyali üretmiyoruz. Buna rağmen Nebenkosten ve elektrik gibi ayrı giderleri kontrol edebilirsiniz.";}
    if(wg)wg.hidden=!(x.band==="30_40"||x.band==="over_40");
    if(offer)offer.hidden=!(electricity>0);
    if(guide)guide.hidden=electricity>0;
    if(electricity>0&&slot&&window.APAffiliate){window.APAffiliate.renderSlot(slot);if(!offerViewed&&slot.classList.contains("is-active")){offerViewed=true;track("affiliate_slot_view",{commercial_area:slot.getAttribute("data-affiliate-slot")||"",slot_active:true,result_band:x.band});}}
  }
  function render(x){
    document.getElementById("warm-total").textContent=money.format(x.warm);document.getElementById("monthly-total").textContent=money.format(x.monthly);document.getElementById("upfront-total").textContent=money.format(x.upfront);
    var signal=document.getElementById("rent-signal"),summary=document.getElementById("rent-result-summary"),warning=document.getElementById("rent-warning"),remaining=document.getElementById("remaining-total"),ratio=document.getElementById("ratio-note"),electricity=C.amount(value("electricity"),false)||0;signal.className="rent-signal";
    if(x.band==="no_income"){signal.textContent="Aylık toplam hazır";summary.textContent="Aylık gider ve başlangıç nakit ihtiyacı hesaplandı. Gelir oranı için net hane geliri ekleyebilirsiniz.";remaining.textContent="—";ratio.textContent="Gelir girilmedi";warning.innerHTML="<strong>Kontrol:</strong> Isınmanın Nebenkosten içinde olup olmadığını sözleşmeden doğrulayın; aynı kalemi iki kez eklemeyin.";}
    else {remaining.textContent=money.format(x.remaining);ratio.textContent="Konut gideri gelirin %"+x.ratio.toFixed(1).replace(".",",")+"'i";if(x.band==="under_30"){signal.textContent="Gelirin %30 altında";summary.textContent="Konut gideri gelirinizin yüzde 30'unun altında görünüyor.";warning.innerHTML="<strong>Kontrol:</strong> Son karardan önce ulaşım, borç, çocuk ve diğer zorunlu giderler için kalan bütçeyi ayrıca değerlendirin.";}else if(x.band==="30_40"){signal.textContent="Gelirin %30–40'ı";signal.classList.add("is-watch");summary.textContent="Konut gideri gelirinizin yüzde 30–40 aralığında görünüyor.";warning.innerHTML="<strong>Bütçe sinyali:</strong> Wohngeld ihtimalini elemeden önce hane verilerinizi hazırlayın; elektrik, internet ve Nebenkosten artışlarına karşı aylık tamponu kontrol edin.";}else{signal.textContent="Gelirin %40 üzerinde";signal.classList.add("is-high");summary.textContent="Konut gideri gelirinizin yüzde 40'ından fazlasını kullanıyor.";warning.innerHTML="<strong>Yüksek bütçe baskısı:</strong> Bu sonuç otomatik ret veya Wohngeld hakkı değildir. Destek ihtimalini ve değiştirilebilir sabit giderleri ayrı ayrı kontrol edin.";}}
    renderNextSteps(x,electricity);
    result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"start"});
    track("free_result_viewed",{ratio_band:x.band,has_income:x.income>0,has_deposit:x.deposit>0,has_setup_cost:x.setup>0,has_electricity:electricity>0});if(window.APDecision)window.APDecision.complete("housing","Gerçek konut bütçemi hesapladım",{ratio_band:x.band});
  }
  form.addEventListener("submit",function(e){e.preventDefault();var x=C.calculate({cold:value("cold"),utilities:value("utilities"),heating:value("heating"),electricity:value("electricity"),internet:value("internet"),other:value("other"),income:value("income"),deposit:value("deposit"),setup:value("setup")}),error=document.getElementById("rent-error");if(!x.valid){error.hidden=false;return;}error.hidden=true;render(x);});
  document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest(".rent-actions a,.rent-offers a");if(!a)return;if(a.matches("[data-track='housing_next_click']")){track("housing_next_click",{commercial_area:a.getAttribute("data-commercial-area")||"miet-budget",target:a.getAttribute("data-commercial-target")||""});}else if(a.closest(".rent-offers")){track("affiliate_clicked",{commercial_area:a.getAttribute("data-commercial-area")||"",partner:a.getAttribute("data-commercial-provider")||""});}});
  document.getElementById("rent-reset").addEventListener("click",function(){result.hidden=true;form.scrollIntoView({behavior:"smooth",block:"start"});track("tool_reset");});
  var tests=C.runTests();if(!tests.pass){console.error("Miet budget core tests failed",tests);form.querySelector(".rent-submit").disabled=true;}
})();
