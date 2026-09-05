(function(){
  "use strict";

  const GA_ID="G-2E8PT2LRG1";
  const CONSENT_KEY="ap_cookie_consent";
  const ACCEPTED="accepted";
  const REJECTED="rejected";

  const shellCss=document.createElement("link");
  shellCss.rel="stylesheet";
  shellCss.href="/assets/site-shell.css";
  document.head.appendChild(shellCss);

  const SECTIONS=[
    {key:"haberler",href:"/haberler/",label:"Haberler",icon:"📰",paths:["/haberler"]},
    {key:"tools",href:"/araclar/",label:"Araçlar",icon:"🧮",paths:[
      "/araclar","/meslek-almanya-yolu-karar-araci","/almanyaya-gelis-yolu-secim-araci",
      "/is-teklifi-degerlendirme-araci","/ilk-90-gun-almanya-planlayici","/vergi-yontemi-secim-araci",
      "/sigorta-secim-araci","/internet-secim-araci","/banka-secim-araci","/para-transferi-maliyet-hesaplayici",
      "/brutto-netto","/netto-brutto","/elterngeld-hesaplayici","/kindergeld-hesaplayici",
      "/blue-card-uygunluk","/chancenkarte-puan","/warmmiete-kira-butcesi","/nebenkosten-abrechnung",
      "/araba-toplam-maliyet","/internet-tarife-maliyet","/kleinunternehmer-ciro","/vatandaslik-testi",
      "/almanyaya-tasinma-kontrol-listesi"
    ]},
    {key:"goc",href:"/goc-kariyer/",label:"Göç & Kariyer",icon:"🧭",paths:[
      "/goc-kariyer","/chancenkarte","/almanyada-ausbildung","/almanya-is-arama","/diploma-denkligi",
      "/almanyada-yazilimci-it-kariyeri","/almanyada-yazilimci-maasi-2026",
      "/almanyada-doktor-hekim-kariyeri","/almanyada-doktor-denklik-suresi",
      "/almanyada-pflegefachkraft-hemsire-kariyeri","/turk-hemsire-almanya-denklik","/almanyada-pflege-maasi-2026",
      "/almanyada-muhendis-kariyeri","/almanyada-muhendis-maasi-2026",
      "/almanyada-ogretmen-schulbegleitung-kariyeri","/schulbegleiter-almanca-b2-gerekli-mi",
      "/almanyada-erzieher-pedagoji-kariyeri","/erzieher-denklik-nrw-2026",
      "/almanyada-elektroniker-elektrikci-kariyeri","/almanyada-elektroniker-ausbildung","/almanyada-elektrikci-denklik-gerekli-mi",
      "/almanyada-lojistik-depo-kariyeri","/lagerhelfer-vize-almanya",
      "/almanyada-satis-office-kariyeri","/sachbearbeiter-almanca-seviyesi",
      "/almanyada-lkw-fahrer-sofor-kariyeri","/lkw-fahrer-turk-ehliyeti-almanya"
    ]},
    {key:"is",href:"/is-gelir/",label:"İş & Gelir",icon:"💼",paths:["/is-gelir","/minijob","/almanyada-is-sozlesmesi","/almanyada-isten-ayrilma","/arbeitszeugnis","/arbeitslosengeld","/grundsicherungsgeld"]},
    {key:"vat",href:"/vatandaslik/",label:"Vatandaşlık",icon:"🇩🇪",paths:["/vatandaslik","/almanya-vatandaslik","/einbuergerungstest","/cifte-vatandaslik","/almanyada-dogan-cocuk"]},
    {key:"yer",href:"/yerlesim/",label:"Yerleşim",icon:"🏡",paths:["/yerlesim","/almanya-adres","/rundfunkbeitrag","/almanya-kiralik","/almanyada-ev-kiralama","/kira-sozlesmesi","/kaution","/nebenkosten","/warmmiete-kaltmiete"]},
    {key:"mob",href:"/mobilite-arac/",label:"Mobilite & Araç",icon:"🚘",paths:["/mobilite-arac","/almanyada-araba","/turk-ehliyeti","/kfz-","/arac-tescili","/tuv-hu","/deutschlandticket"]},
    {key:"aile",href:"/aile-cocuk/",label:"Aile & Çocuk",icon:"👨‍👩‍👧‍👦",paths:["/aile-cocuk","/elterngeld","/elternzeit","/mutterschutz","/kinderkrankengeld","/kita-platz"]},
    {key:"fin",href:"/finans/",label:"Finans",icon:"💳",paths:[
      "/finans","/almanyadan-turkiyeye-para","/almanya-turkiye-para-gonderme-maliyeti-2026",
      "/almanyada-banka","/ucretsiz-girokonto-2026","/girokonto-karsilastirma-2026",
      "/banka-hesabi-schufa-gerekli-mi","/basiskonto-kim-acabilir","/almanyada-elektrik","/sperrkonto"
    ]},
    {key:"sig",href:"/sigorta/",label:"Sigorta",icon:"🛡️",paths:["/sigorta","/haftpflicht","/rechtsschutz","/hausrat","/berufsunfaehigkeits","/seyahat-saglik"]},
    {key:"internet",href:"/telefon-internet/",label:"Telefon & İnternet",icon:"🌐",paths:["/telefon-internet","/almanyada-internet","/dsl-kabel-glasfaser","/internet-yavas","/internet-tarife-karsilastirma-2026"]},
    {key:"sag",href:"/saglik-sigortasi/",label:"Sağlık Sigortası",icon:"🏥",paths:["/saglik-sigortasi","/almanya-saglik-sigortasi","/familienversicherung","/krankenkasse","/is-birakinca"]},
    {key:"schufa",href:"/schufa/",label:"SCHUFA",icon:"📄",paths:["/schufa"]},
    {key:"kredi",href:"/kredi/",label:"Ev & Kredi",icon:"🏠",paths:["/kredi","/almanyada-ev-kredisi","/ev-kredisi","/ev-alirken","/muenster-ev"]},
    {key:"blue",href:"/blue-card/",label:"Blue Card",icon:"🪪",paths:["/blue-card"]},
    {key:"kind",href:"/kindergeld/",label:"Kindergeld",icon:"👶",paths:["/kindergeld","/kinderzuschlag"]},
    {key:"vergi",href:"/vergi/",label:"Vergi",icon:"🧾",paths:["/vergi","/almanya-vergi","/steuer","/kirchensteuer","/elster"]},
    {key:"emek",href:"/emeklilik/",label:"Emeklilik",icon:"💶",paths:["/emeklilik","/turkiye-emeklisi","/eyt","/almanya-emeklilik","/turkiye-almanya-emeklilik"]},
    {key:"tr",href:"/turkiye-seyahati/",label:"Türkiye Seyahati",icon:"🚗",paths:["/turkiye-seyahati","/almanyadan-turkiyeye-arabayla","/turkiye-yolu"]}
  ];

  const PRIMARY=["haberler","tools","goc","is","yer","fin"];
  const currentPath=()=>location.pathname.toLowerCase();
  const section=()=>SECTIONS.find(s=>s.paths.some(p=>currentPath().startsWith(p)))||null;
  const pageTitle=()=>{
    const h=document.querySelector("h1");
    return h?h.textContent.trim():document.title.split("|")[0];
  };

  function renderHeader(){
    const header=document.querySelector(".site-header");
    if(!header)return;
    const active=section();
    const primary=PRIMARY.map(k=>SECTIONS.find(s=>s.key===k));
    const mega=SECTIONS.map(s=>'<a class="mega-link'+(active&&active.key===s.key?' is-active':'')+'" href="'+s.href+'"><span class="mega-icon">'+s.icon+'</span><span><strong>'+s.label+'</strong><small>'+(s.key==='haberler'?'Güncel gelişmeler':s.key==='tools'?'Hesaplayıcılar ve kontroller':'Rehberleri görüntüle')+'</small></span></a>').join("");
    header.innerHTML='<div class="container header-inner"><a class="site-brand" href="/"><img class="site-brand-logo" src="/assets/brand/almanya-pusulasi-logo-64.png" alt=""><span class="site-brand-copy"><strong>Almanya Pusulası</strong><small>Almanya’da yaşam rehberi</small></span></a><button class="mobile-menu-toggle" type="button" aria-expanded="false"><span></span><span></span><span></span></button><nav class="site-nav"><div class="primary-nav-links">'+primary.map(s=>'<a class="site-nav-link'+(active&&active.key===s.key?' is-active':'')+'" href="'+s.href+'">'+s.label+'</a>').join("")+'</div><details class="nav-more"><summary>Tüm Rehberler <span>⌄</span></summary><div class="nav-mega"><div class="nav-mega-grid">'+mega+'</div></div></details></nav></div>';
    const toggle=header.querySelector(".mobile-menu-toggle");
    const nav=header.querySelector(".site-nav");
    toggle.onclick=()=>{
      const open=toggle.getAttribute("aria-expanded")==="true";
      toggle.setAttribute("aria-expanded",String(!open));
      nav.classList.toggle("is-open",!open);
      document.body.classList.toggle("menu-open",!open);
    };
  }

  function renderContext(){
    if(currentPath()==="/")return;
    const header=document.querySelector(".site-header");
    const s=section();
    if(!header)return;
    let html='<a href="/">Ana sayfa</a><span class="crumb-sep">›</span>';
    html+=s&&currentPath()!==s.href?'<a href="'+s.href+'">'+s.label+'</a><span class="crumb-sep">›</span><strong>'+pageTitle()+'</strong>':'<strong>'+(s?s.label:pageTitle())+'</strong>';
    const bar=document.createElement("div");
    bar.className="site-context-bar";
    bar.innerHTML='<div class="container site-context-inner"><nav class="breadcrumbs">'+html+'</nav></div>';
    header.after(bar);
  }

  function renderFooter(){
    const footer=document.querySelector(".footer");
    if(!footer)return;
    footer.innerHTML='<div class="container footer-grid"><div class="footer-brand"><a href="/" class="footer-brand-name">Almanya Pusulası</a><p>Almanya’da yaşayan ve Almanya’ya gelmek isteyen Türkler için pratik rehberler ve seçilmiş güncel gelişmeler.</p></div><div><strong class="footer-title">Keşfet</strong><a href="/araclar/">Araçlar</a><a href="/haberler/">Haberler</a><a href="/goc-kariyer/">Göç & Kariyer</a><a href="/is-gelir/">İş & Gelir</a><a href="/aile-cocuk/">Aile & Çocuk</a><a href="/vatandaslik/">Vatandaşlık</a><a href="/finans/">Finans</a><a href="/sigorta/">Sigorta</a></div><div><strong class="footer-title">Diğer Konular</strong><a href="/yerlesim/">Yerleşim</a><a href="/saglik-sigortasi/">Sağlık Sigortası</a><a href="/mobilite-arac/">Mobilite & Araç</a><a href="/schufa/">SCHUFA</a><a href="/kredi/">Ev & Kredi</a><a href="/vergi/">Vergi</a></div><div class="footer-legal"><strong class="footer-title">Site</strong><a href="/about/">Hakkımızda</a><a href="/contact/">İletişim</a><a href="/ticari-seffaflik/">Ticari Şeffaflık</a><a href="/privacy/">Gizlilik</a><a href="/impressum/">Impressum</a><button type="button" class="privacy-settings-link">Gizlilik ayarları</button></div></div><div class="container footer-bottom"><span>© 2026 Almanya Pusulası</span><span>Bağımsız Türkçe Almanya rehberi</span></div>';
    footer.querySelector(".privacy-settings-link").onclick=()=>showConsent(true);
  }

  function renderReturnRail(){
    const s=section();
    const footer=document.querySelector(".footer");
    if(!s||!footer||currentPath()===s.href||s.key==="haberler"||s.key==="tools")return;
    const rail=document.createElement("section");
    rail.className="hub-return-rail";
    rail.innerHTML='<div class="container"><div class="hub-return-card"><div><span class="hub-return-kicker">Bu rehber bir konu kümesinin parçası</span><h2>'+s.icon+' '+s.label+' bölümünde devam edin</h2><p>İlgili rehberleri aynı bölümde topladık.</p></div><a class="btn btn-primary" href="'+s.href+'">'+s.label+' rehberleri →</a></div></div>';
    footer.before(rail);
  }

  function ensureDataLayer(){
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  }

  function updateConsent(ok){
    ensureDataLayer();
    gtag("consent","update",{analytics_storage:ok?"granted":"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  }

  function loadAnalytics(){
    if(window.__apGaLoaded){updateConsent(true);return;}
    window.__apGaLoaded=true;
    ensureDataLayer();
    gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    updateConsent(true);
    const script=document.createElement("script");
    script.async=true;
    script.src="https://www.googletagmanager.com/gtag/js?id="+GA_ID;
    document.head.appendChild(script);
    gtag("js",new Date());
    gtag("config",GA_ID,{allow_google_signals:false,allow_ad_personalization_signals:false});
  }

  function readConsent(){try{return localStorage.getItem(CONSENT_KEY);}catch(_){return null;}}
  function saveConsent(v){try{localStorage.setItem(CONSENT_KEY,v);}catch(_){}}
  function track(name,params){if(readConsent()!==ACCEPTED)return;ensureDataLayer();gtag("event",name,params||{});}

  function bindGrowthTracking(){
    document.addEventListener("click",event=>{
      const a=event.target.closest&&event.target.closest("a");
      const b=event.target.closest&&event.target.closest("button");
      if(a){
        const href=a.getAttribute("href")||"";
        const toolPaths=SECTIONS.find(s=>s.key==="tools").paths;
        if(href.startsWith("/")&&(href==="/araclar/"||toolPaths.some(p=>href.toLowerCase().startsWith(p)))){
          track("tool_open",{tool_path:href,link_text:(a.textContent||"").trim().slice(0,100)});
        }
        try{
          const url=new URL(a.href,location.href);
          if(url.hostname&&url.hostname!==location.hostname){
            track("outbound_click",{link_url:url.href,link_text:(a.textContent||"").trim().slice(0,100)});
          }
        }catch(_){ }
      }
      if(b&&section()&&section().key==="tools"){
        track("tool_calculate",{tool_path:currentPath(),button_text:(b.textContent||"").trim().slice(0,100)});
      }
    });
  }

  function injectHomepageTools(){
    if(currentPath()!=="/")return;
    const hero=document.querySelector(".home-hero");
    if(!hero||document.querySelector(".home-tools-growth"))return;
    const s=document.createElement("section");
    s.className="section popular-strip home-tools-growth";
    s.innerHTML='<div class="container"><div class="section-header"><span class="section-label">Ücretsiz Araçlar</span><h2>Hesaplayın, kontrol edin, karar verin</h2><p>En çok ihtiyaç duyulan Almanya hesaplayıcılarına doğrudan ulaşın.</p></div><div class="popular-grid"><a class="popular-link" href="/meslek-almanya-yolu-karar-araci/"><span>🧭</span><span><strong>Mesleğimle gelebilir miyim?</strong><small>Meslek, denklik ve vize yolu</small></span></a><a class="popular-link" href="/is-teklifi-degerlendirme-araci/"><span>💼</span><span><strong>İş teklifim iyi mi?</strong><small>Maaş, saat, izin ve vize eşiği</small></span></a><a class="popular-link" href="/ilk-90-gun-almanya-planlayici/"><span>🗓️</span><span><strong>İlk 90 Gün</strong><small>Yeni gelenler için kişisel plan</small></span></a><a class="popular-link" href="/sigorta-secim-araci/"><span>🛡️</span><span><strong>Sigorta Seçimi</strong><small>Risklerinize göre öncelik verin</small></span></a><a class="popular-link" href="/internet-secim-araci/"><span>🌐</span><span><strong>İnternet Seçimi</strong><small>DSL, Kabel veya Glasfaser</small></span></a><a class="popular-link" href="/para-transferi-maliyet-hesaplayici/"><span>💱</span><span><strong>Para Transferi</strong><small>Gerçek efektif maliyeti görün</small></span></a></div><div style="margin-top:1.25rem"><a class="btn btn-primary" href="/araclar/">Tüm ücretsiz araçları aç →</a></div></div>';
    hero.after(s);
  }

  function showConsent(force){
    const old=document.querySelector(".cookie-banner");
    if(old)old.remove();
    if(!force&&readConsent())return;
    const banner=document.createElement("div");
    banner.className="cookie-banner";
    banner.innerHTML='<div class="cookie-banner-inner"><div><strong>Gizlilik ayarları</strong><p>Google Analytics yalnızca izninizle yüklenir. <a href="/privacy/">Gizlilik Politikası</a></p></div><div class="cookie-actions"><button class="btn btn-secondary cookie-reject">Yalnızca gerekli</button><button class="btn btn-primary cookie-accept">Analize izin ver</button></div></div>';
    document.body.appendChild(banner);
    banner.querySelector(".cookie-accept").onclick=()=>{saveConsent(ACCEPTED);banner.remove();loadAnalytics();};
    banner.querySelector(".cookie-reject").onclick=()=>{saveConsent(REJECTED);updateConsent(false);banner.remove();};
  }

  document.addEventListener("DOMContentLoaded",()=>{
    renderHeader();
    renderContext();
    renderFooter();
    renderReturnRail();
    bindGrowthTracking();
    injectHomepageTools();
    const consent=readConsent();
    if(consent===ACCEPTED)loadAnalytics();
    else if(consent!==REJECTED)showConsent(false);
  });
})();
