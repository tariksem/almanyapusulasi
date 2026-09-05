# CHECK24 Affiliate Application Pack

Last reviewed: 2026-09-05

## Status

Registration completed on 2026-09-05 as a private individual (`Nein, Privatperson`) for `https://almanyapusulasi.de`. The site was submitted as `Blogs & Content` with a contextual editorial promotion description. Bank/payment details were supplied directly in the CHECK24 form and must not be stored in this repository.

Current next step: wait for partner account activation/access and obtain the exact attributable tracking/deeplink or approved widget/code before publishing any CHECK24 commercial CTA.

## Why CHECK24 first

CHECK24 accepts private-individual registrations and its comparison model fits the site's existing finance, insurance, energy and mobility content.

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

## Planned CHECK24 placements after approval

### 1. Bank / account products
Primary editorial page:
- https://almanyapusulasi.de/almanyada-banka-hesabi-karsilastirma/

Secondary:
- https://almanyapusulasi.de/almanyada-banka-hesabi/
- https://almanyapusulasi.de/finans/

Potential slot:
- `bank-comparison`

Only use this slot if the approved CHECK24 destination actually represents the advertised bank/comparison experience.

### 2. Electricity / energy
Primary editorial page:
- https://almanyapusulasi.de/almanyada-elektrik-aboneligi/

Slot:
- `electricity-comparison`

### 3. Kfz insurance
Primary editorial page:
- https://almanyapusulasi.de/kfz-versicherung/

Secondary:
- https://almanyapusulasi.de/mobilite-arac/

Slot:
- `kfz-insurance`

### 4. Insurance comparison
Primary editorial page:
- https://almanyapusulasi.de/sigorta-secim-rehberi/

Slot:
- `insurance-comparison`

## Integration rules

- Never publish a CHECK24/Tarifcheck tracking link before the relevant account/campaign access is available.
- Use only the exact tracking/deeplink supplied in the partner account.
- Commercial CTAs must say that the link is commercial/affiliate.
- Every affiliate link uses `rel="sponsored noopener"`.
- Keep independent and official source links visible.
- Do not claim CHECK24 is the “best” comparison service.
- Do not hard-code commission values or temporary customer bonuses into evergreen editorial text.
- Measure `affiliate_click` only when the visitor has accepted Analytics.
- Do not store personal registration data, bank details, tax data or passwords in repository documentation.

## After account access / approval

1. Copy the exact approved tracking/deeplink from CHECK24.
2. Identify which CHECK24 product/campaign that link represents.
3. Edit `assets/js/affiliate-slots.js`.
4. Enable only the slot whose visible copy matches that destination.
5. Set `provider: "CHECK24"` or the exact programme/brand name required by the account.
6. Set the exact tracking URL.
7. If CHECK24 supplies HTML/widget code rather than a deeplink, review privacy/CMP requirements before embedding third-party scripts or iframes.
8. Test the outbound URL and attribution.
9. Deploy to `main` and fast-forward `cloudflare/workers-autoconfig` to the same commit.
