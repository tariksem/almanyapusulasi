import { lessons, reviewAnswer } from './lessons.mjs';

const element = (id) => document.getElementById(id);
const audio = element('lesson-audio');
const audioStatus = element('audio-status');
const audioRetry = element('audio-retry');
const audioDownload = element('audio-download');
const form = element('reply-form');
const reply = element('reply');
const menu = element('lesson-menu');
const menuSummary = menu.querySelector('summary');
const lessonLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
const lessonTitle = element('lesson-title');
const next = element('next-lesson');
const feedback = element('reply-feedback');
const mobile = matchMedia('(max-width: 700px)');
const drafts = new Map();
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const feedbackMessages = {
  empty: 'Bir Almanca yanıt yazıp tekrar dene.',
  ready: 'Kısa yanıtın bu alıştırmanın temel bilgisini karşılıyor.',
  partial: 'Yanıtında işe yarayan bir bilgi var. Şu ayrıntıyı da kontrol et.',
  compare: 'Şu ayrıntıyı konuşmayla tekrar karşılaştır.',
  unclear: 'Şu noktayı gözden geçir. İstersen örnek yanıtı açabilirsin.',
};

let activeLesson;
let recordings;
let audioRequest;
let audioObjectUrl;

function savedDraft(id) {
  if (drafts.has(id)) return drafts.get(id);
  try {
    return localStorage.getItem('ap-gunluk-almanca:' + id) || '';
  } catch {
    return '';
  }
}

function clearFeedback() {
  delete feedback.dataset.status;
  element('feedback-summary').textContent = '';
  element('feedback-tips').replaceChildren();
}

function showLesson(lesson, focusTitle) {
  if (activeLesson !== lesson) {
    activeLesson = lesson;
    const recording = recordings[lesson.id];
    element('lesson-meta').textContent = lesson.sourceId.slice(0, 2) + ' · ' + Math.round(recording.seconds) + ' sn';
    lessonTitle.textContent = lesson.title;
    element('lesson-task').textContent = lesson.task;
    element('lesson-transcript').textContent = recording.transcript;
    element('example-answer').textContent = lesson.example;
    element('example-evidence').textContent = lesson.evidence;
    element('example-panel').open = false;
    element('transcript-panel').open = false;
    reply.value = savedDraft(lesson.id);
    clearFeedback();

    prepareAudio(recording.audio);
    for (const link of lessonLinks) {
      if (link.hash === '#' + lesson.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    const nextLesson = lessons[lessons.indexOf(lesson) + 1];
    next.hidden = !nextLesson;
    if (nextLesson) next.href = '#' + nextLesson.id;
  } else if (!audioRetry.hidden && focusTitle) {
    prepareAudio(recordings[lesson.id].audio);
  }

  if (focusTitle) {
    if (mobile.matches) menu.open = false;
    lessonTitle.focus();
  }
}

async function startCourse() {
  try {
    const response = await fetch(new URL('listening.json', import.meta.url));
    if (!response.ok) throw new Error('Listening data unavailable');
    recordings = await response.json();
    if (lessons.some(({ id }) => !recordings[id]?.audio || !recordings[id]?.transcript)) {
      throw new Error('Listening data incomplete');
    }
    if (mobile.matches) menu.open = false;
    showLesson(lessonById.get(location.hash.slice(1)) || lessons[0], false);
    element('lesson-content').hidden = false;
  } catch (error) {
    element('course-error').textContent = 'Ders yüklenemedi. Sayfayı yenileyerek tekrar dene.';
    element('course-error').hidden = false;
    console.error(error);
  } finally {
    element('course-load').hidden = true;
  }
}

function selectLesson(event) {
  const lesson = lessonById.get(event.currentTarget.hash.slice(1));
  if (!lesson || !activeLesson) return;
  event.preventDefault();
  if (location.hash !== '#' + lesson.id) history.pushState(null, '', '#' + lesson.id);
  showLesson(lesson, true);
}

for (const link of lessonLinks) link.addEventListener('click', selectLesson);
next.addEventListener('click', selectLesson);
window.addEventListener('hashchange', () => {
  if (!activeLesson) return;
  const lesson = lessonById.get(location.hash.slice(1));
  if (lesson || !location.hash) showLesson(lesson || lessons[0], true);
});
element('choose-lesson').addEventListener('click', () => {
  menu.open = true;
  menuSummary.focus();
});

function setPlaybackSpeed() {
  audio.playbackRate = Number(element('audio-speed').value);
}

function setAudioStatus(message = '', failed = false) {
  audioStatus.textContent = message;
  audioRetry.hidden = !failed;
}

function showAudioError() {
  setAudioStatus('Ses açılamadı. Yeniden deneyebilir veya MP3’ü indirebilirsin.', true);
}

async function prepareAudio(path, retry = false) {
  audioRequest?.abort();
  const request = new AbortController();
  audioRequest = request;

  audio.hidden = true;
  if (audio.hasAttribute('src')) {
    audio.removeAttribute('src');
    audio.load();
  }
  if (audioObjectUrl) {
    URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = undefined;
  }

  const source = new URL(path, location.href);
  source.searchParams.set('v', 'audio3');
  audioDownload.href = source.href;
  setAudioStatus('Ses hazırlanıyor…');

  try {
    const response = await fetch(source, { signal: request.signal, cache: retry ? 'reload' : 'default' });
    if (!response.ok || response.status === 206) throw new Error('Complete recording unavailable');
    const recording = await response.blob();
    if (request.signal.aborted) return;
    if (!recording.size || !/^audio\/mpeg(?:;|$)/i.test(recording.type)) {
      throw new Error('Unexpected recording format');
    }

    audioObjectUrl = URL.createObjectURL(recording);
    audio.src = audioObjectUrl;
    audio.hidden = false;
    setAudioStatus();
    if (retry) await audio.play();
  } catch (error) {
    if (request.signal.aborted) return;
    if (error.name === 'NotAllowedError' && !audio.hidden) {
      setAudioStatus('Ses hazır. Oynat düğmesine bas.');
    } else {
      showAudioError();
    }
  }
}

element('audio-speed').addEventListener('change', setPlaybackSpeed);
audioRetry.addEventListener('click', () => prepareAudio(recordings[activeLesson.id].audio, true));
audio.addEventListener('loadedmetadata', setPlaybackSpeed);
audio.addEventListener('playing', () => setAudioStatus());
audio.addEventListener('error', () => {
  if (!audio.hidden && audio.error) showAudioError();
});

reply.addEventListener('input', () => {
  if (!activeLesson) return;
  clearFeedback();
  drafts.set(activeLesson.id, reply.value);
  try {
    localStorage.setItem('ap-gunluk-almanca:' + activeLesson.id, reply.value);
  } catch {
    // The draft remains available during this visit.
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeLesson) return;
  const result = reviewAnswer(activeLesson, reply.value);
  feedback.dataset.status = result.status;
  element('feedback-summary').textContent = feedbackMessages[result.status];
  const tips = result.tips.map((tip) => {
    const item = document.createElement('li');
    item.textContent = tip;
    return item;
  });
  element('feedback-tips').replaceChildren(...tips);
});

startCourse();
