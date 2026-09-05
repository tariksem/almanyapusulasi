# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-05

## Current status

Commercial decision pages, disclosure language, consent-aware click tracking and disabled affiliate slots are implemented. No partner link is activated until its campaign is approved and the exact attributable URL is available.

| Partner | Platform | Current state | Next implementation trigger |
| --- | --- | --- | --- |
| CHECK24 | CHECK24 Partnerprogramm | Registered as private individual | Partner access plus exact tracking/deeplink or approved widget |
| Wise | Partnerize | EUR campaign pending review | Wise approval plus exact tracking/deeplink |
| N26 | impact.com | N26 AG application In Review; site verified | N26 approval plus exact Impact tracking link |
| financeAds | financeAds | Not applied | Reassess after business/Gewerbe setup |

The N26/Impact website verification meta tag is intentionally retained on the homepage while the application is under review.

## Planned placements

CHECK24:
- `/kfz-versicherung/` → `kfz-insurance`
- `/almanyada-elektrik-aboneligi/` → `electricity-comparison`
- `/sigorta-secim-rehberi/` → `insurance-comparison`

Wise:
- `/almanyadan-turkiyeye-para-transferi/` → `money-transfer`

N26:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/almanyada-banka-hesabi/`
- `/finans/`

For N26, use `bank-comparison` only if the rendered wording accurately represents the destination. Otherwise create a dedicated bank-offer slot rather than presenting a single bank as a comparison service.

## Activation procedure

1. Confirm the campaign is approved/active.
2. Copy the exact tracking/deeplink from the partner dashboard.
3. Update only the relevant configuration in `assets/js/affiliate-slots.js` (or add a dedicated slot if the existing slot semantics do not match).
4. Keep all unrelated slots disabled.
5. Render commercial links with `rel="sponsored noopener"` and a visible affiliate/commercial disclosure.
6. Keep editorial and official-source links independent from the commercial CTA.
7. Verify `/ticari-seffaflik/` and `/privacy/` remain accurate.
8. Test outbound destination and partner attribution before production deployment.
9. GA4 `affiliate_click` remains consent-aware.
10. Record the approval date, campaign and active destination here.

## Partner-specific restrictions

Wise:
- disclose the affiliate relationship;
- no paid search or paid social traffic to Wise without explicit written permission;
- no Wise brand-term/misspelling bidding;
- no unsupported services or fake/free-transfer coupon claims.

N26:
- do not make N26 the top-ranked bank merely because commission is available;
- preserve criteria-based comparison and editorial independence.

CHECK24:
- do not publish a normal non-attributable CHECK24 link as if it were an affiliate CTA;
- use only the exact approved product/campaign destination;
- do not hard-code temporary commissions, bonuses or unverifiable superiority claims.

## Editorial rules

- No “best bank”, “best insurance”, “cheapest” or similar ranking based only on commission.
- Rankings require explicit, current criteria and meaningful limitations.
- Commercial relationships must be clearly identifiable.
- Prices, bonuses, rates and eligibility conditions require fresh verification.
- Affiliate activation is separate from AdSense/CMP compliance.

## Immediate state

CHECK24, Wise and N26 are external-review/account-access dependencies. Until one becomes active, no speculative partner links or public approval claims should be added. The next monetization implementation event is an approval or usable attributable partner URL.
