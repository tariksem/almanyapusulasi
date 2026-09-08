# Affiliate link activation runbook

Repository audit: 2026-09-08, base commit `bc1e2a3712802ae1bcf4bad1b9bf4f48f62f2569`.

## Current state and evidence

PR #2 kept the slots disabled, but later commits enabled them. Do not repeat the original activation procedure without checking the current configuration.

| Product | Slot key | Current repository state | Evidence | Remaining work |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches `TARIFCHECK-DIRECTLINKS.md`, which records authenticated dashboard verification on 2026-09-07 | Recheck product destination and account attribution; record release checks below |
| Kfz | `kfz-insurance` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches the same authenticated-dashboard catalog | Recheck product destination and account attribution; record release checks below |
| Strom | `electricity-comparison` | enabled; URL populated; CHECK24 / `1177200` | Activated in `099849f`; no equivalent authenticated visitor-URL verification record found in the repository documentation inspected | Compare the existing URL with the exact output from the authenticated CHECK24 Strom generator; record source/date/account evidence, then release checks |

The TARIFCHECK catalog was added in `efd71a3`. Its verification statement is repository evidence, not a fresh dashboard check performed by this audit. The Strom commit proves a URL was configured, not that account attribution was verified. Missing documentation does not establish that a URL was invented or that attribution is broken.

The central config currently has 18 enabled slots and three disabled slots: `tax-software`, `internet-comparison`, and `money-transfer`. Those three have empty provider, partner ID and URL fields; activation requires the corresponding approved product/account and exact attributable URL. They are outside this three-product follow-up.

## Safest next change

This change updates documentation only and does not change URLs or activation flags. Merging to main triggers the existing automatic deployment workflows; it does not introduce a new affiliate activation. Preserve the existing provider mapping. First reconcile CHECK24 Strom with authenticated dashboard output; do not overwrite an existing URL simply because an older checklist says it is missing.

For each verified product, record the date, account/Partner-ID, generator section, exact-match result against the configured visitor URL, intended product destination and attribution result. Use a restricted evidence reference if a screenshot contains account details; never commit credentials, cookies, dashboard session URLs or private account data.

If the generated URL matches, no URL or enable-flag edit is needed. If it differs, prepare a separate narrowly scoped change to the matching slot using the exact generated HTTPS visitor URL. If attribution or destination fails, prepare a separate change setting only the affected slot to `enabled: false` until resolved. A missing evidence record alone is not proof of failure.

Do not merge or deploy an activation/replacement until its verification is recorded. Never derive a replacement from partner IDs, sibling product links or guessed query parameters.

## Verified accounts

- TARIFCHECK Partner-ID: `204420`
- CHECK24 Partner-ID: `1177200`

## Verified deeplink generators

CHECK24 Affiliate Support confirmed these exact partner-dashboard sections on 2026-09-07:

- Girokonto (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/finanzen/girokonto/deeplinks/`
- Kfz-Versicherung (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/kfz-versicherung/autoversicherung/deeplinks/`
- Strom (CHECK24): `https://www.check24-partnerprogramm.de/werbemittel/strom/deeplink/`

These are dashboard/generator URLs, not visitor destinations. Do not publish them as affiliate CTAs.

## Configuration map for a future verified replacement

The three slots are already enabled. Only edit `assets/js/affiliate-slots.js` if dashboard reconciliation requires a change:

| Product | Slot key | Provider | Partner-ID | Required change |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | TARIFCHECK | `204420` | retain current values if exact match; otherwise replace `url` with verified generated output |
| Kfz | `kfz-insurance` | TARIFCHECK | `204420` | retain current values if exact match; otherwise replace `url` with verified generated output |
| Strom | `electricity-comparison` | CHECK24 | `1177200` | retain current values if exact match; otherwise replace `url` with verified generated output |

Never construct or infer an affiliate URL from a Partner-ID.

## First placements already present

- Girokonto: `/girokonto-karsilastirma-2026/`
- Kfz: `/kfz-versicherung-karsilastirma-2026/`
- Strom: `/stromtarif-karsilastirma-2026/`

All three pages already contain their corresponding `data-affiliate-slot` element and load `assets/js/affiliate-slots.js`.

## Release verification (pending execution)

This audit inspected source only; it did not test production, partner attribution, redirects, mobile rendering or GA4 delivery. Source includes `rel="sponsored noopener"` and consent-gated click tracking in `assets/js/commercial-tracking.js`.

Disclosure needs explicit visual review: `affiliate-slots.js` removes `.commercial-disclosure` elements and renders “Partner karşılaştırması”; its current product notes do not explicitly say “Ticari bağlantı”. Confirm that a clear commercial disclosure remains visible beside each CTA; if absent, prepare a focused renderer wording fix.

Before merging a live-link change:

1. Open the generated URL directly and confirm the intended product destination.
2. Confirm the partner dashboard recognizes the link as belonging to the correct account/Partner-ID.
3. Change only the matching slot if needed; enable only after verification. Leave unrelated slots unchanged.
4. Keep `rel="sponsored noopener"` and the visible commercial disclosure.
5. Test desktop and mobile.
6. With Analytics consent accepted, verify exactly one `affiliate_click` per click and correct product/provider fields. With consent rejected or unset, verify no Analytics event is sent. A GA4 event does not prove partner attribution.
7. After a separately authorized release, deploy and smoke-test the live page. This documentation correction does not authorize a later affiliate URL replacement or activation.

Priority: Kfz and Girokonto first, then Strom.
