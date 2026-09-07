# Affiliate link activation runbook

Verified: 2026-09-07

This file documents the remaining authenticated partner-side step required before the first live affiliate CTAs can be enabled.

## Verified accounts

- TARIFCHECK Partner-ID: `204420`
- CHECK24 Partner-ID: `1177200`

## Verified deeplink generators

CHECK24 Affiliate Support confirmed these exact partner-dashboard sections on 2026-09-07:

- Girokonto (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/finanzen/girokonto/deeplinks/`
- Kfz-Versicherung (TARIFCHECK): `https://www.tarifcheck-partnerprogramm.de/werbemittel/kfz-versicherung/autoversicherung/deeplinks/`
- Strom (CHECK24): `https://www.check24-partnerprogramm.de/werbemittel/strom/deeplink/`

These are dashboard/generator URLs, not visitor destinations. Do not publish them as affiliate CTAs.

## Production activation map

After copying the exact generated attributable HTTPS URL from the authenticated partner dashboard, edit `assets/js/affiliate-slots.js`:

| Product | Slot key | Provider | Partner-ID | Required change |
| --- | --- | --- | --- | --- |
| Girokonto | `bank-comparison` | TARIFCHECK | `204420` | set `url` to generated deeplink and `enabled: true` |
| Kfz | `kfz-insurance` | TARIFCHECK | `204420` | set `url` to generated deeplink and `enabled: true` |
| Strom | `electricity-comparison` | CHECK24 | `1177200` | set `url` to generated deeplink and `enabled: true` |

Never construct or infer an affiliate URL from a Partner-ID.

## First placements already present

- Girokonto: `/girokonto-karsilastirma-2026/`
- Kfz: `/kfz-versicherung-karsilastirma-2026/`
- Strom: `/stromtarif-karsilastirma-2026/`

All three pages already contain their corresponding `data-affiliate-slot` element and load `assets/js/affiliate-slots.js`.

## Release verification

Before merging a live link:

1. Open the generated URL directly and confirm the intended product destination.
2. Confirm the partner dashboard recognizes the link as belonging to the correct account/Partner-ID.
3. Set only the matching slot to `enabled: true`.
4. Keep `rel="sponsored noopener"` and the visible commercial disclosure.
5. Test desktop and mobile.
6. Verify one `affiliate_click` analytics event per click.
7. Deploy and smoke-test the live page.

Priority: Kfz and Girokonto first, then Strom.
