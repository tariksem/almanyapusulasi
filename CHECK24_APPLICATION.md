# CHECK24 Affiliate Application Pack

Last reviewed: 2026-09-05

## Status

CHECK24 is a separate affiliate programme from TARIFCHECK.

Current verified state:
- Gmail still contains CHECK24 messages with the subject `Jetzt Registrierung abschließen`;
- CHECK24 registration completion is therefore **not confirmed**;
- no CHECK24 approval, Partner-ID, tracking URL or approved widget is recorded;
- the successful registration / 72-hour Partner-ID screen belongs to **TARIFCHECK**, not CHECK24.

Do not enable any CHECK24 commercial CTA until the CHECK24 registration is deliberately completed, approved and an exact attributable destination is available.

## Why CHECK24 may still be useful later

Its comparison model could fit the site's finance, insurance, energy and mobility content if the programme is separately completed and approved.

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

## Site description — German

> Almanya Pusulası ist ein türkischsprachiges Informations- und Ratgeberportal für Menschen, die in Deutschland leben oder nach Deutschland ziehen möchten. Die Inhalte behandeln unter anderem Finanzen, Versicherungen, Mobilität, Strom, Bankkonten, SCHUFA, Wohnen, Arbeit, Familie, Steuern und Aufenthaltsfragen. Unser Schwerpunkt liegt auf verständlichen, praxisnahen Ratgebern mit offiziellen Quellen und klaren Entscheidungskriterien. Vergleichs- und Affiliate-Angebote werden transparent gekennzeichnet und redaktionelle Inhalte bleiben von der Vergütung getrennt.

## Short description — German

> Türkischsprachiges Deutschland-Ratgeberportal mit Fokus auf Finanzen, Versicherungen, Mobilität, Wohnen und praktische Alltagsentscheidungen.

## Candidate CHECK24 placements after separate approval

### Bank / account products
- https://almanyapusulasi.de/almanyada-banka-hesabi-karsilastirma/
- https://almanyapusulasi.de/girokonto-karsilastirma-2026/
- https://almanyapusulasi.de/finans/

Potential slot: `bank-comparison`, only if the destination is actually a bank/comparison experience.

### Electricity / energy
- https://almanyapusulasi.de/almanyada-elektrik-aboneligi/
- https://almanyapusulasi.de/stromtarif-karsilastirma-2026/

Potential slot: `electricity-comparison`.

### Kfz insurance
- https://almanyapusulasi.de/kfz-versicherung/
- https://almanyapusulasi.de/kfz-versicherung-karsilastirma-2026/

Potential slot: `kfz-insurance`.

### Insurance comparison
- https://almanyapusulasi.de/sigorta-secim-rehberi/

Potential slot: `insurance-comparison`.

## Integration rules

- Never publish a CHECK24 tracking link before the relevant account/campaign access is available.
- Never reuse TARIFCHECK Partner-ID or tracking links for CHECK24.
- Use only the exact tracking/deeplink supplied in the CHECK24 partner account.
- Commercial CTAs must be visibly identified as commercial/affiliate.
- Affiliate links use `rel="sponsored noopener"`.
- Keep independent and official source links visible.
- Do not claim CHECK24 is the “best” comparison service.
- Do not hard-code commission values or temporary customer bonuses into evergreen editorial text.
- Measure `affiliate_click` only when the visitor has accepted Analytics.
- Do not store personal registration data, bank details, tax data or passwords in repository documentation.

## If CHECK24 is completed later

1. Finish the separate CHECK24 registration.
2. Confirm account/campaign approval.
3. Obtain the exact attributable tracking/deeplink or approved widget.
4. Identify the exact product/campaign represented by the destination.
5. Enable only the matching slot in `assets/js/affiliate-slots.js` or `assets/js/commercial-offers.js`.
6. Test destination, attribution, disclosure and consent-aware analytics before production deployment.
