# Almanya Pusulası — Öncelikli Düzeltme ve Yayın Planı
**Başlangıç:** 06.11.2026 · **Kaynak:** canlı ana sayfa, GitHub `main`, 12.10.2026 denetimi ve 06.11.2026 yayın sonuçları.
**Çalışma kuralı:** Her iş `tespit → kaynak doğrulama → düzeltme → otomatik test → canlı doğrulama` sırasını izler. CI başarısı tek başına canlı doğrulama değildir. Resmî kurum kaynağı olmadan hukuki/sayısal değer güncellenmez. GitHub `main` üzerindeki değişiklikler otomatik yayına gidebilir.
**Durum anahtarı:** `TODO`, `DOING`, `DONE`, `BLOCKED`, `VERIFIED` (hata yok).
**Sosyal medya güvenlik kuralı:** `social/meta-queue.json` içindeki `approved: false` korunur; yeni görsel ve yayın için kullanıcı onayı gereklidir. Otomatik sosyal paylaşım başlatılmaz.

## Bağımlılık ve uygulama sırası
Sıra, etki (P0 > P1 > P2), risk ve bağımlılığa göre belirlenmiştir. Aynı gruptaki bağımsız işler paralel yapılabilir.

| Sıra / ID | Seviye | İş / neden | Ön koşul | Kabul kriteri | Durum |
|---|---|---|---|---|---|
| 01 / AP-01 | P0 | **Yayın kalite kapısı:** Cloudflare yayını, SEO/onay/marka/yönlendirme ve iş kuralları testlerinden geçmeden başlatılmasın; kalite testi ile yayın yarışmasın. | — | Yayın workflow'unda kritik validator'lar deploy öncesi çalışır; bozuk test yayını durdurur. | DONE |
| 02 / AP-02 | P0 | **Canlı doğrulama:** HTTPS/www, header, sitemap, RSS, 404/JSON, canonical ve araç sayfalarının deploy-sonrası kontrolü. | AP-01 | Canlı denetim raporu; başarısız URL'ler somut listede; kanıtlanmayan sonuç açık. | DONE (CI + 22 URL + canlı denetim başarılı) |
| 03 / AP-03 | P0 | **Sosyal yayın kilidi:** onaysız eski/gelecek paylaşımın engellendiğini doğrula; CI validator'ında sessiz atlanan kontrol olmasın. | — | `approved: false` korunur, yayın akışındaki onay kapısı ve test yürütme akışı doğrulanır. | DONE (onay kilidi ve marka doğrulayıcı akışı) |
| 04 / AP-04 | P0 | **Resmî tutar ve şart doğruluğu:** 2026 eşik JSON'u ile Kindergeld, KiZ, Blue Card, Chancenkarte, Wohngeld, vergi, emeklilik metinlerinin ilgili kurumlara göre tarih/sürüm eşleştirmesi. | — | Her eşik için kaynak + geçerlilik tarihi; saptanan yanlış değerler düzeltilir. | DOING (2026 eşikler, emeklilik ve Wohngeld rehberi doğrulandı; 2027 geçişi/diğer sayısal iddialar açık) |
| 05 / AP-05 | P0 | **Karar araçları uçtan uca:** maaş, Blue Card, Chancenkarte, aile yardımı, kira/Nebenkosten ve sigorta senaryolarını sınır değerlerde test et. | AP-04 | Geçti/kaldı tablosu, örnek girdiler, beklenen sonuçlar ve araç uyarıları. | DOING (27 karar + 19 konut/Nebenkosten testi başarılı; sigorta/diğer araçlar açık) |
| 06 / AP-06 | P1 | **Haberlerin güncelliği:** tarihi geçen duyurulara arşiv statüsü; ana sayfadaki "son gelişmeler" iddiasını tarih açısından doğru hale getir; 2027 haberleri kaynak doğrula. | — | Eski yol kapanması güncel gibi gösterilmez, homepage/RSS yanlış tazelik iddiası taşımaz. | DOING (ana sayfa/haber güncelliği düzeltildi; diğer tarihli haberler açık) |
| 07 / AP-07 | P1 | **Sitemap/canonical/indexleme:** her indexlenebilir sayfa tek canonical ile sitemap'te; 23 eski URL 301, www/HTTP 308. | AP-02 | URL tekrarı ve indexlenebilir canonical eksikliği = 0; yönlendirme regresyonu = 0. | DONE (228 canonical sitemap; canlı 301/308/HTTPS testleri başarılı) |
| 08 / AP-08 | P1 | **Onay/gizlilik:** GA4/affiliate olayları onay öncesi gönderilmesin; geri çekme ve erişilebilir çerez silme gerçek tarayıcıda doğrulansın. | AP-02 | Ağ kayıtları ve consent testleri; privacy metni fiilî davranışla uyumlu. | TODO |
| 09 / AP-09 | P1 | **Kırık/eskimiş resmi bağlantılar:** başvuru ve kamu kurumu linklerinin 404, yönlendirme ve içerik doğruluğu. | — | Kritik kırık harici link = 0; kayıtlı kaynak URL'leri yenilenir. | TODO |
| 10 / AP-10 | P1 | **Güvenlik başlıkları/CSP:** HSTS, referrer, nosniff, frame ve Report-Only CSP'yi canlıda doğrula; embed/OCR/partner akışlarını koru. | AP-02 | HTTP başlıkları doğrulandı; CSP sertleştirmesi ihlal envanteri sonrası. | TODO |
| 11 / AP-11 | P1 | **Mobil/erişilebilirlik:** menü, form etiketleri, kontrast, klavye gezintisi, 44px dokunma hedefleri ve taşma. | AP-05 | Kritik cihaz genişliklerinde form/menü çalışır; otomatik ve manuel testler kayıtlı. | TODO |
| 12 / AP-12 | P1 | **Yıl geçişi:** 2026 başlıklı araç/referansların 2027'ye geçiş stratejisi; yayımlanmamış 2027 tutarlarını kesinmiş gibi vermeme. | AP-04 | `validFrom` / kaynak veya açık "2026 verisi" notları; otomatik eskime uyarısı. | TODO |
| 13 / AP-13 | P1 | **Haber üretimi:** statik kartlar ve RSS yalnız repo commit'inde yenileniyor; tarihi geçmiş olayları sistematik şekilde işaretle. | AP-06 | Güncellik algoritması, aynı kaynaktan homepage/RSS; eski haberlerin arşiv etiketi. | DONE (haber arşivi, ana sayfa ve RSS ortak metadatadan üretiliyor) |
| 14 / AP-14 | P2 | **GSC ve GA4 ölçümü:** erişimleri doğrula ve son kesinleşmiş dönem ile gerçek trafik/CTR/landing page raporu üret. | AP-07, AP-08 | Güncel, doğrulanmış 28 günlük kıyas; erişim yoksa `BLOCKED`. | BLOCKED (hesap doğrulaması) |
| 15 / AP-15 | P2 | **Affiliate/AdSense mutabakatı:** 18 partner yerleşimi var, ama tıklama/satış/komisyon ve AdSense/CMP durumu hesap tarafında doğrulanmadı. | AP-08, AP-14 | Gerçek sağlayıcı raporu ile eşleşen dönüşüm; sentetik tıklama yok. | BLOCKED (hesap verisi) |
| 16 / AP-16 | P2 | **Düşük kaliteli/çakışan sayfalar:** ince rehber, başlık/açıklama, schema, cannibalization ve iç bağlantı. | AP-07, AP-14 | Trafik fırsatı sıralaması; sayfa birleştirme ve 301 değişikliklerinde SEO kontrolleri yeşil. | TODO |
| 17 / AP-17 | P2 | **Yeni 10 günlük sosyal kampanya:** görseller tek tek kanonik logoyla hazırlanıp onaylanmadan yayın açılmaz. | AP-03, AP-06 | Her görsel ve metin ayrı onaylı; yalnız ondan sonra yeni tarihli yayın kuyruğu. | BLOCKED (kullanıcı onayı) |
| 18 / AP-18 | P2 | **Dönüşüm ve gelir optimizasyonu:** temel teknik/güven şartları ve anlamlı trafik sağlandıktan sonra test. | AP-14, AP-15, AP-16 | Gerçek UTM + dönüşüm verisi üzerinde küçük A/B test planı. | BLOCKED (ölçüm) |

