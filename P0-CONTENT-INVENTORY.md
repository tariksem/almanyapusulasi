# P0 Content Inventory — AdSense Recovery

Audit date: 2026-09-11

## Finding

The site has a content portfolio problem, not a lack-of-content problem: strong flagship guides and original tools coexist with many short, narrow answer/salary/comparison pages. File size is only a triage signal, not a quality verdict.

## Immediate C-risk review queue

- `/basiskonto-kim-acabilir/` — ~2.1 KB; merge/expand decision
- `/kaution-en-fazla-ne-kadar/` — ~2.1 KB; likely Kaution/rental section
- `/warmmiete-kaltmiete-farki/` — ~2.1 KB; likely rental/Nebenkosten section
- `/nebenkosten-nachzahlung-normal-mi/` — ~2.5 KB; likely checker interpretation section
- `/almanyada-muhendis-maasi-2026/` — ~2.5 KB; salary methodology or merge
- `/almanyada-yazilimci-maasi-2026/` — ~2.7 KB; salary methodology or merge
- `/almanyada-pflege-maasi-2026/` — ~2.4 KB; salary methodology or merge
- `/turk-hemsire-almanya-denklik/` — ~3.0 KB; overlap with Pflege flagship
- `/almanyada-elektrikci-denklik-gerekli-mi/` — ~3.1 KB; overlap with Elektroniker flagship
- `/schulbegleiter-almanca-b2-gerekli-mi/` — ~3.1 KB; narrow-answer risk
- `/sachbearbeiter-almanca-seviyesi/` — ~2.6 KB; narrow-answer risk
- `/lagerhelfer-vize-almanya/` — ~3.3 KB; YMYL sourcing review
- `/ucretsiz-girokonto-2026/` — ~3.3 KB; volatile commercial-intent risk
- `/kindergeld-hesaplayici-2026/` — ~2.5 KB; tool currently performs trivial multiplication and needs eligibility/action value

## Confirmed hygiene defect

`/haberler/vergi-reformu-2027-kindergeld/` is already `noindex,follow` and points to `/haberler/vergi-kindergeld-2027/`, yet the legacy monolithic sitemap lists it. Root sitemap should become a curated sitemap index.

## Strong assets to protect

`/nebenkosten-abrechnung-kontrolu/`, `/almanya-kontrol-paneli/`, `/banka-secim-araci/`, `/sigorta-secim-araci/`, `/is-teklifi-degerlendirme-araci/`, `/chancenkarte-puan-hesaplayici-2026/`, `/kinderzuschlag/`, SCHUFA core and Blue Card core.

## Highest-priority overlap

Banking currently has `/almanyada-banka-hesabi/`, `/almanyada-banka-hesabi-yeni-gelenler/`, `/almanyada-banka-hesabi-karsilastirma/`, `/girokonto-karsilastirma-2026/`, `/ucretsiz-girokonto-2026/`, `/girokonto-basiskonto-farki/`, `/basiskonto-kim-acabilir/` and `/banka-secim-araci/`. This is the first cannibalization cluster to resolve.

## P0 rule

Do not create a new indexable page merely because a keyword exists. First decide whether it belongs as a section, tool result or update to an existing flagship.
