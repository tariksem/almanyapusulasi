# Almanya Pusulası — Monetization Plan

> Activation status correction (2026-09-08): the original pending-link items below are historical for Girokonto, Kfz and Strom. All three are now enabled in the repository. TARIFCHECK Girokonto/Kfz match the authenticated-dashboard catalog; CHECK24 Strom still needs an equivalent provenance record. Use [the current activation audit](AFFILIATE-LINK-ACTIVATION.md) for exact mapping and remaining checks; do not reactivate or reroute products from this older pipeline.

Last reviewed: 2026-09-07

## Objective

Primary objective: turn `almanyapusulasi.de` into a revenue-producing site as quickly as possible without sacrificing attribution accuracy, disclosure, SEO quality or user trust.

Affiliate is the current first monetization priority. AdSense remains secondary until the Google-certified CMP/account-side requirements are completed.

## Current affiliate status

| Partner | Platform | Current state | Immediate trigger |
| --- | --- | --- | --- |
| TARIFCHECK | Direct partner programme | **APPROVED / ACTIVE** — Partner-ID `204420` | exact Girokonto/Kfz attributable deeplink or approved Werbemittel |
| CHECK24 | Direct partner programme | **APPROVED / ACTIVE** — Partner-ID `1177200` | exact Girokonto/Strom/Kfz attributable deeplink or approved Werbemittel |
| Wise | Partnerize | **Publisher account approved** | exact Partnerize tracking link; affiliate-team follow-up sent 2026-09-07 |
| Verivox | Direct partner programme | Outreach/application prep; Privatpersonen eligible | registration/approval + partner-coded Link-out/iFrame |
| WorldRemit | Impact | Application target; Germany supported | Impact application/approval + exact tracking link |
| N26 | Impact | Application received / under review | campaign approval + exact Impact tracking link |
| financeAds | financeAds | Deferred | reconsider only when incremental value exceeds setup friction |

Never infer a tracking URL from a Partner-ID. A normal provider URL is not a substitute for an attributable affiliate destination.

## Revenue priority

Priority is based on current programme economics, search/commercial intent, seasonality and site readiness. Commission values are operational signals only and must not be hard-coded into evergreen editorial content.

1. **Kfz-Versicherung — P0.** TARIFCHECK public programme currently advertises 70 € per sale; Verivox publicly lists 50 € per confirmed contract. September–November is a strong switching season. Target pages: `/kfz-versicherung-karsilastirma-2026/`, `/kfz-versicherung-wechseln-2026/`, `/kfz-versicherung-30-kasim/`, `/mobilite-arac/`.
2. **Girokonto — P0.** TARIFCHECK public programme currently advertises 40 € per sale. CHECK24 is an additional approved route. Target pages: `/girokonto-karsilastirma-2026/`, `/banka-secim-araci/`, `/finans/`.
3. **DSL / Internet — P1.** Verivox publicly lists 50 € per confirmed contract. Target pages: `/internet-tarife-karsilastirma-2026/`, `/telefon-internet/`, `/internet-tarife-maliyet-hesaplayici/`.
4. **Strom — P1.** CHECK24 and Verivox both fit. Verivox publicly lists 20 € per confirmed contract; CHECK24 has repeatedly advertised 20 € energy lead campaigns. Target: `/stromtarif-karsilastirma-2026/` and Strom cluster.
5. **Germany → Turkey money transfer — P1.** Wise account approved; WorldRemit official programme supports Germany and publicly states standard £30 commission subject to current terms/traffic quality. Target: `/almanyadan-turkiyeye-para-transferi/`, `/para-transferi-maliyet-hesaplayici/`, `/almanya-turkiye-para-gonderme-maliyeti-2026/`.
6. **Privathaftpflicht — P2.** Verivox publicly lists 16.50 € per confirmed contract. Target: `/haftpflicht-karsilastirma-2026/` and insurance cluster.
7. **N26 — P2 until approved.** Keep Impact verification and bank-cluster readiness.

## Current implementation state

The site already contains:
- consent-aware commercial tracking via `assets/js/commercial-tracking.js`;
- reusable single affiliate slots via `assets/js/affiliate-slots.js`;
- reusable multi-provider offer stacks via `assets/js/commercial-offers.js`;
- visible commercial disclosure blocks;
- `rel="sponsored noopener"` on rendered affiliate CTAs;
- high-intent comparison pages for Girokonto, Kfz, Strom, Internet and Privathaftpflicht;
- a multi-provider `money-transfer` offer stack for Wise + WorldRemit once links are approved;
- production QA for flagship growth pages, canonical/noindex checks and live smoke tests.

## Partner actions already taken 2026-09-07

TARIFCHECK:
- activation confirmed;
- support requests sent for exact Girokonto and Kfz Direktlinks/Deeplinks/Werbemittel.

CHECK24:
- activation confirmed;
- support request sent for exact Girokonto, Strom and Kfz Deeplinks/Werbemittel.