## İlk kontrol sonuçları (06.11.2026)
- GitHub'da `tariksem/almanyapusulasi`, ana dal `main`; 06.11.2026 Ruhr tren haberi arşiv notu commit'i `5d91f783` için `Site Quality Audit`, Cloudflare ve Pages iş akışları başarıyla tamamlanmış. Bu, her URL'nin tek tek canlı doğrulaması anlamına gelmez.
- Sosyal kuyruk `approved: false`; yayıncı bu durumda no-op oluyor. 20–29.09.2026 dönemi geçmiş.
- Canlı ana sayfa 06.11.2026 tarihinde 13.10, 27.09 ve 24.09 tarihli kartları "son gelişmeler" altında gösteriyor; bu ifade/etiket yeniden ele alınmalı.
- 12.10.2026 denetiminde bulunan sitemap/JSON-LD/consent/veri paketi düzeltmeleri kaynakta var; canlıda yeniden doğrulama gereklidir.
- GSC, GA4, partner/AdSense rakamları güncel hesap verisiyle doğrulanmadan sonuç olarak sunulmayacak.

## Uygulama günlüğü
- 06.11.2026 — İş listesi, bağımlılık ve test ölçütleriyle kaydedildi. AP-01, AP-03 ve AP-06 ilk uygulanabilir düzeltmelerdir.

