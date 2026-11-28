'use strict';

(() => {
  const byId = (id) => document.getElementById(id);
  const head = document.head;

  document.title = 'Almanca Akademisi Dinleme Demo | Almanya Pusulası';

  const addMeta = (name, content) => {
    if (head.querySelector(`meta[name="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    head.appendChild(meta);
  };
  addMeta('description', 'A1-C2 seviyelerinde 90 Almanca dinleme senaryosu, 450 ses kaydı, 282 soru ve model yanıt içeren Almanya Pusulası Akademi demosu.');
  addMeta('robots', 'noindex,follow');

  if (!head.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = 'https://almanyapusulasi.de/almanca-akademisi-demo/';
    head.appendChild(canonical);
  }

  const style = document.createElement('style');
  style.textContent = `
    header .brand-home{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}
    header .brand-home img{width:46px;height:46px;object-fit:contain;border-radius:12px;background:#fff;padding:4px}
    header .brand-copy{display:grid;gap:1px}
    header .brand-copy strong{font-size:18px}
    header .brand-copy small{font-size:12px;opacity:.82}
    .demo-badge{display:inline-flex;align-items:center;background:#D89B2B;color:#102A43;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:800;margin-bottom:10px}
    .voice-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:11px}
    .auto-review{border:1px solid #b9cad8;background:#f6f8fb;border-radius:10px;padding:12px;margin:10px 0;font-size:13px}
    .auto-review h4{color:#102A43;font-size:14px;margin:0}
    .auto-review p{margin:7px 0 0}
    .auto-review ul{margin:7px 0 0;padding-left:20px}
    .auto-review li+li{margin-top:8px}
    .auto-review li strong{display:block;color:#102A43}
    .limitations{border-top:1px solid #e2e8f0;margin-top:14px;padding-top:12px}
    @media(max-width:560px){header .brand-copy small{display:none}}
  `;
  head.appendChild(style);

  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = '';
    const home = document.createElement('a');
    home.className = 'brand-home';
    home.href = '/';
    home.setAttribute('aria-label', 'Almanya Pusulası ana sayfası');
    home.innerHTML = '<img src="/assets/brand/almanya-pusulasi-logo.png" alt="Almanya Pusulası logosu" width="46" height="46">'
      + '<span class="brand-copy"><strong>Almanya Pusulası</strong><small>Almanca Akademisi · A1-C2</small></span>';
    const baseLessons = document.createElement('a');
    baseLessons.href = 'V15_TUM_DERSLER_ONIZLEME.html';
    baseLessons.textContent = '360 temel dersi aç';
    header.append(home, baseLessons);
  }

  const hero = document.querySelector('.hero');
  if (hero) {
    const badge = document.createElement('span');
    badge.className = 'demo-badge';
    badge.textContent = 'CANLI DEMO · V17.2';
    hero.prepend(badge);
    const title = hero.querySelector('h1');
    if (title) title.textContent = 'Almanca Dinleme Akademisi';
  }

  const audioBar = document.querySelector('.audio-bar');
  const audioNote = audioBar?.querySelector('small');
  if (audioNote) {
    audioNote.textContent = 'Arşivdeki 450 MP3 Almanca nöral yapay sesle üretilmiş sentetik kayıttır; insan kaydı değildir. Tarayıcı sesi seçeneği cihazınızdaki Almanca sesi kullanır.';
  }

  const voiceActions = document.createElement('div');
  voiceActions.className = 'voice-actions';
  voiceActions.innerHTML = '<button type="button" class="secondary" id="browserVoice">Tarayıcı sesiyle oku</button>'
    + '<span class="small" id="voiceStatus" aria-live="polite"></span>';
  audioBar?.appendChild(voiceActions);

  const browserVoice = byId('browserVoice');
  const voiceStatus = byId('voiceStatus');
  let speaking = false;

  const stopBrowserVoice = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
    if (browserVoice) browserVoice.textContent = 'Tarayıcı sesiyle oku';
  };

  const chooseGermanVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const german = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('de'));
    return german.find((voice) => /natural|neural|online/i.test(voice.name)) || german[0] || null;
  };

  if (!('speechSynthesis' in window)) {
    if (browserVoice) browserVoice.disabled = true;
    if (voiceStatus) voiceStatus.textContent = 'Bu tarayıcı sesli okumayı desteklemiyor.';
  } else if (browserVoice) {
    browserVoice.addEventListener('click', () => {
      if (speaking) {
        stopBrowserVoice();
        if (voiceStatus) voiceStatus.textContent = 'Okuma durduruldu.';
        return;
      }
      if (!chosen?.transcript) return;
      const utterance = new SpeechSynthesisUtterance(chosen.transcript);
      const selectedVoice = chooseGermanVoice();
      utterance.lang = selectedVoice?.lang || 'de-DE';
      utterance.voice = selectedVoice;
      utterance.rate = ['A1', 'A2'].includes(chosen.level) ? 0.86 : 0.94;
      utterance.onend = () => {
        stopBrowserVoice();
        if (voiceStatus) voiceStatus.textContent = 'Okuma tamamlandı.';
      };
      utterance.onerror = () => {
        stopBrowserVoice();
        if (voiceStatus) voiceStatus.textContent = 'Tarayıcı sesi başlatılamadı.';
      };
      byId('player')?.pause();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      speaking = true;
      browserVoice.textContent = 'Okumayı durdur';
      if (voiceStatus) voiceStatus.textContent = selectedVoice
        ? `${selectedVoice.name} · ${selectedVoice.lang}`
        : 'Varsayılan Almanca tarayıcı sesi';
    });
  }

  byId('lesson')?.addEventListener('change', stopBrowserVoice, true);
  byId('player')?.addEventListener('play', stopBrowserVoice);
  window.addEventListener('beforeunload', stopBrowserVoice);

  const taskActions = byId('reveal')?.parentElement;
  const autoButton = document.createElement('button');
  autoButton.type = 'button';
  autoButton.className = 'secondary';
  autoButton.id = 'autoReview';
  autoButton.textContent = 'Yanıtı gözden geçir';
  autoButton.setAttribute('aria-controls', 'autoReviewResult');
  autoButton.setAttribute('aria-expanded', 'false');
  taskActions?.prepend(autoButton);

  const review = document.createElement('div');
  review.id = 'autoReviewResult';
  review.className = 'auto-review hidden';
  review.setAttribute('role', 'status');
  review.setAttribute('aria-live', 'polite');
  taskActions?.after(review);

  const reviewLabels = {
    possible: 'Yanıtında olası bir ipucu var',
    review: 'Bu noktayı kontrol et',
    compare: 'Olası çelişkiyi konuşmayla karşılaştır',
  };

  const addReviewText = (parent, tag, text) => {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.append(element);
    return element;
  };

  const clearReview = () => {
    review.classList.add('hidden');
    review.replaceChildren();
    autoButton.setAttribute('aria-expanded', 'false');
  };

  autoButton.addEventListener('click', () => {
    if (!chosen) return;
    const response = byId('written')?.value || '';
    const feedback = academyAnswerFeedback.reviewAnswer(chosen.id, response);

    review.replaceChildren();
    addReviewText(review, 'h4', 'Yanıtını geliştir');
    if (feedback.kind === 'empty') {
      addReviewText(review, 'p', 'Başlamak için Almanca yanıtını yaz.');
    } else {
      if (feedback.kind === 'tailored') {
        addReviewText(review, 'p', 'İpuçları sınırlı ifade kalıplarına dayanır. Yanıtının konuşmayla örtüşüp örtüşmediğini örnek ve transkript üzerinden kontrol et.');
      }
      const list = document.createElement('ul');
      for (const point of feedback.points) {
        const item = document.createElement('li');
        if (feedback.kind === 'tailored') addReviewText(item, 'strong', reviewLabels[point.status]);
        addReviewText(item, 'span', point.hint);
        list.append(item);
      }
      review.append(list);
      addReviewText(review, 'p', 'Karşılaştırmak için “Model yanıtı / kanıtı göster” düğmesini kullan.');
    }
    review.classList.remove('hidden');
    autoButton.setAttribute('aria-expanded', 'true');
  });

  byId('written')?.addEventListener('input', clearReview);
  byId('lesson')?.addEventListener('change', clearReview);
  byId('levels')?.addEventListener('click', clearReview);

  const notice = document.querySelector('aside .notice');
  if (notice) {
    notice.textContent = 'Nesnel sorular cevap anahtarıyla puanlanır. Yazılı yanıtlarını örnek yanıt ve transkript kanıtlarıyla karşılaştırabilirsin. Bu demo resmî CEFR, telc veya Goethe sınavı değildir.';
  }

  const qualityNotes = document.querySelector('aside h3');
  if (qualityNotes) qualityNotes.textContent = 'Demo ve kalite notları';

  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = '<div class="limitations">450 MP3 Almanca nöral yapay sesle üretilmiştir. Tarayıcı sesinin kalitesi cihazına göre değişebilir. Yazılı yanıt ipuçları öz değerlendirme içindir.</div>'
      + '<p><a href="/">Almanya Pusulası ana sayfası</a> · Demo verileri yalnızca bu tarayıcıda saklanır.</p>';
  }
})();
