# Almanya Pusulası — Affiliate Application Pack

Last reviewed: 2026-09-05

This file contains the current application status, site descriptions and placement plan for affiliate programmes. Do not activate any commercial slot until the programme/campaign is approved and the exact tracking URL is available.

## Current application status

- CHECK24 — registration completed 2026-09-05 as a private individual. Await attributable partner links/integration access.
- Wise — Partnerize account created; EUR payout campaign requested 2026-09-05. Status: pending review.
- N26 — Impact publisher profile created as publisher / individual / editorial content; website ownership verified. N26 AG application status: In Review.
- financeAds — not applied; defer until required Gewerbe/business proof is available.

## 1. CHECK24 Affiliate

Reason: low practical entry barrier for the current project and strong fit with existing finance, insurance, energy and mobility content.

Best existing placements:
- `/kfz-versicherung/`
- `/almanyada-elektrik-aboneligi/`
- `/sigorta-secim-rehberi/`

Publisher description used/prepared (German):

> Almanya Pusulası (almanyapusulasi.de) ist ein türkischsprachiges Informationsportal für Menschen, die in Deutschland leben oder nach Deutschland ziehen möchten. Die Website veröffentlicht aktuelle, praxisorientierte Ratgeber zu Finanzen, Versicherungen, Mobilität, Arbeit, Familie, Wohnen, Steuern und Behördenprozessen. Unsere Inhalte verlinken auf offizielle Quellen und führen Nutzer von Informationsartikeln zu thematischen Entscheidungs- und Vergleichsseiten. Für das CHECK24 Partnerprogramm sind insbesondere Kfz-Versicherung, Strom und weitere Tarifvergleiche relevant. Werbung und Affiliate-Links werden transparent als kommerziell gekennzeichnet und redaktionelle Inhalte bleiben davon getrennt.

Site URL:
- https://almanyapusulasi.de/

Useful review URLs:
- https://almanyapusulasi.de/sigorta-secim-rehberi/
- https://almanyapusulasi.de/kfz-versicherung/
- https://almanyapusulasi.de/almanyada-elektrik-aboneligi/
- https://almanyapusulasi.de/ticari-seffaflik/
- https://almanyapusulasi.de/privacy/
- https://almanyapusulasi.de/impressum/

Official programme page:
- https://www.check24.de/partner/partnerprogramm/

## 2. Wise Website / SEO Partnership

Reason: very strong semantic fit for the Germany-to-Turkey money transfer guide. Website/SEO partners use Partnerize for tracking after approval.

Application completed on 2026-09-05:
- Partnerize publisher account created.
- Wise campaign found under campaigns.
- Only `Wise - Commission payout currency EUR` requested for the Germany-based site.
- Terms accepted and request submitted.
- Current state: `1 Pending request` / pending Wise review.

Best placement after approval:
- `/almanyadan-turkiyeye-para-transferi/`

Publisher description (English):

> Almanya Pusulası is a Turkish-language Germany information website for Turkish-speaking residents and newcomers. We publish practical, search-driven guides about finance, banking, insurance, relocation, work and cross-border topics. Our Germany-to-Turkey money transfer guide explains total transfer cost, exchange-rate margin, recipient amount and transfer time without claiming that one provider is always the cheapest. We would like to use Wise as a clearly disclosed commercial option within this educational context. Affiliate links will be labelled and separated from official/independent sources.

Useful review URLs:
- https://almanyapusulasi.de/almanyadan-turkiyeye-para-transferi/
- https://almanyapusulasi.de/finans/
- https://almanyapusulasi.de/ticari-seffaflik/

Promotion restrictions to remember:
- Do not use paid search or paid social to drive traffic to Wise without explicit written permission.
- Do not bid on Wise brand terms or misspellings.
- Do not advertise unsupported services or fake/free-transfer coupons.
- Affiliate relationship must be disclosed.

After approval:
1. Create/copy the exact Wise tracking or deeplink in Partnerize.
2. Enable only `money-transfer` in `assets/js/affiliate-slots.js`.
3. Set provider to the approved Wise programme/brand name and use the exact URL.
4. Test attribution before deployment.

Official pages:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm
- https://wise.com/partner/guidelines

## 3. N26 Affiliate

Reason: strong fit for the bank account decision cluster and a direct-bank monetization path.

Application completed on 2026-09-05 through Impact:
- profile type: `a publisher`;
- operating as: `an individual`;
- promotion/content type: `editorial content`;
- channel: `https://almanyapusulasi.de`;
- website ownership: verified successfully;
- N26 AG application: `In Review`.

The homepage currently contains the verification tag supplied by Impact:
`<meta name="impact-site-verification" value="045efa89-f970-457d-a093-cc960aefc83b">`

Keep this verification tag while the application is under review. Remove it later only after confirming Impact/N26 no longer needs it for channel verification.

Best placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/almanyada-banka-hesabi/`
- `/finans/`

Editorial constraint: N26 must not automatically become the top-ranked account because it pays commission. Any comparison remains criteria-based and independent.

After approval:
1. Obtain the exact Impact/N26 tracking URL or approved deeplink.
2. Review the N26 campaign terms and permitted promotional methods before activation.
3. Enable `bank-comparison` only if the slot copy accurately describes the destination; otherwise add a dedicated N26 commercial slot rather than misrepresenting it as a broad comparison tool.
4. Label the CTA as commercial/affiliate and retain `rel="sponsored noopener"`.
5. Test attribution before deployment.

Official programme page:
- https://n26.com/de-de/affiliate

## 4. financeAds

Reason: strong long-term finance/insurance network fit. Current published requirements include a live, current finance-relevant website, valid Impressum and proof of registered business (Gewerbe).

Apply once Gewerbe proof is available.

Best placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/sigorta-secim-rehberi/`
- `/kredi/`

Publisher description (German):

> Almanya Pusulası ist ein türkischsprachiges Informations- und Ratgeberportal für Menschen in Deutschland. Ein Schwerpunkt liegt auf finanziell relevanten Entscheidungen wie Girokonto, SCHUFA, Versicherungen, Baufinanzierung, Geldtransfer und laufenden Haushaltskosten. Die Website ist live, verfügt über Impressum, Datenschutz- und Transparenzseiten und nutzt thematische Vergleichs- und Entscheidungsseiten. Partnerprogramme sollen nur dort integriert werden, wo sie zum Such- und Nutzerintent passen; kommerzielle Links werden klar gekennzeichnet und redaktionelle Kriterien nicht von der Provision abhängig gemacht.

Official page:
- https://www.financeads.net/affiliates/

## Technical activation after approval

1. Copy only the exact approved tracking URL from the partner dashboard.
2. Open `assets/js/affiliate-slots.js`.
3. Enable only the matching slot:
   - `bank-comparison`
   - `insurance-comparison`
   - `money-transfer`
   - `electricity-comparison`
   - `kfz-insurance`
4. Set the approved provider name and tracking URL.
5. Leave all other slots disabled.
6. Confirm rendered affiliate links use `rel="sponsored noopener"`.
7. Confirm the visible CTA is labelled as commercial/affiliate.
8. Verify `/ticari-seffaflik/` and `/privacy/` still describe the active setup accurately.
9. Test outbound attribution without changing editorial official-source links.
10. After deployment, verify GA4 `affiliate_click` only appears for users who accepted analytics.

## Editorial rule

No commercial partner should be described as “best”, “cheapest” or “recommended” unless that statement is independently supportable with explicit, current comparison criteria. Commission level must never be the sole ranking criterion.
