# Almanya Pusulası — Affiliate Application Pack

Last reviewed: 2026-09-04

This file contains the current application order, site description and placement plan for affiliate programme applications. Do not activate any commercial slot until the programme is approved and the exact tracking URL is available.

## Recommended application order

### 1. CHECK24 Affiliate

Reason: lowest practical entry barrier for the current project. CHECK24 states that both private individuals and businesses can participate. Its affiliate programme offers comparison calculators and advertising materials in categories already covered by Almanya Pusulası, including Kfz insurance, electricity, internet and other tariff products.

Best existing placements:
- `/kfz-versicherung/`
- `/almanyada-elektrik-aboneligi/`
- `/sigorta-secim-rehberi/`

Suggested publisher description (German):

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

### 2. Wise Website / SEO Partnership

Reason: very strong semantic fit for the Germany-to-Turkey money transfer guide. Wise states that individuals or businesses with an online presence can apply. Website/SEO partners use Partnerize for tracking after approval.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`

Suggested publisher description (English):

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

Official pages:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm
- https://wise.com/partner/guidelines

### 3. financeAds

Reason: strongest long-term finance/insurance network fit, with 500+ finance partner programmes and comparison tools. Current published requirements include a live, current finance-relevant website, valid Impressum and proof of registered business (Gewerbe).

Apply once Gewerbe proof is available.

Best placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/sigorta-secim-rehberi/`
- `/kredi/`

Suggested publisher description (German):

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
4. Set the approved provider name and tracking URL.
5. Leave all other slots disabled.
6. Confirm rendered affiliate links use `rel="sponsored noopener"`.
7. Confirm the visible CTA is labelled as commercial/affiliate.
8. Verify `/ticari-seffaflik/` and `/privacy/` still describe the active setup accurately.
9. Test outbound attribution without changing editorial official-source links.
10. After deployment, verify GA4 `affiliate_click` only appears for users who accepted analytics.

## Editorial rule

No commercial partner should be described as “best”, “cheapest” or “recommended” unless that statement is independently supportable with explicit, current comparison criteria. Commission level must never be the sole ranking criterion.
