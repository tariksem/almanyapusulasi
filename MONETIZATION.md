# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-04

## Current status

The site has commercial decision pages, affiliate disclosure language, consent-aware commercial click tracking and disabled affiliate slots. No partner link should be activated until a publisher account is approved and the exact tracking URL is available.

## Priority 1 — CHECK24 Affiliate

Why first: CHECK24 currently states that both private individuals and businesses can participate. The programme offers comparison calculators and advertising materials in categories already covered by the site, including Kfz insurance, electricity, internet and other tariff products. This makes it the lowest-friction first application for the current project.

Best first placements:
- `/kfz-versicherung/`
- `/almanyada-elektrik-aboneligi/`
- `/sigorta-secim-rehberi/`

Official page:
- https://www.check24.de/partner/partnerprogramm/

## Priority 2 — Wise Website / SEO Partnership

Why: strong fit for the existing Germany–Turkey money transfer intent. Wise currently accepts applications from individuals or businesses with an online presence; website/SEO publishers use Partnerize for tracking after approval.

Best placement:
- `/almanyadan-turkiyeye-para-transferi/`

Important promotion rules:
- affiliate relationship must be disclosed;
- do not use paid search or paid social to drive traffic to Wise without explicit written permission;
- do not bid on Wise brand terms or misspellings;
- do not advertise unsupported services or fake/free-transfer coupons.

Official programme information:
- https://wise.com/de/help/articles/2978038/was-ist-das-wise-affiliate-programm
- https://wise.com/partner/guidelines

## Priority 3 — financeAds

Why: specialist DACH finance/insurance affiliate network with 500+ partner programmes and comparison tools. Relevant categories match the strongest site clusters: Girokonto, Kredit, Versicherung and related financial products.

Current publisher requirements stated by financeAds include:
- ownership of a website/app/social channel with a legally valid Impressum;
- finance-relevant audience/content;
- current, live content;
- proof of registered business (Gewerbe).

Registration is free. Apply once Gewerbe proof is available.

Candidate placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/sigorta-secim-rehberi/`
- `/kredi/`

Official pages:
- https://www.financeads.net/affiliates/
- https://www.financeads.net/partnerprogramme/

## Activation procedure

1. Apply to one programme at a time, starting with CHECK24; Wise is the next logical application. Use financeAds once Gewerbe proof is available.
2. After approval, obtain the exact publisher tracking URL from the partner dashboard.
3. Edit `assets/js/affiliate-slots.js` only:
   - set the matching slot `enabled: true`
   - set `provider`
   - paste the exact approved tracking `url`
4. Keep `rel="sponsored noopener"` on all affiliate links.
5. Never replace an editorial/official-source link with an affiliate link. Commercial CTAs remain additive.
6. Confirm that `/ticari-seffaflik/` and `/privacy/` still accurately describe the active commercial relationship and tracking.
7. Test the outbound link and partner attribution before deployment.
8. After deployment, monitor GA4 `affiliate_click` events only for users who consented to Analytics.

## Slot map

- `bank-comparison` — intended for an approved Girokonto/comparison partner.
- `insurance-comparison` — intended for an approved insurance comparison partner.
- `money-transfer` — intended for Wise or another approved transfer partner.

All slots are disabled by default. Missing/disabled slots render nothing and therefore never show a fake or dead commercial CTA.

## Application pack

Use `AFFILIATE-APPLICATIONS.md` for ready-to-paste German/English site descriptions, review URLs and programme-specific compliance reminders.

## Editorial rules

- No “best bank” or “best insurance” ranking based only on commission.
- Any ranking must publish its criteria and explain meaningful limitations.
- Commercial links must be labelled as commercial/affiliate links.
- Product prices, bonuses, interest rates and eligibility conditions must be verified close to publication because they change frequently.
- AdSense/CMP compliance is a separate workstream; affiliate activation does not solve EEA ad-consent requirements.
