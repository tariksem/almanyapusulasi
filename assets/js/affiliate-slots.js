(function(){
  "use strict";

  /*
   * Affiliate configuration is intentionally disabled by default.
   * Activate only after the relevant publisher account has been approved
   * and replace the empty url values with the publisher-specific tracking URL.
   */
  var PARTNERS = {
    "bank-comparison": {
      enabled: false,
      provider: "",
      url: "",
      label: "Banka hesaplarını karşılaştır",
      note: "Ticari bağlantı — sonuçlar ve koşullar partner sitesinde gösterilir.",
      target: "bank-affiliate"
    },
    "insurance-comparison": {
      enabled: false,
      provider: "",
      url: "",
      label: "Sigorta tekliflerini karşılaştır",
      note: "Ticari bağlantı — karşılaştırma kapsamı partner sitesine göre değişebilir.",
      target: "insurance-affiliate"
    },
    "money-transfer": {
      enabled: false,
      provider: "",
      url: "",
      label: "Para transferi teklifini incele",
      note: "Ticari bağlantı — ücret ve kur işlem anında yeniden kontrol edilmelidir.",
      target: "transfer-affiliate"
    },
    "electricity-comparison": {
      enabled: false,
      provider: "",
      url: "",
      label: "Elektrik tarifelerini karşılaştır",
      note: "Ticari bağlantı — fiyat, bonus, sözleşme süresi ve toplam yıllık maliyeti partner sitesinde yeniden kontrol edin.",
      target: "electricity-affiliate"
    },
    "kfz-insurance": {
      enabled: false,
      provider: "",
      url: "",
      label: "Kfz sigorta tekliflerini karşılaştır",
      note: "Ticari bağlantı — prim kişisel ve araç bilgilerine göre değişir; kapsam ve Selbstbeteiligung'u ayrıca kontrol edin.",
      target: "kfz-affiliate"
    }
  };

  function renderSlot(slot){
    var key=slot.getAttribute("data-affiliate-slot");
    var cfg=PARTNERS[key];
    if(!cfg||!cfg.enabled||!cfg.url)return;
    var provider=cfg.provider?'<span class="affiliate-provider">'+cfg.provider+'</span>':'';
    slot.classList.add("affiliate-slot","is-active");
    slot.innerHTML='<div><span class="affiliate-kicker">Ticari bağlantı</span><h3>'+cfg.label+'</h3><p>'+cfg.note+'</p>'+provider+'</div><a class="btn btn-primary" href="'+cfg.url+'" target="_blank" rel="sponsored noopener" data-track="affiliate_click" data-commercial-area="'+key+'" data-commercial-target="'+cfg.target+'" data-commercial-provider="'+(cfg.provider||'')+'">Teklifi aç →</a>';
  }

  document.addEventListener("DOMContentLoaded",function(){
    document.querySelectorAll("[data-affiliate-slot]").forEach(renderSlot);
  });
})();
