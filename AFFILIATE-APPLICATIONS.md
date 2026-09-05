# Almanya Pusulası — Affiliate Application Pack

Last reviewed: 2026-09-05

## Pipeline

- TARIFCHECK — registration completed successfully 2026-09-05. Account review / activation preparation in progress; Partner-ID not received yet. Initial product fit: Girokonto, Kfz-Versicherung and context-appropriate Private Krankenversicherung.
- CHECK24 — separate programme. Gmail still contains “Jetzt Registrierung abschließen” reminders; registration completion and approval are not confirmed.
- Wise — Partnerize account created; email verification is still required. EUR campaign approval is not confirmed.
- N26 — Impact profile: publisher / individual / editorial content. `almanyapusulasi.de` ownership verified. Application received / under review.
- financeAds — deferred until business/Gewerbe setup is available; re-check current requirements at application time.

Do not activate any commercial slot before approval and receipt of the exact attributable tracking URL/deeplink.

## TARIFCHECK

Registration status:
- registration successful;
- submitted data under review;
- account activation being prepared;
- Partner-ID expected by email after review;
- no attributable link is active yet.

Initial site fit:
- Girokonto → bank cluster and bank decision tool;
- Kfz-Versicherung → car/Kfz cluster and car-cost calculator;
- Private Krankenversicherung → only pages where PKV is contextually appropriate.

After Partner-ID / activation:
1. Open the TARIFCHECK partner dashboard.
2. Copy the exact attributable product/deeplink for each approved product.
3. Verify partner terms and whether deep linking/widget use is allowed.
4. Configure only the matching offer/slot in `assets/js/commercial-offers.js` or `assets/js/affiliate-slots.js`.
5. Keep visible commercial disclosure and `rel="sponsored noopener"`.
6. Test destination, attribution and a single consent-aware `affiliate_click` event.
7. Do not publish commission values from the partner UI as durable public claims.

## CHECK24

CHECK24 is a different affiliate programme and must not be confused with TARIFCHECK.

Current status:
- registration completion not confirmed;
- Gmail contains “Jetzt Registrierung abschließen” reminders;
- no approval, Partner-ID or attributable URL is recorded.

Existing application copy can be reused only if we deliberately complete a separate CHECK24 application:

> Almanya Pusulası (almanyapusulasi.de) ist ein türkischsprachiges Informationsportal für Menschen, die in Deutschland leben oder nach Deutschland ziehen möchten. Die Website veröffentlicht aktuelle, praxisorientierte Ratgeber zu Finanzen, Versicherungen, Mobilität, Arbeit, Familie, Wohnen, Steuern und Behördenprozessen. Unsere Inhalte verlinken auf offizielle Quellen und führen Nutzer von Informationsartikeln zu thematischen Entscheidungs- und Vergleichsseiten. Werbung und Affiliate-Links werden transparent als kommerziell gekennzeichnet und redaktionelle Inhalte bleiben davon getrennt.

Do not reuse TARIFCHECK Partner-ID, links or status for CHECK24.

## Wise application

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`

Application copy:

> Almanya Pusulası is a Turkish-language Germany information website for Turkish-speaking residents and newcomers. We publish practical, search-driven guides about finance, banking, insurance, relocation, work and cross-border topics. Our Germany-to-Turkey money transfer guide explains total transfer cost, exchange-rate margin, recipient amount and transfer time without claiming that one provider is always the cheapest. We would like to use Wise as a clearly disclosed commercial option within this educational context. Affiliate links will be labelled and separated from official/independent sources.

Current blocker:
- Partnerize email verification must be completed before normal platform use.

After verification and campaign approval:
1. Create/copy the exact Wise tracking/deeplink in Partnerize.
2. Enable `money-transfer` only.
3. Test destination and attribution.

Restrictions:
- no paid search or paid social traffic to Wise without explicit written permission;
- no Wise brand/misspelling bidding;
- no unsupported service or fake/free-transfer coupon claims;
- disclose affiliate relationship.

Official pages:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm
- https://wise.com/partner/guidelines

## N26 application

Application details:
- publisher type: `a publisher`
- operating as: `an individual`
- content type: `editorial content`
- channel: `https://almanyapusulasi.de`
- website ownership: verified
- status: application received / under review

Impact verification tag is intentionally retained on the homepage while the application is under review.

Planned pages:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/almanyada-banka-hesabi/`
- `/finans/`

After approval:
1. Obtain the exact Impact/N26 tracking URL/deeplink.
2. Review current campaign terms.
3. Use `bank-comparison` only if its wording accurately describes the destination; otherwise create a dedicated N26 commercial slot.
4. Keep comparison criteria independent from commission.
5. Test destination and attribution.

Official programme:
- https://n26.com/de-de/affiliate

## financeAds

Potential later finance/insurance network. Reassess after business/Gewerbe setup.

Candidate pages:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/sigorta-secim-rehberi/`
- `/kredi/`

Official page:
- https://www.financeads.net/affiliates/

## Activation checklist

1. Campaign approved/active.
2. Exact tracking URL copied from partner dashboard.
3. Only matching commercial slot enabled.
4. `rel="sponsored noopener"` retained.
5. Visible commercial/affiliate disclosure present.
6. Editorial and official-source links remain independent.
7. `/ticari-seffaflik/` and `/privacy/` checked.
8. Outbound attribution tested.
9. GA4 `affiliate_click` remains consent-aware.

TARIFCHECK is the nearest activation opportunity and is being monitored for Partner-ID. Wise is blocked on Partnerize email verification. N26 is under review. CHECK24 remains a separate, not-yet-confirmed registration path.
