import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const failures = [];
const notes = [];

function ok(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}

function listFiles(dir, suffix) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(full, suffix));
    else if (!suffix || entry.name.toLowerCase().endsWith(suffix)) result.push(full);
  }
  return result;
}

function normalizedRelative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function validateQuestion(question, transcript, scenarioId) {
  ok(question && typeof question === 'object', `${scenarioId}: soru nesnesi yok`);
  if (!question || typeof question !== 'object') return;
  ok(typeof question.id === 'string' && question.id.length > 0, `${scenarioId}: soru kimliği yok`);
  ok(typeof question.prompt_de === 'string' && question.prompt_de.length > 0, `${scenarioId}/${question.id}: Almanca yönerge yok`);
  ok(Array.isArray(question.options) && question.options.length >= 3, `${scenarioId}/${question.id}: seçenek sayısı yetersiz`);
  if (Array.isArray(question.options)) {
    ok(new Set(question.options).size === question.options.length, `${scenarioId}/${question.id}: yinelenen seçenek var`);
    ok(Number.isInteger(question.answer_index) && question.answer_index >= 0 && question.answer_index < question.options.length,
      `${scenarioId}/${question.id}: cevap anahtarı aralık dışında`);
  }
  ok(typeof question.evidence_de === 'string' && question.evidence_de.length > 0, `${scenarioId}/${question.id}: kanıt yok`);
  if (typeof question.evidence_de === 'string') {
    ok(transcript.includes(question.evidence_de), `${scenarioId}/${question.id}: kanıt transkriptte birebir bulunamadı`);
  }
  if (question.evidence_anchor) {
    ok(question.evidence_de.includes(question.evidence_anchor), `${scenarioId}/${question.id}: kanıt çıpası kanıt metninde yok`);
  }
}

const quality = readJson('dinleme-v17-kalite.json');
const source = readJson('dinleme-v15-kaynak.json');
const manifest = readJson('MP3_SHA256.json');

ok(Array.isArray(quality.scenarios), 'V17 senaryo dizisi yok');
ok(quality.scenarios.length === 90, `Senaryo sayısı ${quality.scenarios.length}; 90 olmalı`);
ok(new Set(quality.scenarios.map((s) => s.id)).size === 90, 'Senaryo kimlikleri benzersiz değil');

const expectedLevels = { A1: 12, A2: 12, B1: 15, B2: 15, C1: 18, C2: 18 };
const actualLevels = Object.fromEntries(Object.keys(expectedLevels).map((level) => [level, 0]));
let objectiveCount = 0;
let semanticCount = 0;
let newV17Count = 0;
let modelAnswerCount = 0;
const scenarioAudio = [];
const questionIds = [];

for (const scenario of quality.scenarios) {
  actualLevels[scenario.level] = (actualLevels[scenario.level] || 0) + 1;
  ok(typeof scenario.transcript === 'string' && scenario.transcript.length > 0, `${scenario.id}: transkript yok`);
  ok(Array.isArray(scenario.speakers) && scenario.speakers.length >= 2, `${scenario.id}: konuşmacı listesi eksik`);
  ok(Array.isArray(scenario.objective), `${scenario.id}: nesnel soru dizisi yok`);
  scenarioAudio.push(scenario.audio_path);
  for (const question of scenario.objective || []) {
    objectiveCount += 1;
    questionIds.push(question.id);
    validateQuestion(question, scenario.transcript, scenario.id);
    if (['context_or_inference', 'meaning_context_reasoning'].includes(question.skill)) semanticCount += 1;
    if (String(question.origin || '').startsWith('V17')) newV17Count += 1;
  }
  const reflection = scenario.reflection;
  ok(reflection && typeof reflection.model_answer_de === 'string' && reflection.model_answer_de.length > 0,
    `${scenario.id}: model yanıt yok`);
  if (reflection?.model_answer_de) modelAnswerCount += 1;
  ok(reflection?.scoring === 'guided_self_assessment_only', `${scenario.id}: açık uçlu puanlama öz değerlendirme olarak işaretlenmemiş`);
  ok(Array.isArray(reflection?.evidence_de) && reflection.evidence_de.length > 0, `${scenario.id}: açık uçlu kanıt yok`);
  for (const evidence of reflection?.evidence_de || []) {
    ok(scenario.transcript.includes(evidence), `${scenario.id}: açık uçlu kanıt transkriptte yok`);
  }
  ok((reflection?.rubric || []).reduce((sum, item) => sum + Number(item.points || 0), 0) === 5,
    `${scenario.id}: öz değerlendirme rubriği 5 puan etmiyor`);
  ok(typeof scenario.warning_tr === 'string' && /sentez|sentetik/i.test(scenario.warning_tr), `${scenario.id}: sentetik ses uyarısı yok`);
}

for (const [level, expected] of Object.entries(expectedLevels)) {
  ok(actualLevels[level] === expected, `${level}: ${actualLevels[level]} senaryo; ${expected} olmalı`);
}
ok(objectiveCount === 282, `Nesnel soru sayısı ${objectiveCount}; 282 olmalı`);
ok(semanticCount === 102, `Anlama/çıkarım sorusu sayısı ${semanticCount}; 102 olmalı`);
ok(newV17Count === 78, `Yeni V17 sorusu sayısı ${newV17Count}; 78 olmalı`);
ok(modelAnswerCount === 90, `Model yanıt sayısı ${modelAnswerCount}; 90 olmalı`);
ok(new Set(questionIds).size === questionIds.length, 'Nesnel soru kimlikleri benzersiz değil');

