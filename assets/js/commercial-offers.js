(function(){
  "use strict";

  /*
   * Reusable commercial offer renderer.
   * IMPORTANT: OFFERS intentionally contains no live providers.
   * Add an offer only after partner approval and after the exact tracking URL,
   * commercial terms and verification date have been checked.
   */
  var OFFERS={
    "bank":[],
    "money-transfer":[],
    "insurance":[],
    "internet":[],
    "electricity":[],
    "kfz":[],
    "tax-software":[]
  };

  function esc(value){
    return String(value==null?"":value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function isValidOffer(offer){
    return !!(
      offer &&
      offer.enabled===true &&
      offer.provider &&
      offer.url && /^https:\/\//i.test(offer.url) &&
      offer.verifiedAt &&
      offer.disclosure &&
      Array.isArray(offer.features) && offer.features.length
    );
  }

  function renderCard(category,offer,index){
    var badge=offer.badge?'<span class="offer-badge">'+esc(offer.badge)+'</span>':'';
    var price=offer.price?'<div class="offer-price">'+esc(offer.price)+'</div>':'';
    var features=offer.features.slice(0,5).map(function(item){return '<li>'+esc(item)+'</li>';}).join('');
    var note=offer.note?'<p class="offer-note">'+esc(offer.note)+'</p>':'';
    return '<article class="commercial-offer-card">'+
      '<div class="offer-card-top"><div><span class="offer-kicker">Ticari teklif</span><h3>'+esc(offer.provider)+'</h3></div>'+badge+'</div>'+
      price+
      '<ul>'+features+'</ul>'+note+
      '<div class="offer-verified">Son doğrulama: '+esc(offer.verifiedAt)+'</div>'+
      '<a class="btn btn-primary" href="'+esc(offer.url)+'" target="_blank" rel="sponsored noopener" data-track="affiliate_click" data-commercial-area="'+esc(category)+'" data-commercial-target="offer-'+esc(String(index+1))+'" data-commercial-provider="'+esc(offer.provider)+'">Teklifi incele →</a>'+
      '<p class="offer-disclosure">'+esc(offer.disclosure)+'</p>'+
    '</article>';
  }

  function renderStack(stack){
    var category=stack.getAttribute("data-offer-stack");
    var offers=(OFFERS[category]||[]).filter(isValidOffer);
    if(!offers.length)return;
    stack.classList.add("commercial-offer-stack","is-active");
    stack.innerHTML='<div class="offer-stack-head"><span class="offer-kicker">Doğrulanmış partner teklifleri</span><h2>Teklifleri aynı kriterlerle karşılaştırın</h2><p>Fiyat ve koşullar son doğrulama tarihinden sonra değişmiş olabilir; sağlayıcı sayfasında yeniden kontrol edin.</p></div><div class="offer-grid">'+offers.map(function(offer,index){return renderCard(category,offer,index);}).join('')+'</div>';
  }

  document.addEventListener("DOMContentLoaded",function(){
    document.querySelectorAll("[data-offer-stack]").forEach(renderStack);
  });
})();
