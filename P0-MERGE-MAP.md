# P0 Merge / Cannibalization Map

Date: 2026-09-12

## Completed consolidations

| URL | Decision | Destination / role |
| --- | --- | --- |
| `/almanyada-banka-hesabi-yeni-gelenler/` | MERGED | `/almanyada-banka-hesabi/` |
| `/girokonto-karsilastirma-2026/` | MERGED | `/almanyada-banka-hesabi-karsilastirma/` |
| `/ucretsiz-girokonto-2026/` | MERGED | `/almanyada-banka-hesabi-karsilastirma/` |
| `/basiskonto-kim-acabilir/` | MERGED | `/girokonto-basiskonto-farki/` |
| `/warmmiete-kaltmiete-farki/` | MERGED | `/almanyada-ev-kiralama-rehberi/` |
| `/kaution-en-fazla-ne-kadar/` | MERGED | `/kaution-depozito-geri-alma/` |
| `/nebenkosten-nachzahlung-normal-mi/` | MERGED | `/nebenkosten-yan-giderler-hesabi/` |
| `/almanyada-yazilimci-maasi-2026/` | MERGED | `/almanyada-yazilimci-it-kariyeri/` |
| `/almanyada-muhendis-maasi-2026/` | MERGED | `/almanyada-muhendis-kariyeri/` |
| `/almanyada-pflege-maasi-2026/` | MERGED | `/almanyada-pflegefachkraft-hemsire-kariyeri/` |
| `/turk-hemsire-almanya-denklik/` | MERGED | `/almanyada-pflegefachkraft-hemsire-kariyeri/` |
| `/almanyada-elektrikci-denklik-gerekli-mi/` | MERGED | `/almanyada-elektroniker-elektrikci-kariyeri/` |
| `/schulbegleiter-almanca-b2-gerekli-mi/` | MERGED | `/almanyada-ogretmen-schulbegleitung-kariyeri/` |
| `/sachbearbeiter-almanca-seviyesi/` | MERGED | `/almanyada-satis-office-kariyeri/` |
| `/lagerhelfer-vize-almanya/` | MERGED | `/almanyada-lojistik-depo-kariyeri/` |
| `/almanyada-doktor-denklik-suresi/` | MERGED | `/almanyada-doktor-hekim-kariyeri/`; unique timeline material moved first |
| `/erzieher-denklik-nrw-2026/` | MERGED | `/almanyada-erzieher-pedagoji-kariyeri/`; NRW B2/recognition material moved first |
| `/kindergeld-adres-degisikligi/` | MERGED | `/kindergeld-basvuru/`; change-notification material moved into process guide |
| `/kindergeld-2026/` | MERGED | `/kindergeld/` |
| `/blue-card-nedir/` | MERGED | `/blue-card/`; definition, §18g eligibility, IT route, validity and job-change material consolidated into flagship |
| `/schufa-nedir/` | MERGED | `/schufa/`; definition and score interpretation consolidated into flagship |
| `/schufa-ve-ev-kredisi/` | MERGED | `/almanyada-ev-kredisi/`; mortgage-specific material maintained in financing flagship |
| `/haberler/vergi-reformu-2027-kindergeld/` | NOINDEX/REDIRECT | `/haberler/vergi-kindergeld-2027/` |

## Keep / differentiate / tools

| URL | Decision | Destination / role |
| --- | --- | --- |
| `/almanyada-banka-hesabi/` | KEEP | bank-account flagship |
| `/almanyada-banka-hesabi-karsilastirma/` | KEEP+DIFFERENTIATE | criteria-based comparison |
| `/girokonto-basiskonto-farki/` | KEEP+DIFFERENTIATE | statutory/product distinction |
| `/banka-secim-araci/` | TOOL | bank decision utility |
| `/nebenkosten-abrechnung-kontrolu/` | TOOL/KEEP | flagship tool + guide |
| `/lkw-fahrer-turk-ehliyeti-almanya/` | KEEP | distinct Turkey licence conversion intent |
| `/kindergeld/` | FLAGSHIP | Kindergeld decision hub; rebuilt 2026-09-12 |
| `/kindergeld-basvuru/` | KEEP+DIFFERENTIATE | application + change-notification process |
| `/kindergeld-hesaplayici-2026/` | TOOL+REBUILD | Kindergeld utility |
| `/kinderzuschlag/` | FLAGSHIP | KiZ decision/action guide; rebuilt 2026-09-12 |
| `/kinderzuschlag-uygunluk-kontrolu-2026/` | TOOL | KiZ blocker/document decision utility; rebuilt 2026-09-12 |
| `/wohngeld/` | FLAGSHIP | Wohngeld eligibility + housing-cost decision guide; rebuilt 2026-09-12 |
| `/blue-card/` | FLAGSHIP | §18g eligibility, salary route, IT, job-change and settlement decision guide; rebuilt 2026-09-12 |
| `/blue-card-maas-sarti/` | KEEP+DIFFERENTIATE | salary + contract decision guide; rebuilt 2026-09-12 |
| `/blue-card-uygunluk-kontrolu-2026/` | TOOL+REBUILD | blocker-first eligibility utility; rebuilt 2026-09-12 |
| `/schufa/` | FLAGSHIP | 2026 score interpretation + situation-based decision hub; verified 2026-09-12 |
| `/schufa-datenkopie/` | KEEP+DIFFERENTIATE | Art. 15 DSGVO data inspection vs Account/BonitätsAuskunft; verified 2026-09-12 |
| `/schufa-kaydi-silme/` | KEEP+DIFFERENTIATE | erroneous/obsolete record correction and deletion process |
| `/schufa-skoru-yukseltme/` | KEEP+DIFFERENTIATE | 12-criteria action guide for correct data but weak score |
| `/banka-hesabi-schufa-gerekli-mi/` | KEEP+DIFFERENTIATE | Girokonto/credit-feature/Basiskonto intent |
| `/almanyada-ev-kredisi/` | FLAGSHIP | mortgage readiness including SCHUFA, income, debt and equity |

Merged URLs use `noindex,follow`, canonical to the surviving flagship and a user-facing redirect. They must stay out of XML sitemaps. Useful unique material is moved into the surviving flagship before consolidation.