- 06.11.2026 — AP-01: `scripts/validate-site-structure.py` ortak yapısal kontrolü çıkarıldı; Cloudflare yayını öncesine güvenlik/SEO/consent/affiliate kontrolleri eklendi. AP-03: sosyal kalite kontrolündeki erişilemeyen marka testleri yeniden aktif edildi; yayın kilidi `approved: false`.
- 06.11.2026 — AP-06/AP-13: Ana sayfada eski haberlerin "son" diye sunulması kaldırıldı; haber vitrini ve arşivi aynı NewsArticle kaynağından üretiliyor; Ruhr 9–30 Ekim haberinde tarihsel durum notu var.
- 06.11.2026 — AP-04: 2027 başvurusuz Kindergeld haberinde 25.09.2026 Bundesrat onayı, 15.10.2026 kanun yayımı ve 01.01.2027 yürürlük tarihi işlendi; eksik NewsArticle JSON-LD eklendi. Kaynak: https://www.bundesregierung.de/breg-de/aktuelles/kindergeld-ohne-antrag-2412916
- 06.11.2026 — AP-02: Canlı tam regresyon denetimi Cloudflare yayın işine eklendi. Yeni haber sayısı yüzünden sabit 12 RSS sayımı hatalı çıktı; beklenen öğeler artık üretilmiş RSS ile birebir karşılaştırılıyor. Son kod `dffac25bd`: Site Quality Audit, Cloudflare, GitHub Pages `success`; canlı testte 22 önemli URL + sitemap/JSON/RSS/HTTPS/yönlendirmeler/onay dosyaları başarılı.

