// Regression guard: the Turkish shell must never overwrite localized inner pages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/analytics-consent.js', 'utf8');
const guard = 'if(/^\\/(en|de)(\\/|$)/.test(location.pathname))return;';
assert.equal(source.split(guard).length - 1, 5, 'All five Turkish shell renderers must skip EN/DE routes');
const localized = /^\/(en|de)(\/|$)/;
for (const path of ['/en/', '/de/', '/en/kindergeld/', '/de/haberler/example/', '/en/privacy/']) {
  assert.ok(localized.test(path), 'Must preserve localized shell: ' + path);
}
for (const path of ['/', '/kindergeld/', '/enough/', '/deutsch/']) {
  assert.ok(!localized.test(path), 'Must retain Turkish shell: ' + path);
}
console.log('Localized shell guard regression passed');
