import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { feedbackCases, feedbackEdgeCases } from './academy-feedback-cases.mjs';
import './validate-daily-german.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoRoot = path.join(repositoryRoot, 'almanca-akademisi-demo');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  'index.html',
  'demo-enhancements.js',
  'open-answer-feedback.js',
  'V15_TUM_DERSLER_ONIZLEME.html',
  'dinleme-v15-kaynak.json',
  'dinleme-v17-kalite.json',
  'MP3_SHA256.json',
  'ui.js',
  'qa-v17.mjs',
];
for (const file of requiredFiles) check(fs.existsSync(path.join(demoRoot, file)), `Eksik demo dosyası: ${file}`);

const html = fs.readFileSync(path.join(demoRoot, 'index.html'), 'utf8');
const basePreview = fs.readFileSync(path.join(demoRoot, 'V15_TUM_DERSLER_ONIZLEME.html'), 'utf8');
const enhancements = fs.readFileSync(path.join(demoRoot, 'demo-enhancements.js'), 'utf8');
check(html.includes('<meta name="robots" content="noindex,follow">'), 'Demo noindex etiketi yok');
check(html.includes('https://almanyapusulasi.de/almanca-akademisi-demo/'), 'Demo canonical adresi yok');
check(
  /<script src="open-answer-feedback\.js(?:\?[^"]+)?"><\/script><script src="demo-enhancements\.js(?:\?[^"]+)?"><\/script>/.test(html),
  'Açık uçlu geri bildirim betikleri doğru sırayla yüklenmiyor'
);
check(enhancements.includes('/assets/brand/almanya-pusulasi-logo.png'), 'Kanonik logo yolu kullanılmıyor');
check(enhancements.includes('Yanıtı gözden geçir'), 'Açık uçlu geri bildirim eksik');
check(enhancements.includes('Tarayıcı sesiyle oku'), 'Tarayıcı sesi seçeneği eksik');
check(enhancements.includes('resmî') && enhancements.includes('CEFR'), 'Puanlama sınırı açıklanmıyor');
check(basePreview.includes('<option value="base" selected>360 temel dinleme</option>'), '360 temel ders sayfası temel dinlemeyi varsayılan açmıyor');
check(basePreview.includes('/assets/brand/almanya-pusulasi-logo.png'), '360 temel ders sayfasında kanonik logo yok');
check(basePreview.includes('let level=\'A1\',kind=\'base\''), '360 temel ders uygulama durumu base değil');

try {
  new vm.Script(enhancements, { filename: 'demo-enhancements.js' });
} catch (error) {
  failures.push(`Demo JavaScript sözdizimi: ${error.message}`);
}

const mp3Files = ['audio', 'audio_new', 'audio_v14'].flatMap((directory) =>
  fs.readdirSync(path.join(demoRoot, directory), { recursive: true })
    .filter((file) => file.toLowerCase().endsWith('.mp3'))
);
check(mp3Files.length === 450, `Demo MP3 sayısı ${mp3Files.length}; 450 olmalı`);

const feedbackScript = fs.readFileSync(path.join(demoRoot, 'open-answer-feedback.js'), 'utf8');
const { reviewAnswer, lessonIds } = vm.runInNewContext(`${feedbackScript}\nacademyAnswerFeedback;`);
const { scenarios } = JSON.parse(fs.readFileSync(path.join(demoRoot, 'dinleme-v17-kalite.json'), 'utf8'));

check(lessonIds.length === feedbackCases.length, 'Her ayrıntılı geri bildirim senaryosu için test gerekli');
check(new Set(feedbackCases.map(({ id }) => id)).size === feedbackCases.length, 'Test senaryoları benzersiz olmalı');
for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
  check(lessonIds.filter((id) => id.startsWith(level + '-')).length === 3, level + ': üç senaryo bekleniyor');
}
for (const { id, paraphrase, partial, misleading, conflictPoint } of feedbackCases) {
  const lesson = scenarios.find((scenario) => scenario.id === id);
  check(Boolean(lesson), `${id}: test senaryosu bulunamadı`);
  const fullReview = reviewAnswer(id, paraphrase);
  check(fullReview.kind === 'tailored' && fullReview.points.every(({ status }) => status === 'possible'),
    `${id}: doğru farklı ifade için beklenen ipuçları bulunamadı`);
  const partialStatuses = reviewAnswer(id, partial).points.map(({ status }) => status);
  check(partialStatuses.includes('possible') && partialStatuses.includes('review') && !partialStatuses.includes('compare'),
    `${id}: eksik yanıta uygun kontrol noktası verilmiyor`);
  const misleadingPoints = reviewAnswer(id, misleading).points;
  const detectedConflict = conflictPoint === undefined
    ? misleadingPoints.some(({ status }) => status === 'compare')
    : misleadingPoints[conflictPoint]?.status === 'compare';
  check(detectedConflict, `${id}: yanıltıcı cevap için beklenen olası çelişki işaretlenmedi`);
  if (lesson) {
    check(reviewAnswer(id, lesson.reflection.model_answer_de).points.every(({ status }) => status !== 'compare'),
      `${id}: model yanıt çelişki olarak işaretlendi`);
  }
}

