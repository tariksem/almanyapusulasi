import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoRoot = path.join(repositoryRoot, 'almanca-akademisi-demo');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  'index.html',
  'demo-enhancements.js',
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
check(html.includes('src="demo-enhancements.js"'), 'Demo geliştirme betiği yüklenmiyor');
check(enhancements.includes('/assets/brand/almanya-pusulasi-logo.png'), 'Kanonik logo yolu kullanılmıyor');
check(enhancements.includes('Yanıtı ön değerlendir'), 'Açık uçlu ön değerlendirme eksik');
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
console.log('- Kanonik logo, noindex/canonical, 360 temel ders varsayılanı, tarayıcı sesi ve açık uçlu ön değerlendirme doğrulandı');
