# Almanya Pusulası — Affiliate Application Pack

Last reviewed: 2026-09-07

## Revenue-first pipeline

1. **TARIFCHECK — APPROVED / ACTIVE.** Partner-ID `204420`. Activation email received 2026-09-07. Support request sent 2026-09-07 for exact attributable Girokonto/Kfz deeplinks and recommended Werbemittel. First target pages: `/girokonto-karsilastirma-2026/`, `/banka-secim-araci/`, `/kfz-versicherung-karsilastirma-2026/`.
2. **CHECK24 — APPROVED / ACTIVE.** Partner-ID `1177200`. Activation email received 2026-09-07. Support request already sent for exact attributable deeplinks/Werbemittel for Girokonto, Strom and Kfz. First target pages: `/girokonto-karsilastirma-2026/`, `/stromtarif-karsilastirma-2026/`, `/kfz-versicherung-karsilastirma-2026/`.
3. **Wise — PARTNERIZE ACCOUNT APPROVED.** Welcome email confirms the account is approved and directs the publisher to generate a tracking link in Partnerize. Exact tracking URL must still be copied from the authenticated Partnerize dashboard before activation. First target: `/almanyadan-turkiyeye-para-transferi/` and the transfer-cost calculator.
4. **N26 — UNDER REVIEW.** Impact application received; no approval email found as of 2026-09-07.
5. **financeAds — DEFERRED.** Reassess after business/Gewerbe setup if current publisher requirements make it worthwhile.

**Revenue rule:** approved programmes are now implementation priority. Do not publish a normal provider URL in a commercial CTA. Activate only the exact attributable tracking/deeplink supplied by the partner dashboard/support.

## TARIFCHECK

Status:
- account approved/active 2026-09-07;
- Partner-ID: `204420`;
- programme explicitly permits partner Werbemittel on website, social media and messenger channels according to the activation email;
- exact product/deeplink still required before live commercial CTA;
- support request sent to `support@tarifcheck.de` for Girokonto and Kfz deeplinks/Werbemittel.

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
- exact tracking URL still requires authenticated Partnerize dashboard access.

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

Official pages:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm
- https://wise.com/partner/guidelines

Activation procedure:
1. Log in to Partnerize.
2. Generate/copy the exact Wise tracking link.
3. Configure `money-transfer` only.
4. Test destination and attribution.
5. Expand to additional transfer pages only after the first placement is verified.

## N26 / Impact

Application details:
- publisher type: `a publisher`;
- operating as: `an individual`;
- content type: `editorial content`;
- channel: `https://almanyapusulasi.de`;
- website ownership: verified;
- status: application received / under review as of 2026-09-07.

Impact verification tag remains on the homepage while review is pending.

Planned pages:
- `/girokonto-karsilastirma-2026/`;
- `/almanyada-banka-hesabi/`;
- `/finans/`.

After approval:
1. Obtain exact Impact/N26 tracking URL/deeplink.
2. Review current campaign terms.
3. Create a dedicated N26 offer if the destination/wording does not fit a generic comparison slot.
4. Keep comparison criteria independent from commission.
5. Test destination and attribution.

Official programme:
- https://n26.com/de-de/affiliate

## financeAds

Potential later finance/insurance network. Reassess after business/Gewerbe setup.

Candidate pages:
- `/girokonto-karsilastirma-2026/`;
- `/sigorta-secim-rehberi/`;
- `/kredi/`.

Official page:
- https://www.financeads.net/affiliates/

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

## Current blockers requiring authenticated dashboard access

- TARIFCHECK: exact Girokonto/Kfz tracking/deeplinks.
- CHECK24: exact Girokonto/Strom/Kfz tracking/deeplinks.
- Wise: exact Partnerize tracking link.

Once any one exact attributable link is available, activate that revenue path immediately rather than waiting for the other programmes.