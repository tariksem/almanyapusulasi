# Almanya Pusulası — Monetization Plan

Last reviewed: 2026-09-06

## Current status

Commercial decision pages, disclosure language, consent-aware click tracking and disabled affiliate slots are implemented. No partner link is activated until its campaign is approved and the exact attributable URL is available.

The static site deploys automatically from `main` through GitHub Pages. The global navigation surfaces `/araclar/`, the homepage surfaces high-intent tools, and GA4 tracks consent-aware tool and commercial engagement.

| Partner | Platform | Current state | Next implementation trigger |
| --- | --- | --- | --- |
| TARIFCHECK | TARIFCHECK Partnerprogramm | Registration completed successfully on 2026-09-05; account review / activation preparation in progress; Partner-ID not received yet | Partner-ID plus exact product tracking/deeplink or approved widget |
| CHECK24 | CHECK24 Partnerprogramm | Registration not confirmed complete. Gmail still contains “Jetzt Registrierung abschließen” messages | Complete registration only if we decide to add CHECK24 as a separate partner; then wait for approval and exact attributable destination |
| Wise | Partnerize | Account created; email verification still required before normal platform use; EUR campaign approval not confirmed | Verify Partnerize email, then confirm Wise campaign approval and exact tracking/deeplink |
| N26 | impact.com | Application received / under review; site verification completed | N26 approval plus exact Impact tracking link |
| financeAds | financeAds | Not applied | Reassess after business/Gewerbe setup |
| Google AdSense | Google | Publisher ID and `ads.txt` present; ad script intentionally not active | Publish a Google-certified TCF CMP / European regulations message, then activate AdSense code and Auto Ads |

TARIFCHECK's post-registration confirmation states that the submitted data are being reviewed and account activation is being prepared; the Partner-ID email is expected within up to 72 hours. Do not treat registration completion as partner approval and do not enable TARIFCHECK links until the Partner-ID / attributable product destination is received and verified.

The registration confirmation currently surfaces product categories that match our commercial clusters, including Girokonto, Kfz-Versicherung and Private Krankenversicherung. Commission values shown in the partner UI are not to be hard-coded into public editorial content because partner rates can change.

CHECK24 is a separate program and must not be conflated with TARIFCHECK. Current Gmail evidence only confirms “complete registration” reminders; no CHECK24 approval or Partner-ID is recorded.

Partnerize sent a verification email on 2026-09-05 stating that email verification is required before normal platform use. Wise must therefore remain disabled until that account step is completed and campaign approval plus the exact attributable destination are confirmed.

The N26/Impact website verification meta tag is intentionally retained on the homepage while the application is under review.

## Tracking state

Consent-aware GA4 tracking is active only when `ap_cookie_consent=accepted`.

Tracked events:
- `tool_open` — entry to `/araclar/` or a calculator/checker page;
- `tool_calculate` — interaction with calculator/checker buttons;
- `outbound_click` — outbound links;
- `comparison_to_tool` — internal click from a comparison/commercial page to a calculator, checker or decision tool;
- commercial `data-track` events via `assets/js/commercial-tracking.js`;
- `affiliate_click` — once an affiliate slot is enabled, including `commercial_area`, `commercial_target`, `partner`, `link_url`, and `page_path`;
- `dashboard_decision_complete` — first completion of a synchronized decision;
- `dashboard_tool_result_saved` — a decision-tool result was saved/refreshed in the local dashboard state.

`commercial-tracking.js` is the single source for affiliate click events to avoid duplicate conversions. It also auto-detects internal decision destinations (`-secim-araci`, `-hesaplayici`, `-uygunluk-kontrolu`, `-kontrolu`, `/araclar/`) and emits `comparison_to_tool` without requiring per-link markup.

## Planned placements

TARIFCHECK:
- Girokonto → `/girokonto-karsilastirma-2026/`, `/almanyada-banka-hesabi-karsilastirma/`, relevant bank decision pages
- Kfz-Versicherung → `/kfz-versicherung/`, `/kfz-versicherung-karsilastirma-2026/`, relevant car-cost pages
- Private Krankenversicherung → only health-insurance pages where PKV is contextually appropriate; never present PKV as universally preferable

CHECK24 (only if separately completed and approved later):
- keep as a distinct partner configuration; do not reuse TARIFCHECK attribution or status

Wise:
- `/almanyadan-turkiyeye-para-transferi/` → `money-transfer`

N26:
- `/almanyada-banka-hesabi-karsilastirma/`
- `/almanyada-banka-hesabi/`
- `/finans/`

For single-provider destinations, do not render wording that implies a neutral comparison service. Use a dedicated provider-offer slot when necessary.

## Affiliate activation procedure

1. Confirm the campaign is approved/active.
2. Copy the exact tracking/deeplink from the partner dashboard.
3. Update only the relevant configuration in `assets/js/affiliate-slots.js` or `assets/js/commercial-offers.js`.
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

TARIFCHECK:
- use only exact approved attributable product destinations after Partner-ID activation;
- keep Girokonto, Kfz and PKV placements context-specific;
- do not publish partner UI commission figures as durable editorial claims;
- do not rank a TARIFCHECK product first merely because it pays commission.

Wise:
- disclose the affiliate relationship;
- no paid search or paid social traffic to Wise without explicit written permission;
- no Wise brand-term/misspelling bidding;
- no unsupported services or fake/free-transfer coupon claims.

N26:
- do not make N26 the top-ranked bank merely because commission is available;
- preserve criteria-based comparison and editorial independence.

CHECK24:
- treat as a separate uncompleted/undocumented application until separately verified;
- never reuse TARIFCHECK tracking or Partner-ID data.

## Editorial rules

- No “best bank”, “best insurance”, “cheapest” or similar ranking based only on commission.
- Rankings require explicit, current criteria and meaningful limitations.
- Commercial relationships must be clearly identifiable.
- Prices, bonuses, rates and eligibility conditions require fresh verification.
- Affiliate activation is separate from AdSense/CMP compliance.

## Immediate state

TARIFCHECK registration is completed and awaiting account activation / Partner-ID. CHECK24 registration is not confirmed complete and is tracked separately. Partnerize requires email verification before Wise can progress normally. N26 remains under review.

The site itself is structurally ready for affiliate activation: approved campaign + exact attributable URL is sufficient to enable the matching slot.

AdSense is blocked by one account-side step: publish the European regulations message / certified CMP. After that, the AdSense loader and Auto Ads can be activated safely.
