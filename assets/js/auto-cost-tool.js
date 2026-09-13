(function(){
  "use strict";
  var C=window.AutoCostCore,form=document.getElementById("auto-form"),result=document.getElementById("auto-result"),mode=document.getElementById("ownership");
  if(!C||!form||!result||!mode)return;
  var started=false,viewed=false,money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}),money2=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2});
  function track(name,params){try{var payload=Object.assign({tool_name:"auto_cost_check"},params||{});if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);}catch(e){}}
  function markViewed(){if(viewed)return;try{if(localStorage.getItem("ap_cookie_consent")!=="accepted")return;}catch(e){return;}viewed=true;track("tool_view",{tool_path:location.pathname});}
  function value(id){return document.getElementById(id).value;}
  function syncMode(){var financed=mode.value!=="owned";document.getElementById("payment-field").hidden=!financed;document.getElementById("payment").required=financed;document.getElementById("depreciation-field").hidden=financed;}
  document.addEventListener("ap:analytics-ready",markViewed);document.addEventListener("DOMContentLoaded",function(){setTimeout(markViewed,0);});
  form.addEventListener("input",function(){if(!started){started=true;track("tool_start");}},{once:true});
  mode.addEventListener("change",syncMode);syncMode();
  function renderBreakdown(x){
    var root=document.getElementById("cost-breakdown"),max=x.breakdown.length?x.breakdown[0].annual:1;
    root.innerHTML="";
    x.breakdown.forEach(function(item){var row=document.createElement("div"),head=document.createElement("div"),label=document.createElement("span"),amount=document.createElement("strong"),trackEl=document.createElement("i");label.textContent=item.label;amount.textContent=money.format(item.annual)+"/yıl";head.append(label,amount);trackEl.style.width=Math.max(4,item.annual/max*100).toFixed(1)+"%";row.append(head,trackEl);root.appendChild(row);});
  }
  function render(x){
    document.getElementById("cash-monthly").textContent=money.format(x.cashMonthly);
    document.getElementById("primary-annual").textContent=money.format(x.primaryAnnual);
    document.getElementById("cost-per-km").textContent=money2.format(x.perKm);
    document.getElementById("energy-annual").textContent=money.format(x.energyAnnual);
    document.getElementById("energy-note").textContent=x.energyType==="electric"?"Elektrik tüketimi üzerinden":"Yakıt tüketimi üzerinden";
    document.getElementById("largest-cost").textContent=x.largest?x.largest.label+" · "+money.format(x.largest.annual)+"/yıl":"—";
    document.getElementById("insurance-share").textContent="%"+x.insuranceShare.toFixed(1).replace(".",",")+" · "+money.format(x.insurance)+"/yıl";
    var label=document.getElementById("primary-label"),note=document.getElementById("primary-note"),summary=document.getElementById("auto-summary"),signal=document.getElementById("auto-signal"),warning=document.getElementById("auto-warning"),perKmNote=document.getElementById("per-km-note");
    signal.className="auto-signal";
    if(x.mode==="owned"&&x.complete){label.textContent="Yıllık ekonomik maliyet";note.textContent="İşletme gideri + değer kaybı";summary.textContent="Taksitsiz araç için işletme giderleri ve değer kaybı birlikte gösteriliyor.";signal.textContent="Tam sahiplik görünümü";perKmNote.textContent="Değer kaybı dahil";warning.innerHTML="<strong>Kontrol:</strong> Değer kaybı nakit ödeme değildir. Aracı bugün satabilme değeri ve beklenen kullanım süreniz değiştikçe bu tahmini güncelleyin.";}
    else if(x.mode==="owned"){label.textContent="Yıllık işletme gideri";note.textContent="Değer kaybı girilmedi";summary.textContent="Aracın nakit işletme bütçesi hazır; ekonomik toplam için değer kaybı eksik.";signal.textContent="Değer kaybı eksik";signal.classList.add("is-watch");perKmNote.textContent="Değer kaybı hariç";warning.innerHTML="<strong>Eksik görünüm:</strong> Satın alma bedeli aylık ödeme değildir; ancak aracın değer kaybı gerçek sahiplik maliyetinin parçasıdır. Biliyorsanız yıllık değer kaybını ekleyin.";}
    else if(x.mode==="financed"){label.textContent="Yıllık nakit bütçesi";note.textContent="Kredi ödemesi + işletme giderleri";summary.textContent="Kredili araç için aylık ve yıllık nakit çıkışı gösteriliyor.";signal.textContent="Nakit bütçesi hazır";perKmNote.textContent="Kredi taksiti dahil";warning.innerHTML="<strong>Çift sayımı önledik:</strong> Kredi taksiti anapara ve faiz içerebilir. Bu nedenle değer kaybını taksitin üzerine ekleyip kesin ekonomik toplam göstermiyoruz.";}
    else{label.textContent="Yıllık toplam bütçe";note.textContent="Leasing ödemesi + işletme giderleri";summary.textContent="Leasing ödemesi ve kullanım giderleri aynı nakit bütçesinde gösteriliyor.";signal.textContent="Leasing bütçesi hazır";perKmNote.textContent="Leasing ödemesi dahil";warning.innerHTML="<strong>Kontrol:</strong> Sonderzahlung, kilometre aşımı, iade hasarı veya sözleşme sonu masrafları varsa bu aylık hesapta ayrıca yer almaz.";}
    renderBreakdown(x);result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"start"});
    track("free_result_viewed",{ownership_mode:x.mode,energy_type:x.energyType,cost_band:x.costBand,km_band:x.kmBand,complete_cost_view:x.complete,has_insurance:x.insurance>0});
    if(window.APDecision)window.APDecision.complete("car_cost","Araç toplam maliyetimi hesapladım",{ownership_mode:x.mode,cost_band:x.costBand});
  }
  form.addEventListener("submit",function(e){e.preventDefault();var x=C.calculate({mode:mode.value,energyType:value("energy-type"),payment:value("payment"),insurance:value("insurance"),tax:value("tax"),km:value("km"),consumption:value("consumption"),unitPrice:value("unit-price"),maintenance:value("maintenance"),tires:value("tires"),parking:value("parking"),other:value("other"),depreciation:value("depreciation")}),error=document.getElementById("auto-error");if(!x.valid){error.hidden=false;return;}error.hidden=true;render(x);});
  document.getElementById("auto-reset").addEventListener("click",function(){result.hidden=true;form.scrollIntoView({behavior:"smooth",block:"start"});track("tool_reset");});
  var tests=C.runTests();if(!tests.pass){console.error("Auto cost core tests failed",tests);form.querySelector(".auto-submit").disabled=true;}
})();
