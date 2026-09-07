(function(){
  "use strict";

  /*
   * Affiliate slots stay disabled until an exact attributable product URL
   * or approved widget is copied from the relevant authenticated partner dashboard.
   *
   * Verified partner accounts / deeplink sources (2026-09-07):
   * - TARIFCHECK Partner-ID 204420
   *   Girokonto: /werbemittel/finanzen/girokonto/deeplinks/
   *   Kfz:       /werbemittel/kfz-versicherung/autoversicherung/deeplinks/
   * - CHECK24 Partner-ID 1177200
   *   Strom:     /werbemittel/strom/deeplink/
   *
   * Never infer or construct a public tracking URL from a Partner-ID alone.
   */
  var PARTNERS = {
    "bank-comparison": {
      enabled: false,
      provider: "TARIFCHECK",
      partnerId: "204420",
      url: "",
      label: "Banka hesaplarını karşılaştır",
      note: "Ticari bağlantı — sonuçlar ve koşullar TARIFCHECK üzerinde gösterilir.",
      target: "bank-affiliate"
    },
    "insurance-comparison": {
      enabled: false,
      provider: "",
      partnerId: "",
      url: "",
      label: "Sigorta tekliflerini karşılaştır",
      note: "Ticari bağlantı — karşılaştırma kapsamı partner ürününe göre değişebilir.",
      target: "insurance-affiliate"
    },
    "tax-software": {
      enabled: false,
      provider: "",
      partnerId: "",
      url: "",
      label: "Vergi yazılımı seçeneklerini incele",
      note: "Ticari bağlantı — fiyat, kapsam, veri işleme ve uygunluk koşullarını sağlayıcı sitesinde yeniden kontrol edin.",
      target: "tax-software-affiliate"
    },
    "internet-comparison": {
      enabled: false,
      provider: "",
      partnerId: "",
      url: "",
      label: "İnternet tarifelerini karşılaştır",
      note: "Ticari bağlantı — adres uygunluğu, hız, aktivasyon, router, indirim dönemi ve toplam sözleşme maliyetini partner sitesinde yeniden kontrol edin.",
      target: "internet-affiliate"
    },
    "money-transfer": {
      enabled: false,
      provider: "",
      partnerId: "",
      url: "",
      label: "Para transferi teklifini incele",
      note: "Ticari bağlantı — ücret ve kur işlem anında yeniden kontrol edilmelidir.",
      target: "transfer-affiliate"
    },
    "electricity-comparison": {
      enabled: false,
      provider: "CHECK24",
      partnerId: "1177200",
      url: "",
      label: "Elektrik tarifelerini karşılaştır",
      note: "Ticari bağlantı — fiyat, bonus, sözleşme süresi ve toplam yıllık maliyeti CHECK24 üzerinde yeniden kontrol edin.",
      target: "electricity-affiliate"
    },
    "kfz-insurance": {
      enabled: false,
      provider: "TARIFCHECK",
      partnerId: "204420",
      url: "",
      label: "Kfz sigorta tekliflerini karşılaştır",
      note: "Ticari bağlantı — prim kişisel ve araç bilgilerine göre değişir; kapsam ve Selbstbeteiligung'u TARIFCHECK üzerinde ayrıca kontrol edin.",
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
