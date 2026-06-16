(function () {
  const GA_ID = "G-2E8PT2LRG1";
  const STORAGE_KEY = "ap_cookie_consent";

  function loadGoogleAnalytics() {
    if (window.__apGaLoaded) return;
    window.__apGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);

    gtag("js", new Date());
    gtag("config", GA_ID, {
      anonymize_ip: true
    });
  }

  function removeBanner() {
    const el = document.querySelector(".cookie-banner");
    if (el) el.remove();
  }

  function createBanner() {
    if (document.querySelector(".cookie-banner")) return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div>
          <strong>Gizlilik ayarları</strong>
          <p>
            Siteyi geliştirmek için Google Analytics kullanmak istiyoruz. Onay verirseniz analiz çerezleri çalışır.
            Reddederseniz site normal şekilde çalışmaya devam eder.
          </p>
        </div>
        <div class="cookie-actions">
          <button type="button" class="btn btn-secondary cookie-reject">Reddet</button>
          <button type="button" class="btn btn-primary cookie-accept">Kabul et</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector(".cookie-accept").addEventListener("click", function () {
      localStorage.setItem(STORAGE_KEY, "accepted");
      loadGoogleAnalytics();
      removeBanner();
    });

    banner.querySelector(".cookie-reject").addEventListener("click", function () {
      localStorage.setItem(STORAGE_KEY, "rejected");
      removeBanner();
    });
  }

  window.apResetCookieConsent = function () {
    localStorage.removeItem(STORAGE_KEY);
    createBanner();
  };

  document.addEventListener("DOMContentLoaded", function () {
    const choice = localStorage.getItem(STORAGE_KEY);

    if (choice === "accepted") {
      loadGoogleAnalytics();
      return;
    }

    if (choice === "rejected") {
      return;
    }

    createBanner();
  });
})();
