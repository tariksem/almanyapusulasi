# Almanya Pusulası — Denetim ve düzeltme planı

Denetim tarihi: 12 Ekim 2026. Kaynak: canlı site, 211 HTML sayfa, 204 dahili hedef, 283 harici bağlantı ve kritik araç senaryoları.

## Öncelikler

| Öncelik | Bulgu | Somut işlem |
|---|---|---|
| P0 | HTTP ve www adresleri 200 ile ayrı açılıyor | HTTPS/apex kalıcı yönlendirme ve HSTS |
| P0 | 87 canlı sayfa sitemap dışında, 41 URL tekrarlı | Tek üreticiyle bütün indexlenebilir canonical URL'leri kapsa |
| P0 | /data/almanya-2026-esikler.json 404 | Mevcut veri dosyasını üretim paketine dahil et |
| P0 | Yerel depo uzak main ve canlıdan geride | Güncel origin/main üzerinden izole çalışma alanı; mevcut izlenmeyen dosyaları koru |
| P1 | 9 JSON-LD bloğu geçersiz | JSON kapanışlarını onar, dağıtım öncesi ayrıştır |
| P1 | 5 resmi harici URL 404 | BMWSB, BMJV, BaFin ve Zoll hedeflerini güncelle |
| P1 | Gizlilik metni çerez silmeyi söylüyor, kod silmiyor | Onay geri çekme ve metin uyumu; bütün olayları onay katmanına bağla |
| P1 | Chancenkarte tanınmış yeterlilik rotası dil/puan şartlarını sağlandı gösteriyor | Rotaya göre yalnız ilgili koşulları göster |
| P1 | Güvenlik başlıkları eksik | nosniff, referrer, permissions, frame ve kademeli CSP |
| P1 | Ana sayfa gündemi ve RSS 8 Eylül'de kalmış | Haber metadata'sından ortak üretim |
| P1 | Affiliate dönüşümü hesap verisiyle doğrulanmadı | Canlı JS'de 18 etkin partner yerleşimi var; mevcut ölçümü ve gerçek partner dönüşümlerini doğrula |
| P2 | Menü etiketsiz, küçük mobil dokunma hedefleri | Erişilebilir ad ve hedef boyutları |
| P2 | 29 uzun başlık, 25 uzun açıklama, bazı kısa rehberler | Öncelikli sayfalarda snippet ve kaynaklı içerik iyileştirme |

## Doğrulama ölçütleri

- HTTP/www varyantları HTTPS apex'e 301/308 ile ulaşmalı.
- Sitemap kümesi indexlenebilir canonical HTML kümesini kapsamalı; URL tekrarı olmamalı.
- JSON-LD ayrıştırma hatası ve dahili 404 bulunmamalı.
- JSON veri dosyası dağıtım paketinde mevcut olmalı.
- Tanınmış yeterlilik rotasında dil ve altı puan satırı bulunmamalı.
- Analytics onaydan önce yüklenmemeli; geri çekmede _ga çerezleri silinmeli ve ölçüm devre dışı kalmalı.
- RSS ve ana sayfa son yayınlanan haberlerle eşleşmeli.

## Erişim ve yayın

Search Console bağlantısı yeniden kimlik doğrulama gerektiriyor; alternatif GSC bağlantısının aboneliği etkin değil. GA4 rapor hesabına erişim yok. Tıklama, gösterim, CTR, trafik ve dönüşüm rakamları doğrulanmadı. AdSense onayı/CMP hesap durumu yeniden doğrulanmadan reklam etkinleştirilmeyecek.

Uygulama çalışma alanı: C:/Users/tarik/Documents/GitHub/almanyapusulasi-audit-20261012; dal: fix/audit-2026-10-12; başlangıç: origin/main 3b437ee. Canlıya yayın durumu ayrıca kaydedilecek.

## 12 Ekim uygulama ilerlemesi

- Güncel uzak main üzerinden ayrı çalışma alanı hazır; eski yerel depodaki altı izlenmeyen dizin korunuyor.
- JSON veri dosyasının dağıtım paketinden çıkarıldığı tespit edildi; yalnız kamusal eşik dosyasının pakete alınması düzeltildi.
- Dokuz bozuk JSON-LD onarıldı.
- Güncel depodaki 250 HTML dosyasından, 23 yönlendirilen eski sayfa hariç, 227 canonical URL sitemap'e dahil edildi. İlk canlı denetimdeki 211 sayfadan farklılık uzak depodaki ek içeriklerdir.
- Sitemap tekrarları kaldırıldı; RSS'de 12 haber, ana sayfada son üç haber otomatik üretiliyor.
- Chancenkarte tam tanıma rotasındaki yanıltıcı dil/puan göstergeleri kaldırıldı.
- 19 sayfanın ham gtag olay çağrıları ortak onay katmanına alındı; genel düğme olayı tool_action olarak ayrıldı.
- Analytics onay geri çekme, GA kapatma ve erişilebilir _ga çerezlerinin silinmesi eklendi.
- Beş kırık resmi bağlantı, HTTP 200 ile doğrulanmış güncel hedeflerle değiştirildi.
- HTTPS/apex yönlendirmeleri ve güvenlik başlıkları Worker kodunda hazır. Canlı etkisi yayın sonrası doğrulanmalı.
- Mobil menü erişilebilir adı ve footer dokunma alanları düzeltildi.
- Kod testleri geçti. GA4 Realtime, gerçek tarayıcı Google istekleri ve canlı host yönlendirmeleri yayın sonrası ayrıca kontrol edilmeli.
- Önceki raporun “aktif affiliate yok” ifadesi düzeltildi: canlı affiliate-slots.js 18 etkin yerleşim içeriyor, banka/elektrik sayfaları bu dosyayı yükleyip etiketli sponsorlu bağlantıları dinamik ekliyor. Gerçek satış/komisyon kanıtı yok.

