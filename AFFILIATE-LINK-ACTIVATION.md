# Affiliate link activation runbook

Repository audit: 2026-09-13. This file records activation provenance and approved placement use; it does not authorize inventing or deriving new partner URLs.

## Current state and evidence

PR #2 kept the original slots disabled, but later commits enabled them. Do not repeat the original activation procedure without checking the current configuration.

| Product | Slot key | Current repository state | Evidence | Remaining work |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches `TARIFCHECK-DIRECTLINKS.md`, which records authenticated dashboard verification on 2026-09-07 | Recheck product destination/account attribution during periodic release QA |
| Kfz | `kfz-insurance` | enabled; URL populated; TARIFCHECK / `204420` | Activated in `84a317c`; exact URL matches the same authenticated-dashboard catalog | Recheck product destination/account attribution during periodic release QA |
| Strom | `electricity-comparison` | enabled; URL populated; CHECK24 / `1177200` | On 2026-09-13 the logged-in CHECK24 Strom generator visitor URL was manually compared with production and reported as an exact match | Revalidate only if CHECK24 changes generator output or the production URL changes |

The TARIFCHECK catalog was added in `efd71a3`. The CHECK24 Strom configuration-level exact match was closed on 2026-09-13. Configuration verification is distinct from conversion proof: genuine dashboard click/lead/sale evidence still requires real user traffic.

The central config currently has enabled commercial slots plus three intentionally disabled slots: `tax-software`, `internet-comparison`, and `money-transfer`. Disabled slots have empty provider, partner ID and URL fields; activation requires the corresponding approved product/account and exact attributable URL.

## Familienleistungen P0 placement expansion — 2026-09-13

Commit `676a256` expanded the existing slot system into the family-benefits decision funnel without changing partner URLs or activation flags:

| Page | Slot | Why it is contextually relevant |
| --- | --- | --- |
| `/aile-cocuk/` | `electricity-comparison` | after benefit discovery and household-budget tools; positioned as fixed-cost reduction, not as a benefit entitlement |
| `/kindergeld-hesaplayici-2026/` | `bank-comparison` | after the Kindergeld result; Kindergeld is bank-transferred and the copy explicitly says a bank change does not alter entitlement or amount |
| `/kinderzuschlag-uygunluk-kontrolu-2026/` | `electricity-comparison` | after the KiZ decision result; copy explicitly separates KiZ eligibility from household electricity savings |

The 2026-09-13 Elterngeld P0 adds one further placement:

| Page | Slot | Placement rule |
| --- | --- | --- |
| `/elterngeld-hesaplayici-2026/` | `risikoleben-comparison` | only after the free Elterngeld + household-budget result and after statutory-support/budget next steps; framed as optional family income protection when a household depends on earned income |

For the Elterngeld placement, the page must explicitly state that Risikolebensversicherung does **not** change Elterngeld entitlement, amount, Wohngeld or KiZ. The product must not be presented as a remedy for a public-benefit eligibility result. The sequence is **benefit estimate → household gap → statutory/support actions → optional family protection**.

All family-benefits placements must keep the editorial sequence **decision first, commercial comparison second**. Do not place the partner CTA ahead of eligibility/result content and do not imply that buying, switching or comparing a commercial product increases a statutory family benefit.

Commit `4206954` moved the disclosure guarantee into `assets/js/affiliate-slots.js`. Every active slot renders an explicit visible statement beginning **“Ticari bağlantı:”** and explains that Almanya Pusulası may receive a commission and that commission does not change the comparison result or editorial content. Page-level legacy `.commercial-disclosure` blocks may still be removed by the renderer to avoid duplication; the renderer disclosure is therefore the required source of truth.

## Safest next change

Preserve the verified provider mapping and exact revenue-critical visitor URLs. Do not overwrite or reconstruct a partner URL from a Partner-ID. For CHECK24 Strom, the current exact visitor URL is now part of the verified configuration evidence and must not change without a fresh authenticated generator comparison.

If a future generated URL differs, prepare a separate narrowly scoped change to the affected slot using the exact generated HTTPS visitor URL, update `data/affiliate-attribution-status.json`, and rerun CI. If attribution or destination fails, disable only the affected slot until resolved.

## Verified accounts

- TARIFCHECK Partner-ID: `204420`
- CHECK24 Partner-ID: `1177200`

## Verified deeplink generators

CHECK24 Affiliate Support confirmed these exact partner-dashboard sections on 2026-09-07:

- Girokonto (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/finanzen/girokonto/deeplinks/`
- Kfz-Versicherung (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/kfz-versicherung/autoversicherung/deeplinks/`
- Strom (CHECK24): `https://www.check24-partnerprogramm.de/werbemittel/strom/deeplink/`

These are dashboard/generator URLs, not visitor destinations. Do not publish them as affiliate CTAs.

## Verified configuration map

| Product | Slot key | Provider | Partner-ID | Status |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | TARIFCHECK | `204420` | verified configuration |
| Kfz | `kfz-insurance` | TARIFCHECK | `204420` | verified configuration |
| Strom | `electricity-comparison` | CHECK24 | `1177200` | authenticated generator exact-match verified 2026-09-13 |
| Risikoleben | `risikoleben-comparison` | TARIFCHECK | `204420` | verified against authenticated TARIFCHECK catalog |

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

## Remaining revenue proof

Configuration-level attribution for the current revenue-critical TARIFCHECK and CHECK24 Strom links is verified. The next validation is operational: compare genuine site-side `affiliate_click` traffic with partner-dashboard clicks, then record the first genuine lead/sale/commission. Do not generate synthetic partner traffic just to create proof.
