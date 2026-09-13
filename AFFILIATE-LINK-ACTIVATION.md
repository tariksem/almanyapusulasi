# Affiliate link activation runbook

Repository audit: 2026-09-13. This file records activation provenance and approved placement use; it does not authorize inventing or deriving new partner URLs.

## Current state and evidence

PR #2 kept the original slots disabled, but later commits enabled them. Do not repeat the original activation procedure without checking the current configuration.

| Product | Slot key | Current repository state | Evidence | Remaining work |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches `TARIFCHECK-DIRECTLINKS.md`, which records authenticated dashboard verification on 2026-09-07 | Recheck product destination and account attribution during periodic release QA |
| Kfz | `kfz-insurance` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches the same authenticated-dashboard catalog | Recheck product destination and account attribution during periodic release QA |
| Strom | `electricity-comparison` | enabled; URL populated; CHECK24 / `1177200` | Activated in `099849f`; no equivalent authenticated visitor-URL verification record was found in the repository documentation inspected | Compare the existing URL with the exact output from the authenticated CHECK24 Strom generator; record source/date/account evidence |

The TARIFCHECK catalog was added in `efd71a3`. Its verification statement is repository evidence, not a fresh dashboard check performed by this audit. The Strom commit proves a URL was configured, not that account attribution was verified. Missing documentation does not establish that a URL was invented or that attribution is broken.

The central config currently has enabled commercial slots plus three intentionally disabled slots: `tax-software`, `internet-comparison`, and `money-transfer`. Disabled slots have empty provider, partner ID and URL fields; activation requires the corresponding approved product/account and exact attributable URL.

## Familienleistungen P0 placement expansion — 2026-09-13

Commit `676a256` expanded the existing verified slot system into the family-benefits decision funnel without changing partner URLs or activation flags:

| Page | Slot | Why it is contextually relevant |
| --- | --- | --- |
| `/aile-cocuk/` | `electricity-comparison` | after benefit discovery and household-budget tools; positioned as fixed-cost reduction, not as a benefit entitlement |
| `/kindergeld-hesaplayici-2026/` | `bank-comparison` | after the Kindergeld result; Kindergeld is bank-transferred and the copy explicitly says a bank change does not alter entitlement or amount |
| `/kinderzuschlag-uygunluk-kontrolu-2026/` | `electricity-comparison` | after the KiZ decision result; copy explicitly separates KiZ eligibility from household electricity savings |

These placements must keep the editorial sequence **decision first, commercial comparison second**. Do not place the partner CTA ahead of the eligibility/result content and do not imply that buying, switching or comparing a commercial product increases a statutory family benefit.

Commit `4206954` also moved the disclosure guarantee into `assets/js/affiliate-slots.js`. Every active slot now renders an explicit visible statement beginning **“Ticari bağlantı:”** and explains that Almanya Pusulası may receive a commission and that commission does not change the comparison result or editorial content. Page-level legacy `.commercial-disclosure` blocks may still be removed by the renderer to avoid duplication; the renderer disclosure is therefore the required source of truth.

## Safest next change

Preserve the existing provider mapping. First reconcile CHECK24 Strom with authenticated dashboard output; do not overwrite an existing URL simply because an older checklist says evidence is incomplete.

For each verified product, record the date, account/Partner-ID, generator section, exact-match result against the configured visitor URL, intended product destination and attribution result. Use a restricted evidence reference if a screenshot contains account details; never commit credentials, cookies, dashboard session URLs or private account data.

If the generated URL matches, no URL or enable-flag edit is needed. If it differs, prepare a separate narrowly scoped change to the matching slot using the exact generated HTTPS visitor URL. If attribution or destination fails, set only the affected slot to `enabled: false` until resolved. A missing evidence record alone is not proof of failure.

Never construct or infer an affiliate URL from a Partner-ID.

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

Only edit `assets/js/affiliate-slots.js` if dashboard reconciliation requires a URL change:

| Product | Slot key | Provider | Partner-ID | Required change |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | TARIFCHECK | `204420` | retain current values if exact match; otherwise replace `url` with verified generated output |
| Kfz | `kfz-insurance` | TARIFCHECK | `204420` | retain current values if exact match; otherwise replace `url` with verified generated output |
| Strom | `electricity-comparison` | CHECK24 | `1177200` | retain current values if exact match; otherwise replace `url` with verified generated output |

## Core placements

Initial product pages:
- Girokonto: `/girokonto-karsilastirma-2026/`
- Kfz: `/kfz-versicherung-karsilastirma-2026/`
- Strom: `/stromtarif-karsilastirma-2026/`

Family-benefits P0 additions are listed above. Every live slot must load `assets/js/affiliate-slots.js` and keep `rel="sponsored noopener"` through the central renderer.

## Release verification

Before merging a live-link change or material placement expansion:

1. Open the configured visitor URL and confirm the intended product destination.
2. Confirm the partner dashboard recognizes the link as belonging to the correct account/Partner-ID.
3. Change only the matching slot if needed; enable only after verification. Leave unrelated slots unchanged.
4. Keep `rel="sponsored noopener"` and the renderer-level visible `Ticari bağlantı` disclosure.
5. Test desktop and mobile.
6. With Analytics consent accepted, verify exactly one `affiliate_click` per click and correct product/provider fields. With consent rejected or unset, verify no Analytics event is sent. A GA4 event does not prove partner attribution.
7. Smoke-test the live page after deployment.

Priority for periodic attribution revalidation: Kfz and Girokonto first, then Strom.