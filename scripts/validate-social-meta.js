const fs = require('fs');
const path = require('path');

const queue = JSON.parse(fs.readFileSync('social/meta-queue.json', 'utf8'));
const failures = [];
const fail = msg => failures.push(msg);

if (queue.timezone !== 'Europe/Berlin') fail('timezone must be Europe/Berlin');
if (queue.publish_time !== '18:30') fail('publish_time must be 18:30');
if (queue.graph_api_version !== 'v26.0') fail('Graph API version must be v26.0');
if (typeof queue.approved !== 'boolean') fail('queue.approved must be explicit boolean');
if (!Array.isArray(queue.posts) || queue.posts.length !== 10) fail('queue must contain exactly 10 posts');

const expectedDates = Array.from({length:10}, (_,i) => '2026-09-' + String(20+i).padStart(2,'0'));
const seenSlugs = new Set();
const seenImages = new Set();
const seenUtmContent = new Set();

(queue.posts || []).forEach((post, i) => {
  if (post.date !== expectedDates[i]) fail('post ' + (i+1) + ': expected date ' + expectedDates[i] + ', got ' + post.date);
  if (!post.slug || seenSlugs.has(post.slug)) fail('post ' + (i+1) + ': duplicate/missing slug'); else seenSlugs.add(post.slug);
  if (!post.image_path || seenImages.has(post.image_path)) fail('post ' + (i+1) + ': duplicate/missing image_path'); else seenImages.add(post.image_path);
  if (!post.image_path.startsWith('/assets/social/') || !post.image_path.endsWith('.jpg')) fail('post ' + (i+1) + ': invalid JPEG image_path');
  if (!post.destination || !post.destination.startsWith('https://almanyapusulasi.de/')) fail('post ' + (i+1) + ': destination must be canonical site URL');

  try {
    const u = new URL(post.destination);
    const local = u.pathname === '/' ? 'index.html' : path.join(u.pathname.replace(/^\//,''), 'index.html');
    if (!fs.existsSync(local)) fail('post ' + (i+1) + ': destination missing in repository: ' + local);
  } catch (e) {
    fail('post ' + (i+1) + ': invalid destination URL');
  }

  if (!post.facebook_caption || !post.facebook_caption.includes('utm_source=facebook&utm_medium=social&utm_campaign=acquisition_p0')) fail('post ' + (i+1) + ': Facebook UTM missing');
  const m = (post.facebook_caption || '').match(/utm_content=([A-Za-z0-9_-]+)/);
  if (!m) fail('post ' + (i+1) + ': utm_content missing');
  else if (seenUtmContent.has(m[1])) fail('post ' + (i+1) + ': duplicate utm_content ' + m[1]);
  else seenUtmContent.add(m[1]);

  if (/https?:\/\//.test(post.instagram_caption || '')) fail('post ' + (i+1) + ': raw URL not allowed in Instagram caption');
  if (!Array.isArray(post.bullets) || post.bullets.length < 2 || post.bullets.length > 4) fail('post ' + (i+1) + ': bullets must contain 2-4 items');
  if (!post.headline || post.headline.length > 58) fail('post ' + (i+1) + ': headline missing/too long');
  if (!post.cta || post.cta.length > 28) fail('post ' + (i+1) + ': CTA missing/too long');
});
if (JSON.stringify(queue).includes('utm_content=kiz_10d')) fail('deprecated Kinderzuschlag UTM remains');

for (const file of ['scripts/render-social-queue.py','scripts/publish-social-meta.py','.github/workflows/social-publish.yml']) {
  if (!fs.existsSync(file)) fail('missing automation file: ' + file);
}

const publisher = fs.existsSync('scripts/publish-social-meta.py') ? fs.readFileSync('scripts/publish-social-meta.py','utf8') : '';
for (const required of ['META_USER_ACCESS_TOKEN','META_PAGE_ACCESS_TOKEN','me/accounts','instagram_business_account','debug_token','REQUIRED_USER_SCOPES','verify_instagram_profile','verify_facebook_post','verify_instagram_media','media_publish','SKIP_DUPLICATE','v26.0']) {
  if (!publisher.includes(required)) fail('publisher missing guard/feature: ' + required);
}
const workflow = fs.existsSync('.github/workflows/social-publish.yml') ? fs.readFileSync('.github/workflows/social-publish.yml','utf8') : '';
for (const required of ["cron: '30 16,17,18,19,20,21 20-29 9 *'", 'META_USER_ACCESS_TOKEN', 'META_PAGE_ACCESS_TOKEN', 'validate-social-meta.js', 'publish-social-meta.py']) {
  if (!workflow.includes(required)) fail('social workflow missing: ' + required);
}
if (workflow.includes('Metricool') || workflow.includes('Windsor')) fail('retired scheduler referenced in social workflow');

const cloudflare = fs.readFileSync('.github/workflows/deploy-cloudflare.yml','utf8');
for (const required of ['Generate scheduled social cards','Verify social card production URLs','assets/social']) {
  if (!cloudflare.includes(required)) fail('Cloudflare social asset pipeline missing: ' + required);
}

if (failures.length) {
  failures.forEach(x => console.error('::error::' + x));
  process.exit(1);
}
console.log('PASS Meta social automation: 10 posts, valid destinations, unique UTMs, deterministic assets, credential guards, post verification and bounded campaign schedule.');
