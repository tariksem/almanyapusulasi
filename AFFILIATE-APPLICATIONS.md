# Almanya Pusulası — Affiliate Application Pack

> Activation status correction (2026-09-08): the original pending-link items below are historical for Girokonto, Kfz and Strom. All three are now enabled in the repository. TARIFCHECK Girokonto/Kfz match the authenticated-dashboard catalog; CHECK24 Strom still needs an equivalent provenance record. Use [the current activation audit](AFFILIATE-LINK-ACTIVATION.md) for exact mapping and remaining checks; do not reactivate or reroute products from this older pipeline.

Last reviewed: 2026-09-07

## Revenue-first pipeline

1. **TARIFCHECK — APPROVED / ACTIVE.** Partner-ID `204420`. Activation email received 2026-09-07. Support request sent 2026-09-07 for exact attributable Girokonto/Kfz deeplinks and recommended Werbemittel. First target pages: `/girokonto-karsilastirma-2026/`, `/banka-secim-araci/`, `/kfz-versicherung-karsilastirma-2026/`.
2. **CHECK24 — APPROVED / ACTIVE.** Partner-ID `1177200`. Activation email received 2026-09-07. Support request already sent for exact attributable deeplinks/Werbemittel for Girokonto, Strom and Kfz. First target pages: `/girokonto-karsilastirma-2026/`, `/stromtarif-karsilastirma-2026/`, `/kfz-versicherung-karsilastirma-2026/`.
3. **Wise — PARTNERIZE ACCOUNT APPROVED.** Welcome email confirms the account is approved and directs the publisher to generate a tracking link in Partnerize. Exact tracking URL must still be copied from the authenticated Partnerize dashboard before activation. Wise affiliate-team follow-up sent 2026-09-07. First target: `/almanyadan-turkiyeye-para-transferi/` and the transfer-cost calculator.
4. **Verivox — OUTREACH / APPLICATION PREP.** Public programme page confirms Privatpersonen are eligible. Partner-team outreach sent 2026-09-07 to `partner@verivox.de` asking for fit confirmation and recommended Link-out/iFrame formats for Strom, DSL, Kfz and Privathaftpflicht. Direct registration still requires personal address/telephone fields in the application form.
5. **WorldRemit — APPLICATION TARGET / IMPACT.** Official programme supports promotion in Germany and routes affiliate registration through Impact. Public programme page states a standard £30 commission at £50 minimum spend, subject to traffic quality and current terms. The existing transfer page is prepared for multiple commercial offers so Wise and WorldRemit can coexist without commission-based editorial ranking.
6. **Remitly — APPLICATION TARGET / IMPACT.** Official Partner Program accepts Germany-based individuals and content partners, explicitly including comparison sites, finance blogs and expat media. Programme signup is through Impact. Partner-team outreach sent 2026-09-07 to `partner@remitly.com` asking for the fastest application path using the existing Impact publisher account and confirmation of Germany-to-Turkey corridor eligibility.
7. **N26 — UNDER REVIEW.** Impact application received; no approval email found as of 2026-09-07.
8. **financeAds — DEFERRED.** Reassess after business/Gewerbe setup if current publisher requirements make it worthwhile.

**Revenue rule:** approved programmes are implementation priority. Do not publish a normal provider URL in a commercial CTA. Activate only the exact attributable tracking/deeplink supplied by the partner dashboard/support.

## Current revenue priority matrix

Internal prioritisation only; do not hard-code commissions into evergreen public pages because rates/promotions change.

| Priority | Product | Best current partner path | Public commission signal checked 2026-09-07 | Site targets |
| --- | --- | --- | --- | --- |
| P0 | Kfz-Versicherung | TARIFCHECK first; Verivox backup | TARIFCHECK public page currently advertises 70 € / sale; Verivox 50 € / confirmed contract | `/kfz-versicherung-karsilastirma-2026/`, Kfz cluster |
| P0 | Girokonto | TARIFCHECK / CHECK24 | TARIFCHECK public page currently advertises 40 € / sale | `/girokonto-karsilastirma-2026/`, `/banka-secim-araci/`, `/finans/` |
| P1 | DSL / Internet | Verivox | Verivox public partner page: 50 € / confirmed contract | `/internet-tarife-karsilastirma-2026/`, internet cost tool |
| P1 | Strom | CHECK24 / Verivox | Verivox public partner page: 20 € / confirmed contract; CHECK24 public programme announcements repeatedly market 20 € energy leads | `/stromtarif-karsilastirma-2026/`, Strom cluster |
| P1 | International transfer | Wise / WorldRemit / Remitly | WorldRemit public programme: standard £30 subject to terms; Remitly public programme: USD $5–20 depending on send corridor; Wise rate account-specific | `/almanyadan-turkiyeye-para-transferi/`, transfer-cost tool |
| P2 | Privathaftpflicht | Verivox | Verivox public partner page: 16.50 € / confirmed contract | `/haftpflicht-karsilastirma-2026/`, insurance cluster |
| P2 | N26 | Impact | application under review | Girokonto / bank cluster |

