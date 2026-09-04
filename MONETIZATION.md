# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-04

## Current status

The site has commercial decision pages, affiliate disclosure language, consent-aware commercial click tracking and disabled affiliate slots. No partner link should be activated until a publisher account is approved and the exact tracking URL is available.

## Priority 1 — financeAds

Why: specialist DACH finance/insurance affiliate network with 500+ partner programmes and comparison tools. Relevant categories already match the strongest site clusters: Girokonto, Kredit, Versicherung, FinTech and related products.

Current publisher requirements stated by financeAds include a live website with current content and proof of a registered business (Gewerbe). Registration is free.

Candidate placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/` → Girokonto/comparison offer
- `/sigorta-secim-rehberi/` → insurance comparison offer
- `/kredi/` and mortgage cluster → only after a suitable approved programme is selected

Do not hard-code temporary campaign prices, bonuses or commission values into editorial copy. Programme conditions change frequently.

Official programme pages:
- https://www.financeads.net/affiliates/
- https://www.financeads.net/partnerprogramme/

## Priority 2 — CHECK24 Affiliate

Why: direct affiliate programme with comparison calculators/widgets for categories such as Kfz insurance, electricity, internet and other tariff products. CHECK24 currently states that registration is free and that private individuals as well as businesses can participate. Commission varies by product and campaign.

Best first placements:
- `/kfz-versicherung/`
- `/almanyada-elektrik-aboneligi/`
- `/sigorta-secim-rehberi/`

Official page:
- https://www.check24.de/partner/partnerprogramm/

## Priority 3 — Wise

Why: strong fit for the existing Germany–Turkey money transfer intent. Wise currently accepts affiliate applications from people/companies with an online presence; SEO publishers receive tracking through Partnerize after approval.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`

Official programme information:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm

## Activation procedure

1. Apply to one network/programme at a time, starting with financeAds if the required Gewerbe proof is available; otherwise CHECK24 or Wise can be pursued first.
2. After approval, obtain the exact publisher tracking URL from the partner dashboard.
3. Edit `assets/js/affiliate-slots.js` only:
   - set the matching slot `enabled: true`
   - set `provider`
   - paste the exact approved tracking `url`
4. Keep `rel="sponsored noopener"` on all affiliate links.
5. Never replace an editorial/official-source link with an affiliate link. Commercial CTAs remain additive.
6. Confirm that `/ticari-seffaflik/` still accurately describes the active commercial relationship.
7. Test the outbound link and partner attribution before deployment.
8. After deployment, monitor GA4 `affiliate_click` events only for users who consented to Analytics.

## Slot map

- `bank-comparison` — intended for financeAds/CHECK24 Girokonto or approved bank comparison product.
- `insurance-comparison` — intended for financeAds/CHECK24 insurance comparison product.
- `money-transfer` — intended for Wise or another approved transfer partner.

All slots are disabled by default. Missing/disabled slots render nothing and therefore never show a fake or dead commercial CTA.

## Editorial rules

- No “best bank” or “best insurance” ranking based only on commission.
- Any ranking must publish its criteria and explain meaningful limitations.
- Commercial links must be labelled as commercial/affiliate links.
- Product prices, bonuses, interest rates and eligibility conditions must be verified close to publication because they change frequently.
- AdSense/CMP compliance is a separate workstream; affiliate activation does not solve EEA ad-consent requirements.