Wise:
- Partnerize approval confirmed by welcome email;
- follow-up sent to `partnerwise@wise.com` asking whether the account is fully ready and which Germany-to-Turkey destination/deeplink is recommended.

Verivox:
- official programme verified as accepting Privatpersonen;
- partner outreach sent to `partner@verivox.de`;
- preferred initial implementation communicated as Link-out first, then iFrame only when conversion/performance justifies it;
- Kfz seasonal pages specifically surfaced to partner team.

WorldRemit:
- official affiliate programme verified;
- Germany confirmed as supported promotion country;
- official signup routes through Impact;
- site transfer page prepared for multiple offers;
- Impact outreach sent asking whether WorldRemit can be added under the existing publisher account.

N26:
- Impact application remains under review.

## Placement map

### Bank / Girokonto
- `/girokonto-karsilastirma-2026/`
- `/banka-secim-araci/`
- `/finans/`

Preferred first partners: TARIFCHECK, CHECK24. Add N26 only after campaign approval and exact Impact link.

### Kfz
- `/kfz-versicherung-karsilastirma-2026/`
- `/kfz-versicherung-wechseln-2026/`
- `/kfz-versicherung-30-kasim/`
- `/mobilite-arac/`

Preferred first partner: TARIFCHECK exact Direktlink. Verivox is backup/second-offer path after approval.

### Internet / DSL
- `/internet-tarife-karsilastirma-2026/`
- `/telefon-internet/`
- `/internet-tarife-maliyet-hesaplayici/`

Preferred first partner: Verivox Link-out unless partner team recommends a more suitable integration.

### Strom
- `/stromtarif-karsilastirma-2026/`
- Strom switching/supporting content

Preferred first partner: whichever of CHECK24 or Verivox provides a verified attributable implementation first.

### Money transfer
- `/almanyadan-turkiyeye-para-transferi/`
- `/para-transferi-maliyet-hesaplayici/`
- `/almanya-turkiye-para-gonderme-maliyeti-2026/`

Preferred partners: Wise + WorldRemit shown as separate commercial options when both are approved. Never claim one is always cheapest; compare total cost, FX margin, recipient amount and transfer time.

### Privathaftpflicht
- `/haftpflicht-karsilastirma-2026/`
- `/sigorta/`

Preferred first partner: Verivox after approval.

## Activation procedure

For every partner/product:
1. Confirm campaign/account is approved and active.
2. Copy the exact attributable tracking/deeplink or approved widget from the partner system.
3. Verify destination, product fit and current programme terms.
4. Add only to the matching `affiliate-slots.js` or `commercial-offers.js` category.
5. Keep unrelated slots disabled.
6. Preserve visible affiliate disclosure and `rel="sponsored noopener"`.
7. Test mobile destination and attribution before production deployment.
8. Verify exactly one consent-aware GA4 `affiliate_click` event.
9. Deploy and verify production smoke test / Site Quality Audit.
10. Expand placement only after click/conversion evidence.

## Conversion strategy

The desired funnel is:

`Google / direct visitor → high-intent guide or decision tool → neutral criteria → commercial offer → partner comparison/product → confirmed conversion`

Rules:
- do not rank by commission;
- route high-intent users to comparison pages rather than generic content;
- use calculators/decision tools as qualification layers;
- place commercial CTA after enough information to make intent explicit;
- keep official/non-commercial source links available;
- measure `commercial_intent_click`, `comparison_to_tool` and `affiliate_click` separately.

## SEO + revenue coupling

Highest-value pages must stay in GSC Indexing Tracker. Current commercial clusters being actively tracked include Kfz switching/comparison, Girokonto, Internet comparison and money-transfer pages.

Internal linking should prioritize user intent and crawl discovery:
- `/mobilite-arac/` → Kfz comparison + Kfz switching + 30 November;
- `/telefon-internet/` → Internet tariff comparison + decision tool + cost calculator;
- `/finans/` → Girokonto + Strom + transfer;
- `/sigorta/` → Privathaftpflicht + Kfz.

## AdSense

AdSense is not the first revenue lever while affiliate programmes are becoming active.

Current gate remains:
1. publish a Google-certified CMP / European regulations message for EEA/UK/Switzerland traffic;
2. confirm privacy/consent behavior;
3. only then activate AdSense site code / Auto Ads.

Affiliate work should not wait for AdSense.

## Immediate blockers

Authenticated/manual partner-side steps still required:
- TARIFCHECK: copy exact Girokonto/Kfz partner links from dashboard or support response;
- CHECK24: copy exact Girokonto/Strom/Kfz links/widgets;
- Wise: copy exact Partnerize tracking link;
- Verivox: submit registration with personal contact/address fields and accept programme terms, then obtain partner-coded Werbemittel;
- WorldRemit: submit/approve Impact campaign;
- N26: wait for Impact approval.

The moment any exact attributable link becomes available, production activation takes priority over additional planning.