Seasonality note: September–November is commercially important for Kfz switching intent, so Kfz should receive faster tracking-link activation and stronger internal traffic routing once the exact attributable link exists.

## TARIFCHECK

Status:
- account approved/active 2026-09-07;
- Partner-ID: `204420`;
- programme explicitly permits partner Werbemittel on website, social media and messenger channels according to the activation email;
- exact product/deeplink still required before live commercial CTA;
- support requests sent to `support@tarifcheck.de` for Girokonto and Kfz deeplinks/Werbemittel.

Immediate site fit:
- Girokonto → `/girokonto-karsilastirma-2026/`, `/banka-secim-araci/`, `/finans/`;
- Kfz-Versicherung → `/kfz-versicherung-karsilastirma-2026/` and relevant Kfz guides;
- Private Krankenversicherung → only pages where PKV is contextually appropriate.

Activation procedure:
1. Copy the exact attributable product/deeplink from TARIFCHECK dashboard/support.
2. Verify current product terms and destination.
3. Configure only the matching offer in `assets/js/commercial-offers.js`.
4. Keep visible commercial disclosure and `rel="sponsored noopener"`.
5. Test destination, attribution and consent-aware `affiliate_click` event.
6. Do not publish partner-dashboard commission values as durable public claims.

## CHECK24

Status:
- account approved/active 2026-09-07;
- Partner-ID: `1177200`;
- support request sent for exact attributable Girokonto, Strom and Kfz deeplinks/Werbemittel;
- exact product/deeplink still required before live commercial CTA.

Immediate site fit:
- Girokonto → `/girokonto-karsilastirma-2026/`;
- Strom → `/stromtarif-karsilastirma-2026/`;
- Kfz → `/kfz-versicherung-karsilastirma-2026/`.

Do not reuse TARIFCHECK Partner-ID or links for CHECK24. The programmes are separate even though related programme infrastructure/branding may overlap.

Activation procedure:
1. Obtain exact attributable product/deeplink from CHECK24 dashboard/support.
2. Verify destination and current partner terms.
3. Enable only the matching commercial slot.
4. Keep `rel="sponsored noopener"` and visible affiliate disclosure.
5. Test attribution and analytics before expanding placement.

## Wise / Partnerize

Status:
- Partnerize welcome email received;
- email states the account is approved and provides access to tracking-link creation;
- exact tracking URL still requires authenticated Partnerize dashboard access;
- follow-up sent 2026-09-07 to `partnerwise@wise.com` asking for Germany-to-Turkey landing/deeplink guidance.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`
- `/para-transferi-maliyet-hesaplayici/`
- `/almanya-turkiye-para-gonderme-maliyeti-2026/`

Editorial positioning:
- explain total transfer cost, exchange-rate margin, recipient amount and transfer time;
- do not claim Wise is always cheapest;
- clearly label the commercial option.

Restrictions from current Wise partner guidance:
- no paid advertising without explicit prior written permission;
- no Wise brand/misspelling domain or bidding tactics;
- no free-transfer coupon claims for website partners;
- use educational content first, then the affiliate CTA;
- comparison claims against competitors require coordination with Wise.

Activation procedure:
1. Log in to Partnerize.
2. Generate/copy the exact Wise tracking link.
3. Add Wise as a verified offer in `money-transfer`.
4. Test destination and attribution.
5. Expand to additional transfer pages only after the first placement is verified.

## Verivox

Public programme facts checked 2026-09-07:
- Gewerbetreibende and Privatpersonen are eligible;
- supported monetisation formats include iFrame, banner, Link-out and webservice;
- no minimum turnover; public page states monthly payout from 1 € balance;
- current public commission examples include DSL 50 €, Kfz 50 €, Strom 20 €, Private Haftpflicht 16.50 €, Rechtsschutz 50 €, Wohngebäude 75 € per confirmed contract; rates may change and must be rechecked before public claims or forecasting.

Best Almanya Pusulası fit:
- DSL → `/internet-tarife-karsilastirma-2026/`;
- Kfz → `/kfz-versicherung-karsilastirma-2026/`;
- Strom → `/stromtarif-karsilastirma-2026/`;
- Privathaftpflicht → `/haftpflicht-karsilastirma-2026/`.

Status/actions:
- partner-team outreach plus prioritisation follow-up sent 2026-09-07 to `partner@verivox.de`;
- direct registration form requires Privatperson/Gewerbe choice, name, German address, phone, email and website plus acceptance of programme terms;
- no Verivox tracking link or Partner-ID is active yet.

Activation procedure after approval:
1. Prefer Link-out for fastest first conversion test unless Verivox recommends an iFrame for the target product.
2. Copy the exact partner-coded Werbemittel from `Programm/Werbemittel` in the Verivox partner account.
3. Add as a verified offer to the matching `commercial-offers.js` category.
4. Run destination, attribution, mobile and Core Web Vitals checks; use iFrame only if page performance remains acceptable.
5. Expand from one placement per product only after click/conversion evidence.

## WorldRemit / Impact

Official programme facts checked 2026-09-07:
- affiliate signup is routed through Impact;
- Germany is listed as a supported promotion country;
- public standard commission is £30 at £50 minimum spend, but WorldRemit states the rate can vary with traffic quality;
- affiliates receive unique tracking and have access to localised creative assets, promo codes and a marketing API.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`
- `/para-transferi-maliyet-hesaplayici/`
- `/almanya-turkiye-para-gonderme-maliyeti-2026/`

