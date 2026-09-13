# Affiliate attribution status — 2026-09-13

This is the operational P0 status for revenue attribution. It distinguishes **configuration evidence** from **real sale/conversion evidence**. A correct-looking URL is not, by itself, proof that a commission was attributed.

## Current status

| Provider / product | Account | Link configuration | Partner-side exact match | Conversion evidence |
| --- | --- | --- | --- | --- |
| TARIFCHECK / Girokonto | Active, Partner-ID `204420` | Verified against authenticated dashboard catalog dated 2026-09-07 | Verified configuration | No real sale evidence recorded yet |
| TARIFCHECK / Kfz | Active, Partner-ID `204420` | Verified against authenticated dashboard catalog dated 2026-09-07 | Verified configuration | No real sale evidence recorded yet |
| TARIFCHECK / Risikoleben and other catalogued TARIFCHECK slots | Active, Partner-ID `204420` | Deeplink values are constrained to `TARIFCHECK-DIRECTLINKS.md` | Verified configuration | No real sale evidence recorded yet |
| CHECK24 / Strom | Active, Partner-ID `1177200` | URL contains the expected CHECK24 host, Partner-ID and Strom parameters | **Pending authenticated generator exact-match** | No real sale evidence recorded yet |

## Evidence already available

- TARIFCHECK activation email confirms Partner-ID `204420`.
- CHECK24 activation email confirms Partner-ID `1177200`.
- CHECK24 Affiliate Support confirmed on 2026-09-07 where the authenticated generators for Girokonto, Kfz and Strom are located.
- `TARIFCHECK-DIRECTLINKS.md` records directlinks copied from the authenticated TARIFCHECK dashboard on 2026-09-07.
- `assets/js/affiliate-slots.js` centrally adds `rel="sponsored noopener"`, a visible commission disclosure and the `affiliate_click` event marker.
- `assets/js/commercial-tracking.js` records product area, partner/provider and page path when analytics consent allows it.

## What is deliberately not claimed

- We do not claim that CHECK24 Strom attribution is fully verified until the exact logged-in generator output is compared with the configured visitor URL.
- We do not claim a sale/conversion until it appears in the partner reporting dashboard.
- We do not create synthetic affiliate clicks with curl/bots merely to test redirects. That can pollute partner reporting or look like invalid traffic.
- A GA4 `affiliate_click` event proves a site-side click event only; it does not prove partner-side attribution or a commission.

## CI attribution guard

`scripts/validate-affiliate-attribution.js` is the machine guard for this state. It must fail when:

- a live TARIFCHECK slot no longer carries Partner-ID `204420`;
- a live TARIFCHECK deeplink is outside the authenticated directlink catalog;
- the CHECK24 Strom Partner-ID/host/required parameters change without updating the evidence record;
- a disabled slot retains a live provider/Partner-ID/URL;
- the renderer loses `rel="sponsored noopener"`, the visible commercial disclosure, or `affiliate_click` marker;
- commercial tracking stops carrying product area or provider information.

CHECK24 Strom's missing authenticated exact-match is intentionally a **warning**, not a build failure, because missing evidence is not proof that the current link is wrong. It must remain visibly pending until verified.

## Required authenticated CHECK24 Strom check

1. Log in to the CHECK24 partner dashboard for Partner-ID `1177200`.
2. Open the Strom deeplink generator confirmed by Affiliate Support: `https://www.check24-partnerprogramm.de/werbemittel/strom/deeplink/`.
3. Copy the generated **visitor** URL exactly. Do not copy the generator/dashboard URL.
4. Compare it byte-for-byte with the configured URL in `assets/js/affiliate-slots.js`.
5. If it matches, change `externalExactMatchStatus` in `data/affiliate-attribution-status.json` from `pending` to `verified` and record the verification date.
6. If it differs, replace only the Strom URL with the exact generated visitor URL, then update the evidence record and run CI.
7. Do not infer a replacement from Partner-ID or from another CHECK24 product.

## Conversion reconciliation after real traffic

Partner programs publicly state that their logged-in reporting includes clicks, leads/sales and commissions, and that tracking IDs/campaign reporting are available. Until product-specific tracking-ID syntax is confirmed for our directlinks, do not append guessed tracking parameters.

For the first real traffic sample:

1. Record site-side `affiliate_click` counts by date and `commercial_area` when GA4 access is available.
2. Compare the same date/product window with CHECK24/TARIFCHECK dashboard clicks.
3. Investigate material gaps before increasing traffic to that placement.
4. Record the first genuine lead/sale and commission as the first partner-side conversion proof.
5. Only then classify the corresponding funnel as `conversion_verified`.

## Current P0 blocker

The only unresolved configuration-level attribution item is **CHECK24 Strom exact visitor URL verification inside the authenticated partner dashboard**. TARIFCHECK revenue-critical directlinks are configuration-verified; partner-side sale evidence still depends on genuine user conversions.
