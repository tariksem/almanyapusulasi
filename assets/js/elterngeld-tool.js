(function(){
  "use strict";
  var C=window.ElterngeldCore;
  var form=document.getElementById("elterngeld-form");
  var result=document.getElementById("elterngeld-result");
  if(!C||!form||!result)return;

  var money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0});
  var started=false;

  function track(name,params){
    try{
      var payload=Object.assign({tool_name:"elterngeld_budget_check"},params||{});
      if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);
      else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);
    }catch(e){}
  }

  function value(id){return document.getElementById(id).value;}
  function setText(id,text){var el=document.getElementById(id);if(el)el.textContent=text;}

  form.addEventListener("input",function(){if(!started){started=true;track("tool_start");}},{once:true});

  function render(x){
    setText("eg-basis",money.format(x.basis));
    setText("eg-household-after",money.format(x.householdAfter));
    setText("eg-gap",x.gap>0?money.format(x.gap):"0 €");
    setText("eg-remaining",money.format(x.remainingAfterFixed));

    var signal=document.getElementById("eg-signal");
    var summary=document.getElementById("eg-summary");
    signal.className="eg-signal";
    if(x.band==="no_gap"){
      signal.textContent="Gelir açığı görünmüyor";
      summary.textContent="Bu basitleştirilmiş hesapta Elterngeld, doğum sonrası gelir düşüşünü kapatıyor veya hane girişini artırıyor. Yine de resmî Elterngeldrechner ile sonucu doğrulayın.";
    }else if(x.band==="under_10"){
      signal.textContent="Düşük gelir açığı";
      summary.textContent="Tahmini hane girişi doğum öncesine göre %10'dan az düşüyor. Sabit giderleri ve vergi etkisini ayrıca planlayın.";
    }else if(x.band==="10_25"){
      signal.textContent="Orta gelir açığı";
      signal.classList.add("is-watch");
      summary.textContent="Tahmini hane girişi doğum öncesine göre belirgin düşüyor. Wohngeld/KiZ ve sabit gider optimizasyonunu birlikte kontrol etmek mantıklı olabilir.";
    }else{
      signal.textContent="Yüksek gelir açığı";
      signal.classList.add("is-high");
      summary.textContent="Tahmini hane girişi doğum öncesine göre %25'ten fazla düşüyor. Resmî Elterngeld planlamasının yanında konut ve sabit gider bütçesini hemen kontrol edin.";
    }

    var plus=document.getElementById("eg-plus-note");
    if(x.hasPostBirthIncome){
      plus.hidden=false;
      plus.innerHTML="<strong>ElterngeldPlus kontrolü önemli:</strong> Doğumdan sonra geliriniz varsa ElterngeldPlus bazı planlarda avantajlı olabilir. Bu araç ElterngeldPlus tutarını tahmin etmiyor; resmî planlayıcıda Basiselterngeld ve ElterngeldPlus senaryolarını karşılaştırın.";
    }else{
      plus.hidden=false;
      plus.innerHTML="<strong>Planlama notu:</strong> Doğumdan sonra gelir yoksa ElterngeldPlus aylık olarak genellikle Basiselterngeld'in yarısıdır ve daha uzun süre alınabilir. Kesin ay dağılımını resmî planlayıcıda yapın.";
    }

    var fixedNote=document.getElementById("eg-fixed-note");
    if(x.fixedCosts>0){
      fixedNote.hidden=false;
      fixedNote.textContent=x.remainingAfterFixed>=0
        ? "Girdiğiniz sabit giderlerden sonra tahmini aylık kalan tutar "+money.format(x.remainingAfterFixed)+". Bu rakama market, ulaşım ve değişken çocuk giderleri dahil değildir."
        : "Girdiğiniz sabit giderler tahmini doğum sonrası aylık girişten "+money.format(Math.abs(x.remainingAfterFixed))+" daha yüksek. Wohngeld/KiZ ve gider azaltma adımlarını önceliklendirin.";
    }else fixedNote.hidden=true;

    var support=document.getElementById("eg-support-actions");
    support.innerHTML="";
    if(x.gap>0){
      support.innerHTML+='<a class="card" href="/wohngeld/"><h3>Wohngeld kontrolü</h3><p>Konut gideriniz yüksekse hakkınızı resmî hesapla birlikte değerlendirin.</p></a>';
      support.innerHTML+='<a class="card" href="/kinderzuschlag-uygunluk-kontrolu-2026/"><h3>KiZ ön kontrolü</h3><p>Çocuklu hanelerde Kinderzuschlag uygunluk blokajlarını kontrol edin.</p></a>';
    }
    support.innerHTML+='<a class="card" href="/warmmiete-kira-butcesi-hesaplayici/"><h3>Konut bütçesini ölç</h3><p>Warmmiete, elektrik ve diğer sabit giderlerin gelir içindeki payını görün.</p></a>';
    support.innerHTML+='<a class="card" href="/tasarruf-kontrolu/"><h3>Sabit giderleri azalt</h3><p>Elektrik, internet ve diğer düzenli maliyetlerde tasarruf alanlarını bulun.</p></a>';

    result.hidden=false;
    result.scrollIntoView({behavior:"smooth",block:"start"});
    if(window.APAffiliate)window.APAffiliate.renderAll(result);
    track("tool_calculate",{gap_band:x.band,has_post_birth_income:x.hasPostBirthIncome,has_fixed_costs:x.fixedCosts>0});
    track("free_result_viewed",{gap_band:x.band,has_post_birth_income:x.hasPostBirthIncome});
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    var x=C.calculate({before:value("eg-before"),after:value("eg-after"),otherIncome:value("eg-other"),fixedCosts:value("eg-fixed")});
    var error=document.getElementById("eg-error");
    if(!x.valid){error.hidden=false;return;}
    error.hidden=true;
    render(x);
  });

  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("#elterngeld-result a[href]");
    if(a&&!a.hasAttribute("data-track"))track("family_next_step_click",{destination:a.getAttribute("href")||""});
  });

  var tests=C.runTests();
  if(!tests.pass){
    console.error("Elterngeld core tests failed",tests);
    form.querySelector("button[type=submit]").disabled=true;
  }
})();