Site readiness:
- `/almanyadan-turkiyeye-para-transferi/` loads both `commercial-offers.js` and the single-slot fallback;
- the `money-transfer` offer stack can display Wise, WorldRemit and Remitly side by side once exact approved tracking links are available;
- editorial order must not be based on commission amount.

Application procedure:
1. Use the official WorldRemit affiliate signup routed to Impact.
2. Apply using `almanyapusulasi.de` as the editorial website/channel.
3. After approval, copy exact attributable tracking/deeplink and verify Germany-to-Turkey destination support.
4. Add the offer to `commercial-offers.js` only after current terms are checked.
5. Test attribution before expanding placement.

## Remitly / Impact

Official programme facts checked 2026-09-07:
- Germany-based individuals and businesses are eligible;
- Remitly explicitly works with comparison sites, finance blogs, news publishers and expat media;
- onboarding is through Impact;
- public commission range is USD $5–20 per referral depending on send corridor;
- attribution cookie window is 30 days;
- approval provides trackable links and creative assets.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`
- `/para-transferi-maliyet-hesaplayici/`
- `/almanya-turkiye-para-gonderme-maliyeti-2026/`

Status/actions:
- outreach sent 2026-09-07 to `partner@remitly.com`;
- asked whether the existing Impact publisher account can be used directly and whether Germany-to-Turkey is currently eligible for affiliate attribution;
- no tracking link is active yet.

Activation procedure:
1. Apply through the official Remitly Impact onboarding form/account.
2. Confirm Germany-to-Turkey corridor and current campaign terms.
3. Copy exact attributable tracking link.
4. Add Remitly as a verified `money-transfer` offer without commission-based ranking.
5. Test attribution and mobile destination before expanding.

## N26 / Impact

Application details:
- publisher type: `a publisher`;
- operating as: `an individual`;
- content type: `editorial content`;
- channel: `https://almanyapusulasi.de`;
- website ownership: verified;
- status: application received / under review as of 2026-09-07.

Impact verification tag remains on the homepage while the application is under review.

Planned pages:
- `/girokonto-karsilastirma-2026/`;
- `/almanyada-banka-hesabi/`;
- `/finans/`.

After approval:
1. Obtain the exact Impact/N26 tracking URL/deeplink.
2. Review current campaign terms.
3. Create a dedicated N26 offer if the destination/wording does not fit a generic comparison slot.
4. Keep comparison criteria independent from commission.
5. Test destination and attribution.

## financeAds

Potential later finance/insurance network. Reassess after business/Gewerbe setup.

Candidate pages:
- `/girokonto-karsilastirma-2026/`;
- `/sigorta-secim-rehberi/`;
- `/kredi/`.

## Activation checklist

1. Campaign approved/active.
2. Exact attributable tracking URL copied from partner dashboard/support.
3. Only matching commercial slot enabled.
4. `rel="sponsored noopener"` retained.
5. Visible commercial/affiliate disclosure present.
6. Editorial and official-source links remain independent.
7. `/ticari-seffaflik/` and `/privacy/` checked.
8. Outbound attribution tested.
9. GA4 `affiliate_click` remains consent-aware.
10. Start with high-intent pages; expand only after verified clicks/conversions.

## Current blockers requiring authenticated dashboard/application access

- TARIFCHECK: exact Girokonto/Kfz tracking/deeplinks.
- CHECK24: exact Girokonto/Strom/Kfz tracking/deeplinks.
- Wise: exact Partnerize tracking link.
- Verivox: registration/approval plus exact partner-coded Werbemittel.
- WorldRemit: Impact application/approval plus exact tracking link.
- Remitly: Impact application/approval plus exact tracking link.

Once any one exact attributable link is available, activate that revenue path immediately rather than waiting for the other programmes.
