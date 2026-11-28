import { lessons, reviewAnswer } from './lessons.mjs';

const element = (id) => document.getElementById(id);
const audio = element('lesson-audio');
const audioError = element('audio-error');
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

    audioError.hidden = true;
    audio.src = recording.audio;
    audio.load();
    for (const link of lessonLinks) {
      if (link.hash === '#' + lesson.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    const nextLesson = lessons[lessons.indexOf(lesson) + 1];
    next.hidden = !nextLesson;
    if (nextLesson) next.href = '#' + nextLesson.id;
  } else if (audio.error && focusTitle) {
    audioError.hidden = true;
    audio.load();
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

element('audio-speed').addEventListener('change', setPlaybackSpeed);
audio.addEventListener('loadedmetadata', () => {
  audioError.hidden = true;
  setPlaybackSpeed();
});
audio.addEventListener('error', () => {
  audioError.hidden = false;
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
