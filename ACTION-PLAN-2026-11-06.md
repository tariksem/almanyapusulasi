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
| 04 / AP-04 | P0 | **Resmî tutar ve şart doğruluğu:** 2026 eşik JSON'u ile Kindergeld, KiZ, Blue Card, Chancenkarte, Wohngeld, vergi, emeklilik metinlerinin ilgili kurumlara göre tarih/sürüm eşleştirmesi. | — | Her eşik için kaynak + geçerlilik tarihi; saptanan yanlış değerler düzeltilir. | DOING (Kindergeld 2027 hukuki durum güncellendi; kalanlar açık) |
| 05 / AP-05 | P0 | **Karar araçları uçtan uca:** maaş, Blue Card, Chancenkarte, aile yardımı, kira/Nebenkosten ve sigorta senaryolarını sınır değerlerde test et. | AP-04 | Geçti/kaldı tablosu, örnek girdiler, beklenen sonuçlar ve araç uyarıları. | TODO |
| 06 / AP-06 | P1 | **Haberlerin güncelliği:** tarihi geçen duyurulara arşiv statüsü; ana sayfadaki "son gelişmeler" iddiasını tarih açısından doğru hale getir; 2027 haberleri kaynak doğrula. | — | Eski yol kapanması güncel gibi gösterilmez, homepage/RSS yanlış tazelik iddiası taşımaz. | DOING (ana sayfa/haber güncelliği düzeltildi; diğer tarihli haberler açık) |
| 07 / AP-07 | P1 | **Sitemap/canonical/indexleme:** her indexlenebilir sayfa tek canonical ile sitemap'te; 23 eski URL 301, www/HTTP 308. | AP-02 | URL tekrarı ve indexlenebilir canonical eksikliği = 0; yönlendirme regresyonu = 0. | TODO |
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