## Doğrulama ve kalan işler

Yerel doğrulamalar: 250 HTML, 109 JSON-LD, 25 inline script, 227 benzersiz sitemap URL; dahili hedefler, Chancenkarte rota senaryoları, onay öncesi yükleme/geri çekme/yeniden kabul, Worker yönlendirme ve 404 testleri geçti. Marka kilidi, mevcut affiliate atıf, gelir akışı, eski URL yönlendirme, sitemap ve sosyal otomasyon kontrolleri geçti. Wrangler 4.149.0 ile 580 dosyalı paket üzerinde deploy --dry-run başarılı.

Bu paket henüz canlıya yayınlanmadı. Worker'ın hem apex hem www alan adlarına atanması hesapta doğrulanmalı; kod yalnız Worker'a ulaşan istekleri yönlendirebilir. Canlıya yayın sonrası HTTPS varyantları, JSON endpoint, sitemap kapsamı, gerçek tarayıcı onay/geri çekme ağı ve GA4 Realtime kontrol edilmeli. Tam CSP kaynak kısıtlaması ayrıca planlanmalı; bu pakette embed=1 akışını koruyan frame-ancestors politikası var. HSTS başlangıç süresi bir gün; HTTPS doğrulamasından sonra uzatılmalı.

Search Console yeniden bağlantısı, GA4 rapor erişimi, partner gerçek dönüşüm mutabakatı, AdSense onay/CMP kontrolü ve uzun/kısa içeriklerin editoryal iyileştirmesi bekliyor.

## İkinci uygulama turu — kalan işler

1. Hazır paketin CI/yayın durumunu kontrol et; yayın kaynağı ve Worker alan adı davranışını doğrula.
2. Canonical/indexlenebilir sayfalardaki uzun başlık ve açıklamaları anlamı koruyarak düzenle. Sosyal metaları aynı başlık/açıklamalarla eşitle.
3. Kısa araç sayfalarına kullanım, sonuç yorumu, hesap sınırları ve ilgili rehber bağlantıları ekle.
4. Mobil menü, dokunma alanları ve ana sayfa yoğunluğunu mevcut marka düzenini koruyarak iyileştir.
5. Güvenlik politikasını kaynak envanteri üzerinden kademeli sıkılaştır; kamusal embed akışlarını koru.
6. Yayın gerçekleşirse HTTPS/www, JSON endpoint, sitemap, mobil araçlar ve onay/geri çekme ağını yeniden kontrol et.
7. Hesap erişimi gerektiren Search Console, GA4 Realtime/rapor, partner satış mutabakatı ve AdSense/CMP işlerini doğrulanmadan tamamlandı sayma.

### İkinci tur uygulananlar

- 51 sayfanın title veya description metni kısaltıldı; mevcut sosyal metalar eşitlendi. Indexlenebilir sayfalarda HTML entity çözümlemesi sonrası 65 karakter üzeri title / 170 karakter üzeri description kalanları yeniden taranacak.
- İlk 90 gün, Netto-Brutto, internet maliyeti, şehir bütçesi ve vergi yöntemi araçlarına kullanım, yöntem, örnek, sınır ve ilgili rehber bölümleri eklendi.
- Ana sayfada doğrulanmamış güncel Search Console görünürlük iddiası kaldırıldı. Konu merkezleri mobilde açılır/kapanır; 12 bağlantı HTML içinde korunuyor.
- Yeni dönüşüm hatası onarıldı: onay öncesi görünen partner kutuları artık ölçülmüş sayılıp gözlemden çıkarılmıyor. Kabulden sonra görünür yerleşimler bir kez ölçülüyor; yeniden kabul çift sayım yapmıyor. Partner uç noktalarına sahte test tıklaması gönderilmedi.
- CSP kaynak politikası Report-Only olarak hazırlandı. Enforcement henüz frame-ancestors ile sınırlı; OCR, upload ve partner bileşenlerinin kaynak ihlalleri gözlenmeden yeni kısıtlar zorlanmıyor.
- Gerçek tarayıcı mobil kontrolü: beş araç yatay taşma olmadan açılıyor; dört araçta yeni açıklamalar var, tarayıcı hata/warn kaydı yok. Ana sayfa konu merkezleri aç/kapa çalışıyor. Ret sonrası Google etiketi yok; kabulde tek etiket yükleniyor. Çerez silme ve geri çekme davranışı kod testinde doğrulandı; gerçek Google ağ/GA4 hesap kanıtı ayrıca gerekiyor.
- Doğrudan Cloudflare oturumu yok. Mevcut GitHub yayın akışı kullanılabilir; alan adı davranışı canlıda ayrıca doğrulanmalı.
