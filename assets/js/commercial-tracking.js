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

  function payload(el){
    return {
      link_url:el.href||"",
      link_text:(el.textContent||"").trim().slice(0,120),
      commercial_area:el.getAttribute("data-commercial-area")||detectCommercialArea(),
      commercial_target:el.getAttribute("data-commercial-target")||"unknown",
      partner:el.getAttribute("data-commercial-provider")||"",
      page_path:location.pathname
    };
  }

  function sendClick(el){
    track(el.getAttribute("data-track")||"commercial_click",payload(el));
  }

  function detectCommercialArea(){
    var slot=document.querySelector("[data-affiliate-slot]");
    if(slot)return slot.getAttribute("data-affiliate-slot")||"unknown";
    var stack=document.querySelector("[data-offer-stack]");
    return stack?stack.getAttribute("data-offer-stack")||"unknown":"unknown";
  }

  function isDecisionDestination(href){
    if(!href)return false;
    try{
      var url=new URL(href,location.origin);
      if(url.origin!==location.origin)return false;
      return /(?:-secim-araci|-hesaplayici|-uygunluk-kontrolu|-kontrolu|\/araclar\/)/.test(url.pathname);
    }catch(e){return false;}
  }

  document.addEventListener("click",function(event){
    var tracked=event.target.closest&&event.target.closest("a[data-track]");
    if(tracked){sendClick(tracked);return;}

    var el=event.target.closest&&event.target.closest("a[href]");
    if(el&&isDecisionDestination(el.getAttribute("href"))){
      track("comparison_to_tool",payload(el));
    }
  });

  document.addEventListener("DOMContentLoaded",function(){
    var slots=[].slice.call(document.querySelectorAll("[data-affiliate-slot]"));
    var stacks=[].slice.call(document.querySelectorAll("[data-offer-stack]"));
    var area=detectCommercialArea();

    if(slots.length||stacks.length){
      track("commercial_page_view",{commercial_area:area,page_path:location.pathname,page_title:document.title});
    }

    if("IntersectionObserver" in window){
      var seenSlots={};
      var slotObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var key=entry.target.getAttribute("data-affiliate-slot")||"unknown";
          if(seenSlots[key])return;
          seenSlots[key]=true;
          track("affiliate_slot_view",{
            commercial_area:key,
            page_path:location.pathname,
            slot_active:entry.target.classList.contains("is-active")
          });
          slotObserver.unobserve(entry.target);
        });
      },{threshold:0.25});
      slots.forEach(function(slot){slotObserver.observe(slot);});

      var seenStacks={};
      var stackObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var key=entry.target.getAttribute("data-offer-stack")||"unknown";
          if(seenStacks[key])return;
          seenStacks[key]=true;
          track("commercial_offer_stack_view",{
            commercial_area:key,
            page_path:location.pathname,
            stack_active:entry.target.classList.contains("is-active"),
            offer_count:entry.target.querySelectorAll(".commercial-offer-card").length
          });
          stackObserver.unobserve(entry.target);
        });
      },{threshold:0.25});
      stacks.forEach(function(stack){stackObserver.observe(stack);});
    }
  });
})();
