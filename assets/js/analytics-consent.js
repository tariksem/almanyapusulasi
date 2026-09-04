(function () {
  "use strict";

  const GA_ID = "G-2E8PT2LRG1";
  const STORAGE_KEY = "ap_cookie_consent";
  const ACCEPTED = "accepted";
  const REJECTED = "rejected";

  const shellStyles = document.createElement("link");
  shellStyles.rel = "stylesheet";
  shellStyles.href = "/assets/site-shell.css";
  document.head.appendChild(shellStyles);

  const SECTIONS = [
    { key: "goc-kariyer", href: "/goc-kariyer/", label: "Göç & Kariyer", icon: "🧭", paths: ["/goc-kariyer", "/chancenkarte-firsat-karti", "/almanyada-ausbildung", "/almanya-is-arama-siteleri", "/diploma-denkligi-anabin-zab"] },
    { key: "is-gelir", href: "/is-gelir/", label: "İş & Gelir", icon: "💼", paths: ["/is-gelir", "/minijob-2026", "/almanyada-is-sozlesmesi-arbeitsvertrag", "/almanyada-isten-ayrilma-kundigung-kundigungsfrist", "/arbeitszeugnis-nedir", "/arbeitslosengeld-basvuru", "/grundsicherungsgeld-2026"] },
    { key: "vatandaslik", href: "/vatandaslik/", label: "Vatandaşlık", icon: "🇩🇪", paths: ["/vatandaslik", "/almanya-vatandaslik-sartlari", "/vatandaslik-basvurusu-belgeler", "/vatandaslik-basvuru-sureci-adim-adim", "/vatandaslik-dil-sarti-b1", "/einbuergerungstest-hazirlik", "/cifte-vatandaslik-turkiye-almanya", "/almanyada-dogan-cocuk-vatandaslik"] },
    { key: "yerlesim", href: "/yerlesim/", label: "Yerleşim", icon: "🏡", paths: ["/yerlesim", "/almanya-adres-kaydi-anmeldung", "/rundfunkbeitrag-nedir-nasil-odenir", "/almanya-kiralik-ev-siteleri", "/almanyada-ev-kiralama-rehberi", "/kira-sozlesmesi-mietvertrag-nelere-dikkat", "/kaution-depozito-geri-alma", "/nebenkosten-yan-giderler-hesabi"] },
    { key: "mobilite", href: "/mobilite-arac/", label: "Mobilite & Araç", icon: "🚘", paths: ["/mobilite-arac", "/almanyada-araba-satin-alma", "/turk-ehliyeti-almanyada-degistirme", "/kfz-versicherung", "/arac-tescili-zulassung", "/tuv-hu-muayene", "/kfz-steuer", "/deutschlandticket-2026"] },
    { key: "finans", href: "/finans/", label: "Finans", icon: "💳", paths: ["/finans", "/almanyadan-turkiyeye-para-transferi", "/almanyada-banka-hesabi", "/haftpflichtversicherung", "/almanyada-elektrik-aboneligi", "/sperrkonto"] },
    { key: "saglik", href: "/saglik-sigortasi/", label: "Sağlık Sigortası", icon: "🏥", paths: ["/saglik-sigortasi", "/almanya-saglik-sigortasi-gkv-pkv", "/familienversicherung", "/krankenkasse-degistirme", "/is-birakinca-saglik-sigortasi"] },
    { key: "schufa", href: "/schufa/", label: "SCHUFA", icon: "📄", paths: ["/schufa"] },
    { key: "kredi", href: "/kredi/", label: "Ev & Kredi", icon: "🏠", paths: ["/kredi", "/almanyada-ev-kredisi", "/ev-kredisi-", "/ev-alirken-ek-masraflar", "/muenster-ev-satin-alma"] },
    { key: "blue-card", href: "/blue-card/", label: "Blue Card", icon: "🪪", paths: ["/blue-card"] },
    { key: "kindergeld", href: "/kindergeld/", label: "Kindergeld", icon: "👨‍👩‍👧‍👦", paths: ["/kindergeld", "/kinderzuschlag"] },
    { key: "vergi", href: "/vergi/", label: "Vergi", icon: "🧾", paths: ["/vergi", "/almanya-vergi-siniflari", "/evli-ciftler-vergi-sinifi-secimi", "/steuer-id-vergi-kimlik-numarasi", "/kirchensteuer-kilise-vergisi-cikma", "/almanyada-vergi-beyannamesi", "/almanyada-vergiden-dusulen-masraflar", "/steuererklaerung", "/elster-vergi-beyannamesi"] },
    { key: "emeklilik", href: "/emeklilik/", label: "Emeklilik", icon: "💶", paths: ["/emeklilik", "/almanya-emeklilik-sistemi", "/turkiye-emeklisi-almanyada", "/eyt-emekliligi-almanyada-bildirim", "/turkiye-almanya-emeklilik"] },
    { key: "turkiye", href: "/turkiye-seyahati/", label: "Türkiye Seyahati", icon: "🚗", paths: ["/turkiye-seyahati", "/almanyadan-turkiyeye-arabayla", "/turkiye-yolu-"] }
  ];

  const PRIMARY_KEYS = ["goc-kariyer", "is-gelir", "yerlesim", "finans", "schufa"];

  function currentPath() { return window.location.pathname.toLowerCase(); }

  function currentSection() {
    const path = currentPath();
    return SECTIONS.find(function (section) {
      return section.paths.some(function (prefix) { return path.startsWith(prefix); });
    }) || null;
  }

  function pageHeading() {
    const h1 = document.querySelector("h1");
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    return document.title.split("|")[0].trim();
  }

  function sectionLink(section, className) {
    const active = currentSection();
    const isActive = active && active.key === section.key;
    return '<a class="' + className + (isActive ? " is-active" : "") + '" href="' + section.href + '"' + (isActive ? ' aria-current="page"' : "") + '>' + section.label + "</a>";
  }

  function renderHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const primary = PRIMARY_KEYS.map(function (key) { return SECTIONS.find(function (section) { return section.key === key; }); }).filter(Boolean);
    const active = currentSection();
    const megaItems = SECTIONS.map(function (section) {
      const currentClass = active && active.key === section.key ? " is-active" : "";
      return '<a class="mega-link' + currentClass + '" href="' + section.href + '"><span class="mega-icon">' + section.icon + '</span><span><strong>' + section.label + '</strong><small>Rehberleri görüntüle</small></span></a>';
    }).join("");

    header.innerHTML = '<div class="container header-inner">' +
      '<a class="site-brand" href="/" aria-label="Almanya Pusulası ana sayfa"><img class="site-brand-logo" src="/assets/brand/almanya-pusulasi-logo-64.png" alt=""><span class="site-brand-copy"><strong>Almanya Pusulası</strong><small>Almanya’da yaşam rehberi</small></span></a>' +
      '<button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation"><span></span><span></span><span></span><span class="sr-only">Menüyü aç</span></button>' +
      '<nav class="site-nav" id="site-navigation" aria-label="Ana menü"><div class="primary-nav-links">' + primary.map(function (section) { return sectionLink(section, "site-nav-link"); }).join("") + '</div>' +
      '<details class="nav-more"><summary>Tüm Rehberler <span aria-hidden="true">⌄</span></summary><div class="nav-mega"><div class="nav-mega-head"><strong>Tüm konu başlıkları</strong><span>İhtiyacınıza göre bir bölüm seçin</span></div><div class="nav-mega-grid">' + megaItems + '</div></div></details></nav></div>';

    const toggle = header.querySelector(".mobile-menu-toggle");
    const nav = header.querySelector(".site-nav");
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.body.classList.remove("menu-open");
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.body.classList.remove("menu-open");
      const details = header.querySelector(".nav-more"); if (details) details.open = false;
    });
  }

  function renderContextBar() {
    if (currentPath() === "/" || document.querySelector(".site-context-bar")) return;
    const header = document.querySelector(".site-header"); if (!header) return;
    const section = currentSection(); const currentLabel = pageHeading();
    let crumbs = '<a href="/">Ana sayfa</a><span class="crumb-sep">›</span>';
    if (section) {
      const isHub = currentPath() === section.href.toLowerCase();
      crumbs += isHub ? '<strong>' + section.label + '</strong>' : '<a href="' + section.href + '">' + section.label + '</a><span class="crumb-sep">›</span><strong>' + currentLabel + '</strong>';
    } else crumbs += '<strong>' + currentLabel + '</strong>';
    const bar = document.createElement("div"); bar.className = "site-context-bar";
    bar.innerHTML = '<div class="container site-context-inner"><nav class="breadcrumbs" aria-label="Sayfa yolu">' + crumbs + '</nav></div>';
    header.insertAdjacentElement("afterend", bar);
  }

  function renderHubReturn() {
    const section = currentSection(); const footer = document.querySelector(".footer");
    if (!section || !footer || currentPath() === section.href.toLowerCase() || document.querySelector(".hub-return-rail")) return;
    const rail = document.createElement("section"); rail.className = "hub-return-rail";
    rail.innerHTML = '<div class="container"><div class="hub-return-card"><div><span class="hub-return-kicker">Bu rehber bir konu kümesinin parçası</span><h2>' + section.icon + ' ' + section.label + ' bölümünde devam edin</h2><p>İlgili rehberleri aynı bölümde topladık; bir sonraki adımı buradan seçebilirsiniz.</p></div><a class="btn btn-primary" href="' + section.href + '">' + section.label + ' rehberleri →</a></div></div>';
    footer.insertAdjacentElement("beforebegin", rail);
  }

  function renderFooter() {
    const footer = document.querySelector(".footer"); if (!footer) return;
    footer.innerHTML = '<div class="container footer-grid"><div class="footer-brand"><a href="/" class="footer-brand-name">Almanya Pusulası</a><p>Almanya’da yaşayan ve Almanya’ya gelmek isteyen Türkler için pratik, bağlantılı ve düzenli güncellenen rehberler.</p></div><div><strong class="footer-title">Popüler Rehberler</strong><a href="/goc-kariyer/">Göç & Kariyer</a><a href="/is-gelir/">İş & Gelir</a><a href="/vatandaslik/">Vatandaşlık</a><a href="/yerlesim/">Yerleşim</a><a href="/finans/">Finans</a><a href="/saglik-sigortasi/">Sağlık Sigortası</a><a href="/schufa/">SCHUFA</a></div><div><strong class="footer-title">Diğer Konular</strong><a href="/mobilite-arac/">Mobilite & Araç</a><a href="/kredi/">Ev & Kredi</a><a href="/blue-card/">Blue Card</a><a href="/kindergeld/">Kindergeld</a><a href="/vergi/">Vergi</a><a href="/emeklilik/">Emeklilik</a><a href="/turkiye-seyahati/">Türkiye Seyahati</a></div><div class="footer-legal"><strong class="footer-title">Site</strong><a href="/about/">Hakkımızda</a><a href="/contact/">İletişim</a><a href="/privacy/">Gizlilik</a><a href="/impressum/">Impressum</a></div></div><div class="container footer-bottom"><span>© 2026 Almanya Pusulası</span><span>Bağımsız Türkçe Almanya rehberi</span></div>';
  }

  function ensureGtagQueue() { window.dataLayer = window.dataLayer || []; if (!window.gtag) window.gtag = function () { window.dataLayer.push(arguments); }; }
  function setConsent(analyticsGranted) { ensureGtagQueue(); window.gtag("consent", "update", { analytics_storage: analyticsGranted ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); }
  function loadGoogleAnalytics() {
    if (window.__apGaLoaded) { setConsent(true); window.gtag("event", "page_view"); return; }
    window.__apGaLoaded = true; ensureGtagQueue(); window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 }); setConsent(true);
    const script = document.createElement("script"); script.async = true; script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID); document.head.appendChild(script);
    window.gtag("js", new Date()); window.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  function deleteAnalyticsCookies() {
    const host = window.location.hostname; const domains = ["", host, "." + host]; const cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach(function (cookie) { const name = cookie.split("=")[0].trim(); if (name !== "_ga" && name.indexOf("_ga_") !== 0) return; domains.forEach(function (domain) { const domainPart = domain ? "; domain=" + domain : ""; document.cookie = name + "=; Max-Age=0; path=/" + domainPart + "; SameSite=Lax"; }); });
  }
  function removeBanner() { const banner = document.querySelector(".cookie-banner"); if (banner) banner.remove(); }
  function saveChoice(choice) { try { localStorage.setItem(STORAGE_KEY, choice); } catch (error) {} }
  function readChoice() { try { return localStorage.getItem(STORAGE_KEY); } catch (error) { return null; } }
  function createBanner() {
    if (document.querySelector(".cookie-banner")) return;
    const banner = document.createElement("div"); banner.className = "cookie-banner"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-modal", "true"); banner.setAttribute("aria-labelledby", "cookie-title");
    banner.innerHTML = '<div class="cookie-banner-inner"><div><strong id="cookie-title">Gizlilik ayarları</strong><p>Zorunlu depolama site tercihinizi hatırlar. Google Analytics yalnızca izninizle yüklenir; reddederseniz site normal çalışır. Ayrıntılar için <a href="/privacy/">Gizlilik Politikası</a> sayfasına bakabilirsiniz.</p></div><div class="cookie-actions"><button type="button" class="btn btn-secondary cookie-reject">Yalnızca gerekli</button><button type="button" class="btn btn-primary cookie-accept">Analize izin ver</button></div></div>';
    document.body.appendChild(banner); banner.querySelector(".cookie-accept").addEventListener("click", function () { saveChoice(ACCEPTED); loadGoogleAnalytics(); removeBanner(); }); banner.querySelector(".cookie-reject").addEventListener("click", function () { saveChoice(REJECTED); setConsent(false); deleteAnalyticsCookies(); removeBanner(); });
  }
  function addPrivacySettingsButton() {
    const legal = document.querySelector(".footer-legal"); if (!legal || legal.querySelector(".privacy-settings-button")) return;
    const button = document.createElement("button"); button.type = "button"; button.className = "privacy-settings-button"; button.textContent = "Çerez tercihleri"; button.addEventListener("click", function () { window.apResetCookieConsent(); }); legal.appendChild(button);
  }
  window.apResetCookieConsent = function () { try { localStorage.removeItem(STORAGE_KEY); } catch (error) {} setConsent(false); deleteAnalyticsCookies(); createBanner(); };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader(); renderContextBar(); renderHubReturn(); renderFooter(); addPrivacySettingsButton();
    const choice = readChoice(); if (choice === ACCEPTED) loadGoogleAnalytics(); else if (choice !== REJECTED) createBanner();
  });
})();