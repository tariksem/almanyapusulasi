'use strict';

const data = JSON.parse(document.getElementById('source').textContent);
const lessons = data.scenarios;
const storagePrefix = 'AP-V16-'; // V16 notlarının V17.1'de taşınabilmesi için korunur.
const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

let level = 'A1';
let chosen = null;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Dosya modunda veya kısıtlı tarayıcılarda depolama kapalı olabilir.
  }
}

function setLevel(value) {
  level = value;
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  $('levels').innerHTML = levels.map((item) => (
    `<button type="button" class="lv" aria-pressed="${item === level}" data-level="${item}">${item}</button>`
  )).join('');
  document.querySelectorAll('.lv').forEach((button) => {
    button.onclick = () => setLevel(button.dataset.level);
  });

  const subset = lessons.filter((item) => item.level === level);
  $('lesson').innerHTML = subset.map((item) => (
    `<option value="${esc(item.id)}">Ünite ${item.unit} — ${esc(item.title)}</option>`
  )).join('');
  const selected = chosen?.level === level ? chosen.id : subset[0].id;
  $('lesson').value = selected;
  load(selected);
}

function load(id) {
  const item = lessons.find((candidate) => candidate.id === id);
  if (!item) return;
  chosen = item;

  $('title').textContent = item.title;
  $('subheading').textContent = `${item.level} · Ünite ${item.unit} · ${item.genre} · ${item.speakers.join(' / ')}`;
  $('player').src = item.audio_path;
  $('player').load();
  $('transcript').textContent = item.transcript;
  $('transcript').classList.add('hidden');
  $('transcriptBtn').textContent = 'Transkripti göster';
  $('transcriptBtn').setAttribute('aria-expanded', 'false');

  $('quiz').innerHTML = item.objective.map((question, questionIndex) => (
    `<fieldset class="q" id="q${questionIndex}">`
      + `<legend>${questionIndex + 1}. ${esc(question.prompt_de)}</legend>`
      + `<div class="options">${question.options.map((option, optionIndex) => (
        `<label class="option"><input type="radio" name="q${questionIndex}" value="${optionIndex}">${esc(option)}</label>`
      )).join('')}</div>`
      + `<div class="feedback hidden" id="f${questionIndex}"></div>`
    + '</fieldset>'
  )).join('');

  $('result').textContent = '';
  $('openprompt').textContent = item.reflection.prompt_de;
  $('written').value = storageGet(`${storagePrefix}${item.id}-response`) || '';
  $('model').classList.add('hidden');
  $('rubric').classList.add('hidden');
  $('reveal').setAttribute('aria-expanded', 'false');
  $('taskstatus').textContent = '';
  $('availability').textContent = 'Bu senaryoda Almanca model yanıt ve kanıtlı anlama soruları var.';
  $('prosody').textContent = item.prosody_sensitive
    ? 'Bu derste doğal vurgu/ironi sentetik kayıttan güvenilir biçimde puanlanamaz.'
    : '';
  $('model').innerHTML = '';
  $('rubric-list').innerHTML = '';
  $('selfscore').textContent = '';
}

function grade() {
  if (!chosen) return;
  let correct = 0;
  let answered = 0;

  chosen.objective.forEach((question, questionIndex) => {
    const selection = document.querySelector(`input[name="q${questionIndex}"]:checked`);
    const feedback = $(`f${questionIndex}`);
    feedback.classList.remove('hidden', 'bad', 'correct');
    if (!selection) {
      feedback.classList.add('bad');
      feedback.textContent = 'Boş bırakıldı.';
      return;
    }

    answered += 1;
    const isCorrect = Number(selection.value) === question.answer_index;
    if (isCorrect) correct += 1;
    feedback.classList.add(isCorrect ? 'correct' : 'bad');
    feedback.innerHTML = `${isCorrect ? 'Doğru.' : 'Yanlış.'} `
      + `<strong>Doğru yanıt:</strong> ${esc(question.options[question.answer_index])}`
      + `<div>${esc(question.explanation_tr)}</div>`
      + (question.explanation_de ? `<div lang="de">${esc(question.explanation_de)}</div>` : '')
      + `<div class="small">Metin kanıtı: <span lang="de">${esc(question.evidence_de)}</span></div>`;
  });

  $('result').textContent = `${correct}/${chosen.objective.length} doğru · ${answered} yanıt`;
  storageSet(`${storagePrefix}${chosen.id}-objective`, JSON.stringify({
    correct,
    answered,
    total: chosen.objective.length,
    at: new Date().toISOString(),
  }));
}

function revealModel() {
  if (!chosen) return;
  const reflection = chosen.reflection;
  $('model').classList.remove('hidden');
  $('model').innerHTML = '<div class="model">'
    + '<strong>Örnek Almanca yanıt</strong>'
    + `<p lang="de">${esc(reflection.model_answer_de)}</p>`
    + '<strong>Transkript kanıtları</strong>'
    + `<ul lang="de">${reflection.evidence_de.map((evidence) => `<li>${esc(evidence)}</li>`).join('')}</ul>`
    + '</div>';
  $('rubric').classList.remove('hidden');
  $('rubric-list').innerHTML = reflection.rubric.map((item) => (
    `<label><input type="checkbox" data-score="${item.points}">${esc(item.criterion)} (+${item.points})</label>`
  )).join('');
  $('rubric-list').querySelectorAll('input').forEach((checkbox) => {
    checkbox.onchange = () => {
      const score = Array.from($('rubric-list').querySelectorAll('input:checked'))
        .reduce((sum, input) => sum + Number(input.dataset.score), 0);
      $('selfscore').textContent = `Öz puan: ${score}/5`;
    };
  });
  $('reveal').setAttribute('aria-expanded', 'true');
  $('taskstatus').textContent = 'Model yanıt açıldı; bu bir otomatik not değildir.';
}

function exportProgress() {
  const saved = {};
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(storagePrefix)) saved[key] = localStorage.getItem(key);
    }
  } catch {
    $('exportstatus').textContent = 'Tarayıcı depolamasına erişilemedi.';
    return;
  }

  const payload = {
    exported_at: new Date().toISOString(),
    application: 'Almanya Pusulası Akademi Dinleme V17.1',
    scoring_notice: 'Açık uçlu yanıtlar öz değerlendirmedir; otomatik dil notu değildir.',
    saved,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'almanya-pusulasi-akademi-v17-ilerleme.json';
  link.click();
  URL.revokeObjectURL(url);
  $('exportstatus').textContent = `${Object.keys(saved).length} kayıt dışa aktarıldı.`;
}

$('check').onclick = grade;
$('lesson').onchange = (event) => load(event.target.value);
$('transcriptBtn').onclick = () => {
  const hidden = $('transcript').classList.toggle('hidden');
  $('transcriptBtn').textContent = hidden ? 'Transkripti göster' : 'Transkripti gizle';
  $('transcriptBtn').setAttribute('aria-expanded', String(!hidden));
};
$('written').oninput = () => {
  if (chosen) storageSet(`${storagePrefix}${chosen.id}-response`, $('written').value);
};
$('reveal').onclick = revealModel;
$('export').onclick = exportProgress;
$('player').onerror = () => {
  $('availability').textContent = 'Ses yüklenemedi. Paketi klasör yapısını koruyarak çıkardığınızdan emin olun.';
};

setLevel('A1');