ok(source.base_lessons?.length === 360, `Temel ders sayısı ${source.base_lessons?.length}; 360 olmalı`);
ok(source.additional_scenarios?.length === 90, `Kaynak senaryo sayısı ${source.additional_scenarios?.length}; 90 olmalı`);
const allReferencedAudio = [
  ...(source.base_lessons || []).map((lesson) => lesson.audio_path),
  ...scenarioAudio,
];
ok(allReferencedAudio.length === 450, `Toplam ses referansı ${allReferencedAudio.length}; 450 olmalı`);
ok(new Set(allReferencedAudio).size === 450, 'Ses yolları benzersiz değil');

const mp3Files = [
  ...listFiles(path.join(root, 'audio'), '.mp3'),
  ...listFiles(path.join(root, 'audio_new'), '.mp3'),
  ...listFiles(path.join(root, 'audio_v14'), '.mp3'),
];
const diskAudio = new Set(mp3Files.map(normalizedRelative));
ok(mp3Files.length === 450, `Diskteki MP3 sayısı ${mp3Files.length}; 450 olmalı`);
for (const audioPath of allReferencedAudio) ok(diskAudio.has(audioPath), `Ses yolu bulunamadı: ${audioPath}`);
for (const audioPath of diskAudio) ok(allReferencedAudio.includes(audioPath), `Veride kullanılmayan MP3 var: ${audioPath}`);

ok(Array.isArray(manifest) && manifest.length === 450, `MP3 manifest kaydı ${manifest.length}; 450 olmalı`);
const manifestPaths = new Set(manifest.map((item) => item.file));
ok(manifestPaths.size === 450, 'MP3 manifest yolları benzersiz değil');
for (const item of manifest) {
  const full = path.join(root, ...item.file.split('/'));
  ok(fs.existsSync(full), `Manifest dosyası yok: ${item.file}`);
  if (!fs.existsSync(full)) continue;
  const bytes = fs.readFileSync(full);
  ok(bytes.length > 0, `Boş MP3: ${item.file}`);
  const looksLikeMp3 = bytes.subarray(0, 3).toString('ascii') === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  ok(looksLikeMp3, `MP3 başlığı tanınmadı: ${item.file}`);
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  ok(actual === item.sha256, `SHA-256 uyuşmuyor: ${item.file}`);
}
for (const audioPath of diskAudio) ok(manifestPaths.has(audioPath), `Manifestte olmayan MP3: ${audioPath}`);

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sourceMatch = indexHtml.match(/<script id="source" type="application\/json">([\s\S]*?)<\/script>/);
ok(Boolean(sourceMatch), 'index.html içinde gömülü V17 verisi yok');
if (sourceMatch) {
  const embedded = JSON.parse(sourceMatch[1]);
  ok(JSON.stringify(embedded) === JSON.stringify(quality), 'index.html gömülü verisi dış JSON ile aynı değil');
}
const inlineScripts = [...indexHtml.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
ok(inlineScripts.length > 0, 'index.html uygulama JavaScripti yok');
for (const [index, script] of inlineScripts.entries()) {
  try { new vm.Script(script, { filename: `index-inline-${index + 1}.js` }); }
  catch (error) { failures.push(`index.html JavaScript sözdizimi: ${error.message}`); }
}
const ids = [...indexHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
ok(new Set(ids).size === ids.length, 'index.html içinde yinelenen id var');
for (const requiredId of ['player', 'transcriptBtn', 'transcript', 'quiz', 'check', 'result', 'written', 'reveal', 'model', 'rubric', 'levels', 'lesson']) {
  ok(ids.includes(requiredId), `index.html zorunlu arayüz öğesi yok: ${requiredId}`);
}

const uiJs = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
try { new vm.Script(uiJs, { filename: 'ui.js' }); }
catch (error) { failures.push(`ui.js sözdizimi: ${error.message}`); }
ok(inlineScripts.some((script) => script.trim() === uiJs.trim()), 'ui.js ile index.html içindeki uygulama kodu aynı değil');

notes.push(`90 senaryo; seviye dağılımı ${JSON.stringify(actualLevels)}`);
notes.push(`${objectiveCount} nesnel soru; ${semanticCount} anlama/çıkarım; ${newV17Count} yeni V17 sorusu`);
notes.push(`${modelAnswerCount} Almanca model yanıt; açık uçlu görevler öz değerlendirme olarak işaretli`);
notes.push(`${mp3Files.length} MP3; tüm yollar, başlıklar ve SHA-256 değerleri doğrulandı`);
notes.push('Gömülü veri, bağımsız JSON, arayüz kimlikleri ve JavaScript sözdizimi doğrulandı');

if (failures.length) {
  console.error(`QA BAŞARISIZ (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('QA BAŞARILI');
  for (const note of notes) console.log(`- ${note}`);
}
