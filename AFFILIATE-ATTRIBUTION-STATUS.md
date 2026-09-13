# Affiliate attribution status — 2026-09-13

This is the operational P0 status for revenue attribution. It distinguishes **configuration evidence** from **real sale/conversion evidence**. A correct affiliate configuration is not, by itself, proof that a commission was paid.

## Current status

| Provider / product | Account | Link configuration | Partner-side exact match | Conversion evidence |
| --- | --- | --- | --- | --- |
| TARIFCHECK / Girokonto | Active, Partner-ID `204420` | Verified against authenticated dashboard catalog dated 2026-09-07 | Verified configuration | No real sale evidence recorded yet |
| TARIFCHECK / Kfz | Active, Partner-ID `204420` | Verified against authenticated dashboard catalog dated 2026-09-07 | Verified configuration | No real sale evidence recorded yet |
| TARIFCHECK / Risikoleben and other catalogued TARIFCHECK slots | Active, Partner-ID `204420` | Deeplink values are constrained to `TARIFCHECK-DIRECTLINKS.md` | Verified configuration | No real sale evidence recorded yet |
| CHECK24 / Strom | Active, Partner-ID `1177200` | Configured production URL matches the authenticated Strom generator output exactly | **Verified 2026-09-13** | No real sale evidence recorded yet |

## Evidence available

- TARIFCHECK activation email confirms Partner-ID `204420`.
- CHECK24 activation email confirms Partner-ID `1177200`.
- CHECK24 Affiliate Support confirmed on 2026-09-07 where the authenticated generators for Girokonto, Kfz and Strom are located.
- `TARIFCHECK-DIRECTLINKS.md` records directlinks copied from the authenticated TARIFCHECK dashboard on 2026-09-07.
- On 2026-09-13 the logged-in CHECK24 Strom generator produced the same visitor URL as the production `electricity-comparison` slot, with an exact manual comparison.
- `assets/js/affiliate-slots.js` centrally adds `rel="sponsored noopener"`, a visible commission disclosure and the `affiliate_click` event marker.
- `assets/js/commercial-tracking.js` records product area, partner/provider and page path when analytics consent allows it.

## What is deliberately not claimed

- We do not claim a sale/conversion until it appears in the partner reporting dashboard.
- We do not create synthetic affiliate clicks with curl/bots merely to test redirects. That can pollute partner reporting or look like invalid traffic.
- A GA4 `affiliate_click` event proves a site-side click event only; it does not prove partner-side attribution or a commission.
- Configuration verification should be repeated if the partner generator or production URL changes.

## CI attribution guard

`scripts/validate-affiliate-attribution.js` is the machine guard for this state. It must fail when:

- a live TARIFCHECK slot no longer carries Partner-ID `204420`;
- a live TARIFCHECK deeplink is outside the authenticated directlink catalog;
- the CHECK24 Strom Partner-ID/host/required parameters or exact configured URL change without updating the evidence record;
- a disabled slot retains a live provider/Partner-ID/URL;
- the renderer loses `rel="sponsored noopener"`, the visible commercial disclosure, or `affiliate_click` marker;
- commercial tracking stops carrying product area or provider information.

CHECK24 Strom is now configuration-verified. A future evidence regression from `verified` must be treated as a build error rather than silently downgraded to a warning.

## Conversion reconciliation after real traffic

For the first genuine traffic sample:

1. Record site-side `affiliate_click` counts by date and `commercial_area` when GA4 access is available.
2. Compare the same date/product window with CHECK24/TARIFCHECK dashboard clicks.
3. Investigate material gaps before increasing traffic to that placement.
4. Record the first genuine lead/sale and commission as the first partner-side conversion proof.
5. Only then classify the corresponding funnel as `conversion_verified`.

## Current P0 status

There is now **no unresolved configuration-level attribution blocker** for the revenue-critical TARIFCHECK and CHECK24 Strom links currently in use. The next proof point is operational: genuine traffic must produce corresponding partner-dashboard clicks and, eventually, leads/sales/commissions.
