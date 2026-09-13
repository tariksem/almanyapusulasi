(function(){
  "use strict";
  var C=window.FamilyBenefitsCore,form=document.getElementById("family-benefits-form"),result=document.getElementById("family-benefits-result");
  if(!C||!form||!result)return;
  var started=false,viewed=false;
  function track(name,params){try{var payload=Object.assign({tool_name:"family_benefits_check"},params||{});if(window.APAnalytics&&typeof window.APAnalytics.track==="function")window.APAnalytics.track(name,payload);else if(localStorage.getItem("ap_cookie_consent")==="accepted"&&typeof window.gtag==="function")window.gtag("event",name,payload);}catch(e){}}
  function markViewed(){if(viewed)return;try{if(localStorage.getItem("ap_cookie_consent")!=="accepted")return;}catch(e){return;}viewed=true;track("tool_view",{tool_path:location.pathname});}
  function selected(){return [].slice.call(form.querySelectorAll('input[name="scenario"]:checked')).map(function(x){return x.value;});}
  function card(route){
    var a=document.createElement("a"),head=document.createElement("strong"),text=document.createElement("span");
    a.className="family-route";a.href=route.href;a.dataset.routeGroup=route.group;a.dataset.routeKey=route.key;head.textContent=route.title;head.appendChild(document.createTextNode(" →"));text.textContent=route.text;a.append(head,text);return a;
  }
  function renderRoutes(root,routes){root.innerHTML="";routes.forEach(function(route){root.appendChild(card(route));});}
  document.addEventListener("ap:analytics-ready",markViewed);document.addEventListener("DOMContentLoaded",function(){setTimeout(markViewed,0);});
  form.addEventListener("change",function(){if(!started){started=true;track("tool_start");}},{once:true});
  form.addEventListener("submit",function(e){
    e.preventDefault();var x=C.evaluate(selected()),error=document.getElementById("family-benefits-error");
    if(!x.valid){error.hidden=false;return;}
    error.hidden=true;renderRoutes(document.getElementById("family-primary-routes"),x.primary);renderRoutes(document.getElementById("family-secondary-routes"),x.secondary);
    var secondary=document.getElementById("family-secondary-wrap");secondary.hidden=!x.secondary.length;
    document.getElementById("family-benefits-summary").textContent=x.primary.length+" öncelikli yol ve "+x.secondary.length+" tamamlayıcı kontrol bulundu. Aynı hanede birden fazla destek birlikte değerlendirilebilir.";
    document.getElementById("family-benefits-signal").textContent=x.total+" kontrol yolu";
    result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"start"});
    track("free_result_viewed",{route_count_band:x.total<=2?"one_two":x.total<=5?"three_five":"six_plus",has_multiple_routes:x.multiple});
    if(window.APDecision)window.APDecision.complete("family_benefits","Aile destekleri kontrol sıramı oluşturdum",{route_count_band:x.total<=2?"one_two":x.total<=5?"three_five":"six_plus"});
  });
  result.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest(".family-route");if(a)track("family_route_click",{destination_path:a.getAttribute("href"),route_group:a.dataset.routeGroup||"unknown"});});
  document.getElementById("family-interest").addEventListener("click",function(){track("premium_clicked",{offer_type:"family_document_tracker",destination:"email_interest"});});
  document.getElementById("family-benefits-reset").addEventListener("click",function(){form.reset();result.hidden=true;form.scrollIntoView({behavior:"smooth",block:"start"});track("tool_reset");});
  var tests=C.runTests();if(!tests.pass){console.error("Family benefits core tests failed",tests);form.querySelector(".family-submit").disabled=true;}
})();
