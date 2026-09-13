(function(){
  "use strict";
  var C=window.RisikolebenCore;
  var form=document.getElementById("risikoleben-form");
  var result=document.getElementById("risikoleben-result");
  if(!C||!form||!result)return;

  var money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0});
  var started=false;

  function track(name,params){
    try{
      var payload=Object.assign({tool_name:"risikoleben_need_check"},params||{});
      if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);
      else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);
    }catch(e){}
  }

  function value(id){return document.getElementById(id).value;}
  function setText(id,text){var el=document.getElementById(id);if(el)el.textContent=text;}

  form.addEventListener("input",function(){if(!started){started=true;track("tool_start");}},{once:true});

  function render(x){
    setText("rl-need",money.format(x.estimatedNeed));
    setText("rl-debt-part",money.format(x.debt));
    setText("rl-income-part",money.format(x.incomeGapTotal));
    setText("rl-offsets",money.format(x.offsets));
    setText("rl-term",x.years+" yıl");

    var summary=document.getElementById("rl-summary");
    if(x.estimatedNeed===0){
      summary.textContent="Girdiğiniz mevcut likit varlıklar ve mevcut ölüm teminatı, bu basitleştirilmiş senaryodaki borç + gelir açığı ihtiyacını karşılıyor görünüyor. Yine de varlıkların gerçekten aile için kullanılabilir olup olmadığını ve mevcut poliçelerin süresini kontrol edin.";
    }else if(x.hasDebt){
      summary.textContent="Yaklaşık ihtiyaç, kalan borç ile ailenin seçtiğiniz süre boyunca yaşayacağı tahmini gelir açığının birlikte korunmasına dayanıyor. Kredi bakiyesi zamanla düşüyorsa sabit ve düşen teminat seçeneklerini ayrıca karşılaştırın.";
    }else{
      summary.textContent="Yaklaşık ihtiyaç esas olarak ailenin seçtiğiniz süre boyunca yaşayacağı tahmini gelir açığına dayanıyor. Süreyi çocukların finansal bağımsızlığı, eşin çalışma kapasitesi ve mevcut haklarla birlikte kontrol edin.";
    }

    result.hidden=false;
    result.scrollIntoView({behavior:"smooth",block:"start"});
    if(window.APAffiliate)window.APAffiliate.renderAll(result);
    track("tool_calculate",{need_band:x.needBand,term_band:x.termBand,has_debt:x.hasDebt,has_offsets:x.hasOffsets});
    track("free_result_viewed",{need_band:x.needBand,has_debt:x.hasDebt});
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    var x=C.calculate({
      debt:value("rl-debt"),
      monthlyGap:value("rl-gap"),
      years:value("rl-years"),
      specialNeeds:value("rl-special"),
      liquidAssets:value("rl-assets"),
      existingCover:value("rl-existing")
    });
    var error=document.getElementById("rl-error");
    if(!x.valid){error.hidden=false;return;}
    error.hidden=true;
    render(x);
  });

  var tests=C.runTests();
  if(!tests.pass){
    console.error("Risikoleben core tests failed",tests);
    form.querySelector("button[type=submit]").disabled=true;
  }
})();