#!/usr/bin/env node
'use strict';

const fs = require('fs');

const configPath = 'assets/js/affiliate-slots.js';
const trackingPath = 'assets/js/commercial-tracking.js';
const evidencePath = 'data/affiliate-attribution-status.json';

const source = fs.readFileSync(configPath, 'utf8');
const tracking = fs.readFileSync(trackingPath, 'utf8');
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

const slotRegex = /"([^"]+)":\{enabled:(true|false),provider:"([^"]*)",partnerId:"([^"]*)",url:"([^"]*)"/g;
const slots = new Map();
let match;
while ((match = slotRegex.exec(source)) !== null) {
  slots.set(match[1], {
    key: match[1],
    enabled: match[2] === 'true',
    provider: match[3],
    partnerId: match[4],
    url: match[5]
  });
}

if (slots.size < 10) fail(`Could not parse affiliate configuration safely; only ${slots.size} slots found.`);

const tarif = evidence.providers.TARIFCHECK;
const check24 = evidence.providers.CHECK24;
const verifiedTarifDeepLinks = new Set(tarif.verifiedDeepLinks || []);

for (const cfg of slots.values()) {
  if (!cfg.enabled) {
    if (cfg.provider || cfg.partnerId || cfg.url) {
      fail(`${cfg.key}: disabled slot must not retain provider, partnerId or URL.`);
    }
    continue;
  }

  if (!cfg.url.startsWith('https://')) fail(`${cfg.key}: enabled affiliate URL must use HTTPS.`);
  let url;
  try { url = new URL(cfg.url); }
  catch (e) { fail(`${cfg.key}: invalid URL.`); continue; }

  if (cfg.provider === 'TARIFCHECK') {
    if (cfg.partnerId !== tarif.partnerId) fail(`${cfg.key}: unexpected TARIFCHECK Partner-ID ${cfg.partnerId}.`);
    if (url.hostname !== tarif.host || url.pathname !== tarif.path) fail(`${cfg.key}: unexpected TARIFCHECK tracking host/path.`);
    if (url.searchParams.get('partner_id') !== tarif.partnerId) fail(`${cfg.key}: partner_id query parameter mismatch.`);
    if (url.searchParams.get('ad_id') !== tarif.requiredAdId) fail(`${cfg.key}: ad_id must be ${tarif.requiredAdId}.`);
    const deep = url.searchParams.get('deep');
    if (!deep || !verifiedTarifDeepLinks.has(deep)) fail(`${cfg.key}: deeplink '${deep || ''}' is not in the authenticated TARIFCHECK catalog.`);
    if (url.searchParams.get('tracking') === 'test123') fail(`${cfg.key}: dashboard sample tracking ID test123 must never be used in production.`);
  } else if (cfg.provider === 'CHECK24') {
    if (cfg.partnerId !== check24.partnerId) fail(`${cfg.key}: unexpected CHECK24 Partner-ID ${cfg.partnerId}.`);
    if (url.hostname !== check24.host || url.pathname !== check24.path) fail(`${cfg.key}: unexpected CHECK24 tracking host/path.`);
    const expected = check24.electricity;
    if (cfg.key !== expected.slot) fail(`${cfg.key}: CHECK24 slot is not recorded in attribution evidence.`);
    for (const [name, value] of Object.entries(expected.requiredParams || {})) {
      if (url.searchParams.get(name) !== value) fail(`${cfg.key}: CHECK24 parameter ${name} mismatch.`);
    }
    if (cfg.url !== expected.configuredUrl) fail(`${cfg.key}: configured URL changed without updating the attribution evidence record.`);
    if (expected.externalExactMatchStatus !== 'verified') {
      warn(`${cfg.key}: CHECK24 account/URL shape is guarded, but authenticated generator exact-match remains ${expected.externalExactMatchStatus}.`);
    }
  } else {
    fail(`${cfg.key}: enabled slot uses unapproved provider '${cfg.provider}'.`);
  }
}

for (const [key, record] of Object.entries(evidence.revenueCriticalSlots || {})) {
  const cfg = slots.get(key);
  if (!cfg) fail(`${key}: revenue-critical slot missing from affiliate configuration.`);
  else {
    if (!cfg.enabled) fail(`${key}: revenue-critical slot is unexpectedly disabled.`);
    if (cfg.provider !== record.provider) fail(`${key}: provider differs from attribution evidence.`);
  }
}

if (!source.includes('rel="sponsored noopener"')) fail('Affiliate renderer no longer enforces rel="sponsored noopener".');
if (!source.includes('data-track="affiliate_click"')) fail('Affiliate renderer no longer emits affiliate_click tracking marker.');
if (!source.includes('Ticari bağlantı:')) fail('Affiliate renderer disclosure text is missing.');
if (!tracking.includes('el.getAttribute("data-track")')) fail('Commercial tracking no longer reads the per-link event name.');
if (!tracking.includes('affiliate_slot_view')) fail('Commercial tracking no longer records affiliate slot views.');
if (!tracking.includes('commercial_area')) fail('Commercial tracking no longer records slot/product area.');
if (!tracking.includes('partner:')) fail('Commercial tracking no longer records partner/provider.');

console.log(`Affiliate slots parsed: ${slots.size}`);
console.log(`Enabled slots: ${[...slots.values()].filter(x => x.enabled).length}`);
for (const message of warnings) console.log(`WARNING: ${message}`);
for (const message of errors) console.error(`ERROR: ${message}`);

if (errors.length) process.exit(1);
console.log('Affiliate attribution configuration guard: PASS');
