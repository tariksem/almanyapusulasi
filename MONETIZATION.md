# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-05

## Current status

Commercial decision pages, disclosure language, consent-aware click tracking and disabled affiliate slots are implemented. No partner link is activated until its campaign is approved and the exact attributable URL is available.

The static site now deploys automatically from `main` through GitHub Pages. The global navigation surfaces `/araclar/`, the homepage surfaces high-intent tools, and GA4 tracks consent-aware tool and commercial engagement.

| Partner | Platform | Current state | Next implementation trigger |
| --- | --- | --- | --- |
| CHECK24 | CHECK24 Partnerprogramm | Registration completed 2026-09-05; account review / activation preparation in progress; Partner-ID not received yet | Partner-ID plus exact tracking/deeplink or approved widget |
| Wise | Partnerize | Account created; email verification still required before normal platform use; EUR campaign approval not confirmed | Verify Partnerize email, then confirm Wise campaign approval and exact tracking/deeplink |
| N26 | impact.com | N26 AG application In Review; site verified | N26 approval plus exact Impact tracking link |
| financeAds | financeAds | Not applied | Reassess after business/Gewerbe setup |
| Google AdSense | Google | Publisher ID and `ads.txt` present; ad script intentionally not active | Publish a Google-certified TCF CMP / European regulations message, then activate AdSense code and Auto Ads |

CHECK24's post-registration confirmation states that the submitted data are being reviewed and account activation is being prepared; the Partner-ID email is expected within up to 72 hours. Do not treat registration completion as partner approval and do not enable CHECK24 links until the Partner-ID / attributable destination is received and verified.

Partnerize sent a verification email on 2026-09-05 stating that email verification is required before normal platform use. Wise must therefore remain disabled until that account step is completed and campaign approval plus the exact attributable destination are confirmed.

The N26/Impact website verification meta tag is intentionally retained on the homepage while the application is under review.

## Tracking state

Consent-aware GA4 tracking is active only when `ap_cookie_consent=accepted`.

Tracked events:
- `tool_open` — entry to `/araclar/` or a calculator/checker page;
- `tool_calculate` — interaction with calculator/checker buttons;
- `outbound_click` — outbound links;
- commercial `data-track` events via `assets/js/commercial-tracking.js`;
- `affiliate_click` — once an affiliate slot is enabled, including `commercial_area`, `commercial_target`, `partner`, `link_url`, and `page_path`;
- `dashboard_decision_complete` — first completion of a synchronized decision;
- `dashboard_tool_result_saved` — a decision-tool result was saved/refreshed in the local dashboard state.

`commercial-tracking.js` is the single source for affiliate click events to avoid duplicate conversions.

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

## Affiliate activation procedure

1. Confirm the campaign is approved/active.
2. Copy the exact tracking/deeplink from the partner dashboard.
3. Update only the relevant configuration in `assets/js/affiliate-slots.js` (or add a dedicated slot if the existing slot semantics do not match).
4. Set `enabled: true`, the exact `provider`, and exact attributable `url` only for that approved campaign.
5. Keep all unrelated slots disabled.
6. Render commercial links with `rel="sponsored noopener"` and a visible affiliate/commercial disclosure.
7. Keep editorial and official-source links independent from the commercial CTA.
8. Verify `/ticari-seffaflik/` and `/privacy/` remain accurate.
9. Test outbound destination and partner attribution before production deployment.
10. Verify a single GA4 `affiliate_click` is emitted after analytics consent.
11. Record the approval date, campaign and active destination here.

## AdSense activation gate

Do not add the AdSense JavaScript merely because the publisher meta tag and `ads.txt` exist.

For EEA/UK/Switzerland traffic, use a Google-certified CMP integrated with IAB TCF. The shortest route for this site is Google Privacy & messaging / European regulations.

Activation sequence:
1. In AdSense, open **Privacy & messaging**.
2. Create/publish an **European regulations** message for `almanyapusulasi.de` using the Google CMP.
3. Set the privacy policy URL to `https://almanyapusulasi.de/privacy/`.
4. Choose the user-choice configuration appropriate for the site and publish the message.
5. Confirm the message works using Google's documented test parameter (`?fc=alwaysshow&fctype=gdpr`).
6. Only after the CMP is published, add the AdSense site code / Auto Ads loader using publisher ID `ca-pub-6014752203462020`.
7. Re-check consent revocation / privacy settings behavior and update `/privacy/` if necessary.
8. Verify Auto Ads and policy status in AdSense before increasing placements.

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

CHECK24 registration is completed and is now awaiting account activation / Partner-ID. Partnerize requires email verification before Wise can progress normally. N26 remains in review.

The site itself is ready for affiliate activation without structural changes: approved campaign + exact attributable URL is sufficient to enable the matching slot.

AdSense is blocked by one account-side step: publish the European regulations message / certified CMP. After that, the AdSense loader and Auto Ads can be activated safely.
