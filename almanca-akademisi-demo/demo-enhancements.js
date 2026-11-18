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
    .auto-review strong{color:#102A43}
    .auto-review ul{margin:7px 0 0;padding-left:20px}
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
    badge.textContent = 'CANLI DEMO · V17.1';
    hero.prepend(badge);
    const title = hero.querySelector('h1');
    if (title) title.textContent = 'Almanca Dinleme Akademisi';
  }

  const audioBar = document.querySelector('.audio-bar');
  const audioNote = audioBar?.querySelector('small');
  if (audioNote) {
    audioNote.textContent = 'Arşivdeki 450 MP3 sentetik eSpeak kaydıdır. Tarayıcı sesi seçeneği cihazınızdaki Almanca sesi kullanır; insan kaydı değildir.';
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
  autoButton.textContent = 'Yanıtı ön değerlendir';
  taskActions?.prepend(autoButton);

  const review = document.createElement('div');
  review.id = 'autoReviewResult';
  review.className = 'auto-review hidden';
  review.setAttribute('aria-live', 'polite');
  taskActions?.after(review);

  const stopWords = new Set([
    'aber', 'alle', 'auch', 'dass', 'denn', 'der', 'die', 'das', 'eine', 'einen', 'einer', 'eines', 'für',
    'haben', 'hat', 'ihre', 'ihren', 'ihrer', 'ist', 'kann', 'mit', 'nicht', 'oder', 'sich', 'sind', 'sein',
    'seine', 'seiner', 'über', 'und', 'vom', 'von', 'wenn', 'werden', 'wird', 'wie', 'weil', 'welche', 'zur',
    'zum', 'diese', 'dieser', 'dieses', 'mehr', 'noch', 'sehr', 'dann', 'daher', 'durch', 'beim', 'ihm', 'ihn'
  ]);

  const words = (text) => String(text || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFC')
    .replace(/[^a-zäöüß]+/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const significant = (text) => [...new Set(words(text).filter((word) => word.length >= 4 && !stopWords.has(word)))];
  const overlapRatio = (answerSet, reference) => {
    const referenceWords = significant(reference);
    if (!referenceWords.length) return 0;
    return referenceWords.filter((word) => answerSet.has(word)).length / referenceWords.length;
  };

  const minimumWords = { A1: 10, A2: 14, B1: 24, B2: 32, C1: 42, C2: 48 };

  autoButton.addEventListener('click', () => {
    const response = byId('written')?.value.trim() || '';
    const lesson = chosen;
    if (!lesson) return;
    review.classList.remove('hidden');
    if (words(response).length < 4) {
      review.innerHTML = '<strong>Ön değerlendirme: 0/5</strong><p>Değerlendirme için Almanca yanıtınızı biraz daha geliştirin.</p>'
        + '<p class="small">Bu puan yalnızca kelime ve kanıt örtüşmesine dayalıdır; dilbilgisi, doğruluk veya CEFR seviyesi ölçmez.</p>';
      return;
    }

    const answerWords = new Set(significant(response));
    const modelCoverage = overlapRatio(answerWords, lesson.reflection.model_answer_de);
    const evidenceHits = lesson.reflection.evidence_de.filter((item) => {
      const referenceWords = significant(item);
      const matches = referenceWords.filter((word) => answerWords.has(word)).length;
      return matches >= 2 || (referenceWords.length > 0 && matches / referenceWords.length >= 0.18);
    }).length;
    const contentScore = modelCoverage >= 0.32 || evidenceHits >= 2 ? 2 : (modelCoverage >= 0.16 || evidenceHits >= 1 ? 1 : 0);
    const evidenceScore = Math.min(2, evidenceHits);
    const responseWords = words(response).length;
    const sentenceCount = response.split(/[.!?]+/).filter((part) => part.trim().length > 2).length;
    const clarityScore = responseWords >= minimumWords[lesson.level] && sentenceCount >= 2 ? 1 : 0;
    const total = contentScore + evidenceScore + clarityScore;

    const details = [
      `Kernaussage / içerik örtüşmesi: ${contentScore}/2`,
      `Transkript kanıtı işaretleri: ${evidenceScore}/2`,
      `Uzunluk ve cümle yapısı eşiği: ${clarityScore}/1`
    ];
    review.innerHTML = `<strong>Otomatik ön değerlendirme: ${total}/5</strong>`
      + `<ul>${details.map((item) => `<li>${item}</li>`).join('')}</ul>`
      + '<p class="small">Bu sonuç yalnızca kelime ve kanıt örtüşmesine dayalı taslak geri bildirimdir. Dilbilgisi, anlamın tümü, telaffuz veya CEFR düzeyi değerlendirmesi değildir; model yanıtla birlikte kontrol edin.</p>';
    try {
      localStorage.setItem(`AP-V16-${lesson.id}-auto-preview`, JSON.stringify({
        score: total,
        total: 5,
        method: 'transparent_lexical_evidence_preview',
        at: new Date().toISOString()
      }));
    } catch {
      // Yerel depolama kapalıysa ön değerlendirme yine ekranda gösterilir.
    }
  });

  byId('lesson')?.addEventListener('change', () => review.classList.add('hidden'));

  const notice = document.querySelector('aside .notice');
  if (notice) {
    notice.textContent = 'Bu demo resmî CEFR, telc veya Goethe sınavı değildir. Nesnel sorular cevap anahtarıyla puanlanır; açık uçlu ön değerlendirme yalnızca içerik ve kanıt işaretlerini yaklaşık olarak kontrol eder.';
  }

  const qualityNotes = document.querySelector('aside h3');
  if (qualityNotes) qualityNotes.textContent = 'Demo ve kalite notları';

  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = '<div class="limitations"><strong>Şeffaflık:</strong> 450 MP3 eSpeak tabanlı sentetik kayıttır. Tarayıcı sesi cihaz bağımlı yapay sestir. Açık uçlu ön puan resmî veya güvenilir bir dil yeterlilik notu değildir.</div>'
      + '<p><a href="/">Almanya Pusulası ana sayfası</a> · Demo verileri yalnızca bu tarayıcıda saklanır.</p>';
  }
})();
