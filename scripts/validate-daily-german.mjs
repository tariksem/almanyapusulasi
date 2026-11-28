import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { lessons, reviewAnswer } from '../gunluk-almanca/lessons.mjs';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');
const source = JSON.parse(read('almanca-akademisi-demo/dinleme-v17-kalite.json'));
const academyLessons = new Map(source.scenarios.map((lesson) => [lesson.id, lesson]));
const page = read('gunluk-almanca/index.html');
const listeningFile = new URL('gunluk-almanca/listening.json', root);
const expected = {};
const revisedApartmentAudio = {
  url: '/gunluk-almanca/apartman.mp3',
  seconds: 68.63,
  sha256: '47b5664ad16d056a56c453699b73a271363ee51d8a72b13d7735660a2a3cbd9e',
};

assert.equal(lessons.length, 12, '12 lessons');
assert.equal(new Set(lessons.map(({ id }) => id)).size, 12, 'Unique lesson links');
assert.equal(new Set(lessons.map(({ sourceId }) => sourceId)).size, 12, 'Unique recordings');
for (const level of ['A1', 'A2', 'B1']) {
  assert.equal(lessons.filter(({ sourceId }) => sourceId.startsWith(level + '-')).length, 4, level);
}

for (const lesson of lessons) {
  const recording = academyLessons.get(lesson.sourceId);
  assert.ok(recording, lesson.sourceId);
  assert.ok(recording.transcript.includes(lesson.evidence), lesson.id + ' evidence must quote the source');
  assert.ok(recording.audio_duration_seconds > 0, lesson.id + ' has a duration');
  const revised = lesson.id === 'apartman' ? revisedApartmentAudio : null;
  const audio = revised?.url || '/almanca-akademisi-demo/' + recording.audio_path;
  const audioFile = new URL(audio.slice(1), root);
  assert.ok(fs.statSync(audioFile).size > 2000, lesson.id + ' has an MP3');
  if (revised) {
    assert.equal(createHash('sha256').update(fs.readFileSync(audioFile)).digest('hex'), revised.sha256);
  }
  assert.ok(page.includes('href="#' + lesson.id + '">' + lesson.title + '</a>'), lesson.id + ' is listed');
  expected[lesson.id] = { audio, seconds: revised?.seconds || recording.audio_duration_seconds, transcript: recording.transcript };
  assert.equal(reviewAnswer(lesson, lesson.example).status, 'ready', lesson.id + ' sample answer');
  assert.equal(reviewAnswer(lesson, '  ?  ').status, 'empty', lesson.id + ' blank reply');
}

if (process.argv.includes('--write')) {
  fs.writeFileSync(listeningFile, JSON.stringify(expected, null, 2) + '\n');
}
assert.deepEqual(JSON.parse(fs.readFileSync(listeningFile, 'utf8')), expected, 'Listening data matches the academy source');

