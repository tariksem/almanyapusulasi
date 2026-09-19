const fs = require('fs');
const crypto = require('crypto');

const locked = {
  'BRAND-IDENTITY.md': '5c176fcbafec266e7a1d31312dcddea6b77fadb8',
  'BRAND-PRODUCTION-GUARD.md': '678af97aa31b7f42b84d3cdba2948c70d35ade6a',
  'AGENTS.md': '7cd94ebe3ec124fc23d37a868adbbd5221537884',
  '.github/copilot-instructions.md': '35b8fbefb618975945b6cb0ca946c0cf0606cdb6',
  'assets/brand/almanya-pusulasi-logo.png': 'ad998019449bf77682eb5eca32a0ad8680c3d4f5',
  'assets/brand/almanya-pusulasi-logo-256.png': '9c4a4788a718ed61025049c8f258dc85c5e70659',
  'assets/brand/almanya-pusulasi-logo-64.png': 'a1a27141e242dd455de51544856e022512553080',
  'scripts/generate-social-preview.py': '77a35d85516660b7041623d8eb02cf62528027de',
  'scripts/render-social-card.py': 'cd5540b1906abfd37760e57a856e742395228127'
};

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

function fail(message) {
  console.error(`::error::${message}`);
  failed = true;
}

let failed = false;

for (const [path, expected] of Object.entries(locked)) {
  if (!fs.existsSync(path)) {
    fail(`Locked brand file missing: ${path}`);
    continue;
  }
  const actual = gitBlobSha(fs.readFileSync(path));
  if (actual !== expected) {
    fail(`Locked brand file changed: ${path} expected ${expected} got ${actual}`);
  } else {
    console.log(`PASS locked ${path} ${actual}`);
  }
}

const identity = fs.readFileSync('BRAND-IDENTITY.md', 'utf8');
for (const rule of [
  'Logo yeniden çizilmez.',
  'Logo image-generation aracına yeniden ürettirilmez.',
  'Logoya benzeyen alternatif pusula/ikon kullanılmaz.',
  'TAHMİN ETME → UYDURMA → YENİDEN ÇİZME → KULLANMA.'
]) {
  if (!identity.includes(rule)) fail(`Mandatory brand identity rule missing: ${rule}`);
}

const production = fs.readFileSync('BRAND-PRODUCTION-GUARD.md', 'utf8');
for (const rule of [
  'AI image generation MUST NOT create the final branded visual',
  'The final branded composition must add the real canonical logo as a separate source asset',
  'If the canonical logo cannot be loaded exactly, STOP.'
]) {
  if (!production.includes(rule)) fail(`Mandatory production guard missing: ${rule}`);
}

for (const path of ['scripts/generate-social-preview.py', 'scripts/render-social-card.py']) {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes("assets/brand/almanya-pusulasi-logo.png")) {
    fail(`${path} does not reference the canonical logo`);
  }
  if (!source.includes('Image.open(LOGO)')) {
    fail(`${path} does not composite the canonical logo asset`);
  }
}

const preview = fs.readFileSync('scripts/generate-social-preview.py', 'utf8');
for (const forbidden of ['Minimal compass mark', 'd.polygon(']) {
  if (preview.includes(forbidden)) fail(`Social preview contains forbidden manual logo drawing: ${forbidden}`);
}
if (!preview.includes('NAVY = (16, 42, 67)')) fail('Social preview primary color is not locked #102A43');
if (!preview.includes('GOLD = (216, 155, 43)')) fail('Social preview accent color is not locked #D89B2B');

const cloudflare = fs.readFileSync('.github/workflows/deploy-cloudflare.yml', 'utf8');
const pages = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
for (const [name, workflow] of [['Cloudflare', cloudflare], ['Pages', pages]]) {
  if (!workflow.includes('Validate locked brand identity')) fail(`${name} deploy does not run Brand Guard`);
  if (!workflow.includes('node scripts/validate-brand-lock.js')) fail(`${name} deploy is missing brand validator command`);
}
for (const required of [
  'python scripts/generate-social-preview.py',
  'python scripts/enhance-social-meta.py',
  'cp assets/brand/social-preview.png dist/assets/brand/social-preview.png'
]) {
  if (!cloudflare.includes(required)) fail(`Cloudflare production workflow missing branded social-preview protection: ${required}`);
}

if (failed) process.exit(1);
console.log('Brand Guard validated: canonical assets, AI-production policy, renderer and deploy gates are intact.');
