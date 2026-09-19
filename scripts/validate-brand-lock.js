const fs = require('fs');
const crypto = require('crypto');

const locked = {
  'BRAND-IDENTITY.md': '5c176fcbafec266e7a1d31312dcddea6b77fadb8',
  'assets/brand/almanya-pusulasi-logo.png': 'ad998019449bf77682eb5eca32a0ad8680c3d4f5',
  'assets/brand/almanya-pusulasi-logo-256.png': '9c4a4788a718ed61025049c8f258dc85c5e70659',
  'assets/brand/almanya-pusulasi-logo-64.png': 'a1a27141e242dd455de51544856e022512553080'
};

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

let failed = false;
for (const [path, expected] of Object.entries(locked)) {
  if (!fs.existsSync(path)) {
    console.error(`::error::Locked brand asset missing: ${path}`);
    failed = true;
    continue;
  }
  const actual = gitBlobSha(fs.readFileSync(path));
  if (actual !== expected) {
    console.error(`::error::Locked brand asset changed: ${path} expected ${expected} got ${actual}`);
    failed = true;
  } else {
    console.log(`PASS ${path} ${actual}`);
  }
}

const policy = fs.readFileSync('BRAND-IDENTITY.md', 'utf8');
const mandatoryRules = [
  'Logo yeniden çizilmez.',
  'Logo image-generation aracına yeniden ürettirilmez.',
  'Logoya benzeyen alternatif pusula/ikon kullanılmaz.',
  'TAHMİN ETME → UYDURMA → YENİDEN ÇİZME → KULLANMA.'
];

for (const rule of mandatoryRules) {
  if (!policy.includes(rule)) {
    console.error(`::error::Mandatory brand rule missing: ${rule}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Brand lock validated.');