check(reviewAnswer(lessonIds[0], ' 123 ... ').kind === 'empty', 'Boş yanıt için yazma yönlendirmesi yok');
const quote = 'Sie sagt: „Die Erinnerungen erleichtern die Vorbereitung.“';
check(reviewAnswer('C2-U02-COMM', quote).points.every(({ status }) => status === 'review'),
  'Alıntı, öğrencinin görüşü olarak yorumlandı');
const list = 'Ironie. Spott. Vorbereitung. Benachrichtigungen.';
check(reviewAnswer('C2-U02-COMM', list).points.every(({ status }) => status === 'review'),
  'Anahtar kelime yığını içerik ipucu olarak kabul edildi');
const negated = 'Die Studie beweist nicht, dass sich der Zugang verbessert hat.';
check(reviewAnswer('C1-U01-COMM', negated).points.every(({ status }) => status !== 'compare'),
  'Erişim iddiasını reddeden yanıt çelişki olarak işaretlendi');
for (const { id, answer, expected } of feedbackEdgeCases) {
  const actual = reviewAnswer(id, answer).points.map(({ status }) => status);
  check(actual.join(',') === expected.join(','), `${id}: sınır durumu için beklenen ${expected.join(', ')}, bulunan ${actual.join(', ')}`);
}
const guidedScenarios = scenarios.filter(({ id }) => !lessonIds.includes(id));
for (const { id } of guidedScenarios) {
  const feedback = reviewAnswer(id, 'Hier ist mein Antwortversuch.');
  check(feedback.kind === 'guided' && feedback.points.length === 3 && feedback.points.every(({ status }) => status === 'review'),
    `${id}: öz değerlendirme yönlendirmesi eksik`);
}
check(!enhancements.includes('-auto-preview'), 'Yeni bir otomatik açık uçlu puan kaydediliyor');

const packageQa = spawnSync(process.execPath, [path.join(demoRoot, 'qa-v17.mjs')], {
  cwd: demoRoot,
  encoding: 'utf8',
});
if (packageQa.status !== 0) {
  failures.push(`V17 paket QA başarısız:\n${packageQa.stdout}\n${packageQa.stderr}`);
}

if (failures.length) {
  console.error(`Akademi demo QA BAŞARISIZ (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Akademi demo QA BAŞARILI');
console.log('- 90 senaryo, 450 MP3, 282 nesnel soru ve 90 model yanıt doğrulandı');
console.log('- Kanonik logo, noindex/canonical, 360 temel ders varsayılanı ve tarayıcı sesi doğrulandı');
console.log(`- A1–C2 için ${feedbackCases.length * 3} test yanıtı, ${feedbackCases.length} model yanıt, ${feedbackEdgeCases.length + 4} sınır durumu ve ${guidedScenarios.length} öz değerlendirme akışı doğrulandı`);