## İkinci çalışma turu — 06.11.2026 (AP-04 / AP-05)
- **Resmî kaynak doğrulaması (2026):** Kindergeld 259 €, KiZ 297 € ve asgari brüt gelir 900/600 €, EU Blue Card 50.700 €/45.934,20 €, Chancenkarte 6 puan/1.091 €, Grundfreibetrag 12.348 €, KV/PV BBG 5.812,50 €, RV/AV BBG 8.450 €, ortalama GKV Zusatzbeitrag %2,9, çocuk sayısına göre PV payları doğrulandı.
- **Veri revizyonu:** `data/almanya-2026-esikler.json` kontrol tarihi 06.11.2026 oldu; veri geçerlilik penceresi 2026 ile işaretlendi. Çalışan Werbungskosten-Pauschbetrag 1.230 € ve GKV sigorta zorunluluğu eşiği JAEG 77.400 € eklendi; JAEG ile BBG'nin farklı olduğu veri sayfasında anlatıldı.
- **Blue Card P0 düzeltmesi:** 45.934,20 € indirimli eşik ve diplomasız IT yolunda gerekli BA onayı artık sonuçta ayrıca uyarı üretiyor. Akademik yolda genel 50.700 € eşiği sağlanıyorsa düşük eşik seçeneği yüzünden gereksiz BA uyarısı verilmiyor. Maaş girişi cent duyarlılığında.
- **Net maaş P0 düzeltmesi:** Kullanıcı kirası net maaşı aşıyorsa eksik bakiye sıfıra kesilmiyor, negatif tutar ve 'bütçe açığı' gösteriliyor. 2026 vergi tahminine 1.230 € çalışan standart gider indirimi eklendi; vergi sınıfı/Soli/kişisel indirim sınırlamaları açıklandı. Gerçek bordro eşdeğerliği iddia edilmiyor.
- **Otomatik testler:** `scripts/validate-2026-tools.js` 27 senaryo; Blue Card maaş sınırlarında 1 cent alt/üst, BA kontrolü, IT deneyimi ve iş süresi; Brutto-Netto bütçe açığı, sıfır gelir ve 2026 vergi tarifesi; KiZ 900/600 € dahil/altında; Chancenkarte 6/5 puan, tanınmış yeterlilik ve finansman. Site Quality Audit ve Cloudflare deploy öncesi çalıştırılıyor.
- **CI kanıtı:** `596f480962c58c4a1a1dfe6d1e98a4dc989a52ef` için Site Quality Audit, GitHub Pages ve Cloudflare `success`; Cloudflare canlı denetimi de `success`. 27 araç senaryosunun tümü geçti (son kanıt 683155ee): https://github.com/tariksem/almanyapusulasi/actions/runs/42206088434 ; https://github.com/tariksem/almanyapusulasi/actions/runs/42206088252
- **Sıradaki iş:** AP-04'te Wohngeld/emeklilik ve 2027'ye taşınan rakamlar; AP-05'te kira/Nebenkosten ve diğer karar araçları için sınır testleri. Güncel olmayan veri 2027'ye otomatik kopyalanmayacak.

### İncelenen resmi kaynaklar
- BMF 2026: https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html
- §32a gelir vergisi: https://www.gesetze-im-internet.de/estg/__32a.html ; §9a çalışan standart indirimi: https://www.gesetze-im-internet.de/estg/__9a.html
- BA Kinderzuschlag: https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-anspruch-hoehe-dauer
- Blue Card: https://www.make-it-in-germany.com/en/visa-recognition/visa-types/eu-blue-card ; §18g: https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html
- Chancenkarte: https://www.make-it-in-germany.com/en/visa-recognition/opportunity-card/job-search
- BMAS 2026: https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html ; BMG: https://www.bundesgesundheitsministerium.de/beitraege/seite ; Pflege: https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung

- 06.11.2026 — AP-04 emeklilik eşiği tamamlandı: DRV/RWBestV 2026 ile 01.07.2026–30.06.2027 puan değeri 42,52 € (öncesinde 40,79 €) doğrulandı; tarih aralıklarıyla `data/almanya-2026-esikler.json` ve kaynak sayfasına eklendi. Kaynak: https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
- 06.11.2026 — AP-05 emekli maaşı sınır testleri eklendi: 0, 1 ve 10 Entgeltpunkte ile başlama katsayısı 0,8 senaryoları dahil **27/27 otomatik test başarılı**. Kanıt: https://github.com/tariksem/almanyapusulasi/actions/runs/42206568988
- AP-04 tamamlanmadı: Wohngeld / 2027 taslak-yürürlük geçişi ve diğer sayfa içi sayısal iddiaların ayrı kaynak doğrulaması hâlâ gerekli. Resmî Wohngeld hesaplayıcısı 403 erişim engeli nedeniyle bu oturumda doğrudan doğrulanamadı; URL'nin kırık olduğu sonucu çıkarılmadı.

