# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-05

## Current status

The site has commercial decision pages, affiliate disclosure language, consent-aware commercial click tracking and disabled affiliate slots. No partner link should be activated until the relevant programme is approved and the exact tracking URL is available.

### Application pipeline

| Partner | Platform | Status | Currency / profile | Next action |
| --- | --- | --- | --- | --- |
| CHECK24 | CHECK24 Partnerprogramm | Registered | Private individual | Wait for account/partner access; obtain exact tracking/deeplink or approved widget |
| Wise | Partnerize | Pending review | EUR campaign | Wait for Wise decision; after approval create exact tracking/deeplink |
| N26 | impact.com | In Review | Publisher / individual / editorial content | Wait for N26 decision; after approval obtain exact campaign tracking link |
| financeAds | financeAds | Not applied | Business setup pending | Reassess application when business/Gewerbe setup is available |

Website ownership for the N26/Impact application was verified on 2026-09-05 with the temporary `impact-site-verification` meta tag on the homepage. Keep it in place while the application is under review; remove it later only if Impact/N26 no longer requires it.

## Priority 1 — CHECK24 Affiliate

Application status: registration completed on 2026-09-05 as a private individual. Do not publish ordinary CHECK24 links as affiliate CTAs; wait for the exact attributable partner link or approved integration.

Best first placements:
- `/kfz-versicherung/`
- `/almanyada-elektrik-aboneligi/`
- `/sigorta-secim-rehberi/`

Official page:
- https://www.check24.de/partner/partnerprogramm/

## Priority 2 — Wise Website / SEO Partnership

Application status: Partnerize publisher account created and the Wise EUR payout campaign was requested on 2026-09-05. Current state: pending Wise review. No Wise affiliate URL is active on the site.

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

## Priority 3 — N26 Affiliate

Application status: Impact publisher profile created as `publisher` / `individual` / `editorial content`; `almanyapusulasi.de` ownership verified successfully on 2026-09-05. N26 AG application is currently `In Review`. No N26 affiliate URL is active on the site.

Best placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/almanyada-banka-hesabi/`
- `/finans/`

Do not turn the bank comparison into an N26 advert. Keep comparison criteria independent and present N26 as a clearly disclosed commercial option only where relevant.

Official programme page:
- https://n26.com/de-de/affiliate

## Priority 4 — financeAds

Potential long-term finance/insurance network. Application is intentionally deferred until the site's business/Gewerbe setup is available. Re-check the publisher requirements at application time.

Candidate placements after approval:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/sigorta-secim-rehberi/`
- `/kredi/`

Official pages:
- https://www.financeads.net/affiliates/
- https://www.financeads.net/partnerprogramme/

## Activation procedure

1. Do not activate a programme merely because an account exists; wait until the relevant campaign is approved/active.
2. Obtain the exact publisher tracking URL/deeplink from the partner dashboard.
3. Edit `assets/js/affiliate-slots.js` only:
   - set the matching slot `enabled: true`;
   - set `provider`;
   - paste the exact approved tracking `url`.
4. Keep `rel="sponsored noopener"` on all affiliate links.
5. Never replace an editorial/official-source link with an affiliate link. Commercial CTAs remain additive.
6. Confirm that `/ticari-seffaflik/` and `/privacy/` accurately describe the active commercial relationship and tracking.
7. Test the outbound link and partner attribution before deployment.
8. After deployment, monitor GA4 `affiliate_click` events only for users who consented to Analytics.
9. Record approval date, campaign name and active destination in this file so commercial integrations remain auditable.

## Slot map

- `bank-comparison` — approved Girokonto/comparison/bank partner, with N26 as a possible provider after approval.
- `insurance-comparison` — approved insurance comparison partner.
- `money-transfer` — Wise or another approved transfer partner.
- `electricity-comparison` — approved electricity/tariff partner such as an eligible CHECK24 integration.
- `kfz-insurance` — approved Kfz comparison/insurance partner such as an eligible CHECK24 integration.

All slots are disabled by default. Missing/disabled slots render nothing and therefore never show a fake or dead commercial CTA.

## Application pack

Use `AFFILIATE-APPLICATIONS.md` for ready-to-paste German/English site descriptions, review URLs and programme-specific compliance reminders. `CHECK24_APPLICATION.md` contains the CHECK24-specific integration notes.

## Editorial rules

- No “best bank” or “best insurance” ranking based only on commission.
- Any ranking must publish its criteria and explain meaningful limitations.
- Commercial links must be labelled as commercial/affiliate links.
- Product prices, bonuses, interest rates and eligibility conditions must be verified close to publication because they change frequently.
- AdSense/CMP compliance is a separate workstream; affiliate activation does not solve EEA ad-consent requirements.

## Immediate state

CHECK24, Wise and N26 are now external-review/account-access dependencies. Until one of them becomes active, do not add speculative commercial links or partner claims to public pages. The next implementation event is an approval or usable attributable partner URL.
