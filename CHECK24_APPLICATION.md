# CHECK24 Affiliate Application Pack

Last reviewed: 2026-09-04

## Why CHECK24 first

CHECK24 states that both private individuals and businesses can join its affiliate programme. Registration is free. The programme currently promotes products and tools including C24 Bank, electricity/gas, DSL, car rental, Kfz insurance and other comparison products.

Official pages:
- https://www.check24.de/partner/partnerprogramm/
- https://www.check24-partnerprogramm.de/register/

## Website

- URL: https://almanyapusulasi.de/
- Language: Turkish
- Market: Germany
- Audience: Turkish-speaking people living in Germany or planning to move to Germany
- Contact: info@almanyapusulasi.de
- Commercial policy: https://almanyapusulasi.de/ticari-seffaflik/
- Cooperation page: https://almanyapusulasi.de/isbirligi/
- Impressum: https://almanyapusulasi.de/impressum/
- Privacy: https://almanyapusulasi.de/privacy/

## Copy-paste site description — German

Almanya Pusulası ist ein türkischsprachiges Informations- und Ratgeberportal für Menschen, die in Deutschland leben oder nach Deutschland ziehen möchten. Die Inhalte behandeln unter anderem Finanzen, Versicherungen, Mobilität, Strom, Bankkonten, SCHUFA, Wohnen, Arbeit, Familie, Steuern und Aufenthaltsfragen. Unser Schwerpunkt liegt auf verständlichen, praxisnahen Ratgebern mit offiziellen Quellen und klaren Entscheidungskriterien. Vergleichs- und Affiliate-Angebote werden transparent gekennzeichnet und redaktionelle Inhalte bleiben von der Vergütung getrennt.

## Short description — German

Türkischsprachiges Deutschland-Ratgeberportal mit Fokus auf Finanzen, Versicherungen, Mobilität, Wohnen und praktische Alltagsentscheidungen.

## Planned CHECK24 placements after approval

### 1. Bank / C24 / account products
Primary editorial page:
- https://almanyapusulasi.de/almanyada-banka-hesabi-karsilastirma/

Secondary:
- https://almanyapusulasi.de/almanyada-banka-hesabi/
- https://almanyapusulasi.de/finans/

Use slot:
- `bank-comparison`

### 2. Electricity / energy
Primary editorial page:
- https://almanyapusulasi.de/almanyada-elektrik-aboneligi/

Use slot to add after approval:
- `electricity-comparison`

### 3. Kfz insurance
Primary editorial page:
- https://almanyapusulasi.de/kfz-versicherung/

Secondary:
- https://almanyapusulasi.de/mobilite-arac/

Use slot to add after approval:
- `kfz-insurance`

### 4. Insurance comparison
Primary editorial page:
- https://almanyapusulasi.de/sigorta-secim-rehberi/

Use slot:
- `insurance-comparison`

## Integration rules

- Never publish a CHECK24 or Tarifcheck tracking link before account approval.
- Use only the exact tracking/deeplink supplied in the partner account.
- Commercial CTAs must say that the link is commercial/affiliate.
- Every affiliate link uses `rel="sponsored noopener"`.
- Keep independent and official source links visible.
- Do not claim CHECK24 is the “best” comparison service.
- Do not hard-code commission values or temporary customer bonuses into evergreen editorial text.
- Measure `affiliate_click` only when the visitor has accepted Analytics.

## After approval

1. Copy the exact approved tracking/deeplink from CHECK24.
2. Edit `assets/js/affiliate-slots.js`.
3. Set the relevant slot to `enabled: true`.
4. Set `provider: "CHECK24"` or the exact programme/brand name required by the account.
5. Set the exact tracking URL.
6. If CHECK24 supplies HTML/widget code rather than a deeplink, review privacy/CMP requirements before embedding third-party scripts or iframes.
7. Test the outbound URL and attribution.
8. Deploy to `main` and fast-forward `cloudflare/workers-autoconfig` to the same commit.

## Current blocker

The remaining step is account registration and acceptance by CHECK24. This requires personal/account information and acceptance of the partner programme terms, so it should be completed by the site owner. No tracking URL is currently stored in the repository.
