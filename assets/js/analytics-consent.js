(function () {
  "use strict";

  const GA_ID = "G-2E8PT2LRG1";
  const STORAGE_KEY = "ap_cookie_consent";
  const ACCEPTED = "accepted";
  const REJECTED = "rejected";

  const SITE_NAV = [
    { href: "/finans/", label: "Finans", section: "finans" },
    { href: "/schufa/", label: "SCHUFA", section: "schufa" },
    { href: "/kredi/", label: "Kredi", section: "kredi" },
    { href: "/blue-card/", label: "Blue Card", section: "blue-card" },
    { href: "/kindergeld/", label: "Kindergeld", section: "kindergeld" },
    { href: "/vergi/", label: "Vergi", section: "vergi" },
    { href: "/emeklilik/", label: "Emeklilik", section: "emeklilik" }
  ];

  function currentSection() {
    const path = window.location.pathname.toLowerCase();

    if (
      path.startsWith("/finans") ||
      path.startsWith("/almanyadan-turkiyeye-para-transferi") ||
      path.startsWith("/almanyada-banka-hesabi") ||
      path.startsWith("/haftpflichtversicherung") ||
      path.startsWith("/almanya-saglik-sigortasi-gkv-pkv") ||
      path.startsWith("/almanyada-elektrik-aboneligi") ||
      path.startsWith("/sperrkonto")
    ) return "finans";

    if (path.startsWith("/schufa")) return "schufa";

    if (
      path.startsWith("/kredi") ||
      path.startsWith("/almanyada-ev-kredisi") ||
      path.startsWith("/ev-kredisi-") ||
      path.startsWith("/ev-alirken-ek-masraflar") ||
      path.startsWith("/muenster-ev-satin-alma")
    ) return "kredi";

    if (path.startsWith("/blue-card")) return "blue-card";

    if (path.startsWith("/kindergeld") || path.startsWith("/kinderzuschlag")) {
      return "kindergeld";
    }

    if (
      path.startsWith("/vergi") ||
      path.startsWith("/almanya-vergi-siniflari") ||
      path.startsWith("/almanyada-vergi-beyannamesi") ||
      path.startsWith("/almanyada-vergiden-dusulen-masraflar") ||
      path.startsWith("/steuererklaerung") ||
      path.startsWith("/elster-vergi-beyannamesi")
    ) return "vergi";

    if (
      path.startsWith("/emeklilik") ||
      path.startsWith("/almanya-emeklilik-sistemi") ||
      path.startsWith("/turkiye-emeklisi-almanyada") ||
      path.startsWith("/eyt-emekliligi-almanyada-bildirim") ||
      path.startsWith("/turkiye-almanya-emeklilik")
    ) return "emeklilik";

    return "";
  }

  function normalizeSiteNavigation() {
    const activeSection = currentSection();

    document.querySelectorAll(".site-header .nav").forEach(function (nav) {
      nav.replaceChildren();

      SITE_NAV.forEach(function (item) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        if (item.section === activeSection) {
          link.setAttribute("aria-current", "page");
        }
        nav.appendChild(link);
      });
    });
  }

  function ensureGtagQueue() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function setConsent(analyticsGranted) {
    ensureGtagQueue();
    window.gtag("consent", "update", {
      analytics_storage: analyticsGranted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function loadGoogleAnalytics() {
    if (window.__apGaLoaded) {
      setConsent(true);
      window.gtag("event", "page_view");
      return;
    }

    window.__apGaLoaded = true;
    ensureGtagQueue();

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
    setConsent(true);

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function deleteAnalyticsCookies() {
    const host = window.location.hostname;
    const domains = ["", host, "." + host];
    const cookies = document.cookie ? document.cookie.split(";") : [];

    cookies.forEach(function (cookie) {
      const name = cookie.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;

      domains.forEach(function (domain) {
        const domainPart = domain ? "; domain=" + domain : "";
        document.cookie = name + "=; Max-Age=0; path=/" + domainPart + "; SameSite=Lax";
      });
    });
  }

  function removeBanner() {
    const banner = document.querySelector(".cookie-banner");
    if (banner) banner.remove();
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch (error) {
      // The current page still respects the choice if storage is unavailable.
    }
  }

  function readChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function createBanner() {
    if (document.querySelector(".cookie-banner")) return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "cookie-title");
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div>
          <strong id="cookie-title">Gizlilik ayarları</strong>
          <p>
            Zorunlu depolama site tercihinizi hatırlar. Google Analytics yalnızca izninizle yüklenir;
            reddederseniz site normal çalışır. Ayrıntılar için <a href="/privacy/">Gizlilik Politikası</a> sayfasına bakabilirsiniz.
          </p>
        </div>
        <div class="cookie-actions">
          <button type="button" class="btn btn-secondary cookie-reject">Yalnızca gerekli</button>
          <button type="button" class="btn btn-primary cookie-accept">Analize izin ver</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector(".cookie-accept").addEventListener("click", function () {
      saveChoice(ACCEPTED);
      loadGoogleAnalytics();
      removeBanner();
    });

    banner.querySelector(".cookie-reject").addEventListener("click", function () {
      saveChoice(REJECTED);
      setConsent(false);
      deleteAnalyticsCookies();
      removeBanner();
    });

    banner.querySelector(".cookie-reject").focus();
  }

  function addPrivacySettingsButton() {
    const footerLinks = document.querySelector(".footer .footer-inner > div:last-child");
    if (!footerLinks || footerLinks.querySelector(".privacy-settings-button")) return;

    footerLinks.appendChild(document.createTextNode(" · "));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "privacy-settings-button";
    button.textContent = "Çerez tercihleri";
    button.addEventListener("click", function () {
      window.apResetCookieConsent();
    });
    footerLinks.appendChild(button);
  }

  window.apResetCookieConsent = function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // The banner can still be shown if storage is unavailable.
    }
    setConsent(false);
    deleteAnalyticsCookies();
    createBanner();
  };

  document.addEventListener("DOMContentLoaded", function () {
    normalizeSiteNavigation();
    addPrivacySettingsButton();

    const choice = readChoice();
    if (choice === ACCEPTED) {
      loadGoogleAnalytics();
      return;
    }

    if (choice === REJECTED) {
      return;
    }

    createBanner();
  });
})();