## Üçüncü uygulama turu — 06.11.2026 (AP-04, AP-05, AP-07)
- **AP-05 P0 / Nebenkosten süre hatası:** `assets/js/nebenkosten-core.js` R002 ve R003 süre hesabı ayın sonuna yuvarlanıyordu. BGB §§ 556, 187–188 gereği **12 ay sonra aynı takvim günü** (olmayan günler için ayın son günü) kullanılacak şekilde düzeltildi. Kiracının itiraz süresi için örnek: 07.08.2025 teslim → 07.08.2026 son gün. Ay sonuna uzatma hatası giderildi. Örnekler: 15.06.2025 dönem bitişi → 15.06.2026; 29.02.2024 → 28.02.2025.
- **AP-05 P0 / Kaution:** `assets/js/miet-budget-core.js` ve `assets/js/miet-budget-tool.js` üzerinden nakit depozito için en yüksek 3 × Nettokaltmiete kontrolü ve `upfrontWithInstalment` ile ilk üç eşit taksitten yalnız ilkini içeren alternatif nakit başlangıç hesabı eklendi. Depozitonun tamamını içeren tutar korunur; ikisi arayüzde açıklanır. Yasal kaynak BGB §551.
- **AP-04 P0 / Wohngeld:** `wohngeld/index.html` üzerinde resmî hesaplayıcı için **Bruttokaltmiete = Nettokaltmiete + soğuk Nebenkosten** ve Warmmiete'nin doğrudan kullanılamayacağı; Kindergeld ve Kinderzuschlag'ın Wohngeld gelir hesabına dahil edilmediği kaynaklı olarak açıklandı. Son inceleme 06.11.2026. BMWSB: https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_artikel.html ve https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld-plus/wohngeld-plus_node.html
- **46 bağımsız regresyon senaryosu:** Mevcut `scripts/validate-2026-tools.js` 27 senaryo + yeni `scripts/validate-housing-tools.js` 19 senaryo. Ek olarak MietBudgetCore yerleşik 13 ve NebenkostenCore yerleşik fixture'ları kontrol ediliyor. Bunlar `Site Quality Audit` ve Cloudflare yayın işinde zorunlu ön kontroldür.
- **Canlı QA:** `scripts/verify-live-audit.mjs` içine Nebenkosten doğru takvim-günü fonksiyonu, kira taksitli-depozito modülü, Wohngeld Bruttokaltmiete açıklaması ve UI notunun canlıda varlığını kontrol eden 4 koşul eklendi. CI: https://github.com/tariksem/almanyapusulasi/actions/runs/42219384388 ; Cloudflare: https://github.com/tariksem/almanyapusulasi/actions/runs/42219384351. Bu testler kaynak paketi `6fd978c67` için başarıyla tamamlandı, yeni canlı QA eklemesi `b5dcf500b` ile ayrıca test edilecek.
- **AP-07 tamamlandı:** Otomatik denetimde 251 HTML, 228 benzersiz kanonik sitemap URL'si, 111 parse edilebilir JSON-LD ve 25 inline script başarıyla doğrulandı; Cloudflare 301 eski URL ve 308 yönlendirme testleri başarılı. Her yeni commit'te tekrar sınanacak.
- **Kalan:** AP-05 sigorta ve diğer karar araçları ile gerçek tarayıcı mobil senaryoları; AP-04 2027 yürürlüğe giriş/öngörü ayrımı ve geri kalan sayısal metinler; AP-08 gerçek consent ağ testi; AP-10 CSP ihlal envanteri.