const cases = {
  telefon: [
    ['587', 'ready'],
    ['Fünf, acht, sieben.', 'ready'],
    ['Die Endung ist 587, nicht 589.', 'ready'],
    ['Nicht 589, sondern 587.', 'ready'],
    ['5 8 9', 'compare'],
  ],
  randevu: [
    ['Mittwoch, 10:00.', 'ready'],
    ['Am Mittwoch.', 'partial'],
    ['Am Mittwoch komme ich 10 Minuten früher.', 'partial'],
    ['Mittwoch um neun Uhr.', 'compare'],
  ],
  pazar: [
    ['Nur Bargeld.', 'ready'],
    ['Kartenzahlung geht nicht. Bitte bar.', 'ready'],
    ['Wir nehmen bar und Karte.', 'compare'],
    ['Kein Bargeld.', 'compare'],
  ],
  'yol-tarifi': [
    ['Geradeaus bis zur Ampel und dann links.', 'ready'],
    ['Bis zur Ampel gerade aus.', 'partial'],
    ['Bis zur Ampel geradeaus, dann nach rechts.', 'compare'],
  ],
  doktor: [
    ['Seit 3 Tagen Halsweh.', 'ready'],
    ['Ich habe kein Fieber, aber seit drei Tagen Halsschmerzen.', 'ready'],
    ['Ich habe Halsschmerzen.', 'partial'],
    ['Ich habe seit zwei Tagen Halsweh.', 'compare'],
  ],
  'ev-arama': [
    ['Die Heizkosten sind im monatlichen Abschlag enthalten.', 'ready'],
    ['Es geht um die Miete.', 'unclear'],
    ['Die Heizkosten sind in der Kaltmiete enthalten.', 'compare'],
    ['Die Heizkosten sind nicht in der monatlichen Vorauszahlung enthalten.', 'compare'],
  ],
  'urun-degisimi': [
    ['Der Reissverschluss klemmt. Ich möchte eine neue Jacke.', 'ready'],
    ['Der Reißverschluss ist kaputt.', 'partial'],
    ['Der Reißverschluss ist in Ordnung. Ich möchte die Jacke umtauschen.', 'compare'],
  ],
  'belediye-randevusu': [
    ['In der Termin-Mail.', 'ready'],
    ['Ich lese die Bestätigung zu meinem Termin.', 'ready'],
    ['Ich schaue auf der Quittung nach.', 'unclear'],
  ],
  apartman: [
    ['Bitte abends die Tür leise zumachen.', 'ready'],
    ['Bitte abends die Haustür nicht laut schließen.', 'ready'],
    ['Bitte schließen Sie die Haustür leise.', 'partial'],
    ['Bitte schließen Sie die Tür abends laut.', 'compare'],
  ],
  banka: [
    ['Wie hoch sind die jährlichen Gebühren für Kontoführung und Karte?', 'ready'],
    ['Was kosten das Konto und die Karte?', 'partial'],
    ['Ich möchte nur die Gebühr pro Monat wissen. Was kosten Konto und Karte?', 'compare'],
  ],
  'belge-teslimi': [
    ['Bis wann kann ich die Dokumente einreichen?', 'ready'],
    ['Welche Frist gilt für die Nachweise?', 'ready'],
    ['Der Termin ist morgen.', 'unclear'],
  ],
  'tren-aktarmasi': [
    ['Über Bonn, von Gleis 2.', 'ready'],
    ['Die Alternative fährt nicht von Gleis 4, sondern von Gleis 2 über Bonn.', 'ready'],
    ['Über Bonn.', 'partial'],
    ['Die Alternative über Bonn fährt von Gleis vier.', 'compare'],
  ],
};

assert.equal(Object.keys(cases).length, lessons.length);
for (const lesson of lessons) {
  assert.ok(cases[lesson.id].some(([, status]) => status === 'ready'), lesson.id + ' alternative phrasing');
  assert.ok(cases[lesson.id].some(([, status]) => status !== 'ready'), lesson.id + ' wrong or incomplete answer');
  for (const [answer, expectedStatus] of cases[lesson.id]) {
    const result = reviewAnswer(lesson, answer);
    assert.equal(result.status, expectedStatus, lesson.id + ' | ' + answer);
    if (result.status !== 'ready') assert.ok(result.tips.length > 0, lesson.id + ' actionable feedback');
  }
}

const url = 'https://almanyapusulasi.de/gunluk-almanca/';
assert.ok(page.includes('rel="canonical" href="' + url + '"'), 'Canonical URL');
assert.ok(!page.includes('noindex'), 'The first release is indexable');
assert.ok(read('index.html').includes('href="/gunluk-almanca/"'), 'Homepage entry');
assert.ok(read('sitemap-tools.xml').includes('<loc>' + url + '</loc>'), 'Public sitemap entry');
console.log('Günlük Almanca QA başarılı. 12 ders, 12 ses kaydı ve ' + Object.values(cases).flat().length + ' farklı yanıt doğrulandı.');
