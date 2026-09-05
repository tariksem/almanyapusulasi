(function(){
  "use strict";
  var STORAGE_KEY="ap_cookie_consent";

  function analyticsAllowed(){
    try{return localStorage.getItem(STORAGE_KEY)==="accepted";}catch(e){return false;}
  }

  function track(name,params){
    if(!analyticsAllowed()||typeof window.gtag!=="function")return;
    window.gtag("event",name,params||{});
  }

  function sendClick(el){
    track(el.getAttribute("data-track")||"commercial_click",{
      link_url:el.href||"",
      link_text:(el.textContent||"").trim().slice(0,120),
      commercial_area:el.getAttribute("data-commercial-area")||"unknown",
      commercial_target:el.getAttribute("data-commercial-target")||"unknown",
      partner:el.getAttribute("data-commercial-provider")||"",
      page_path:location.pathname
    });
  }

  function detectCommercialArea(){
    var slot=document.querySelector("[data-affiliate-slot]");
    return slot?slot.getAttribute("data-affiliate-slot")||"unknown":"unknown";
  }

  document.addEventListener("click",function(event){
    var el=event.target.closest&&event.target.closest("a[data-track]");
    if(el)sendClick(el);
  });

  document.addEventListener("DOMContentLoaded",function(){
    var slots=[].slice.call(document.querySelectorAll("[data-affiliate-slot]"));
    if(!slots.length)return;

    var area=detectCommercialArea();
    track("commercial_page_view",{commercial_area:area,page_path:location.pathname,page_title:document.title});

    if("IntersectionObserver" in window){
      var seen={};
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var key=entry.target.getAttribute("data-affiliate-slot")||"unknown";
          if(seen[key])return;
          seen[key]=true;
          track("affiliate_slot_view",{commercial_area:key,page_path:location.pathname,slot_active:entry.target.classList.contains("is-active")});
          observer.unobserve(entry.target);
        });
      },{threshold:0.25});
      slots.forEach(function(slot){observer.observe(slot);});
    }
  });
})();
