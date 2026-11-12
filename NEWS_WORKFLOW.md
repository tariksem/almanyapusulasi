# Haber yayın ve arşiv standardı (12.11.2026)

Kaynak dosya: `data/news-editorial.json`. Her `NewsArticle` için editoryal kayıt zorunlu.

## Durumlar
- `published`: Güncel haber kartında, ana sayfanın son üç haberinde ve RSS'te yer alabilir.
- `review`: İddianın veya mevzuat aşamasının yeniden resmî doğrulanması gerekir. Ana sayfa ve RSS'te yer almaz; arşivde uyarıyla korunur.
- `archived`: Tarihsel kayıt; URL ve canonical korunur, güncel haber akışına girmez.
- `expiresOn`: `published` olsa dahi tarih geçince otomatik arşive ayrılır. `reviewBy` editoryal takip tarihidir; *otomatik doğrulama değildir*.

## Yayın kontrolü
1. Haber seçimi: Almanya'daki Türkleri etkileyen hak, maliyet veya yükümlülük değişimi.
2. Resmî birincil kaynak, kesin tarih, yürürlük/yasa taslağı statüsü, etkilenen kişiler ve eylem maddesi zorunludur.
3. Kanun teklifi ve yürürlükteki hukuk birbirinden açıkça ayrılır. Doğrulanamayan veya çelişkili bilgi `review` durumunda tutulur.
4. Mevcut makale URL'si sırf tarih geçti diye silinmez veya değiştirilmez. Düzeltmeler açık ve tarihli yapılır.
5. Gerçekten doğrulanmadıkça `dateModified` ve kontrol tarihi yapay olarak yenilenmez.
6. Makale içeriği ve metadata eklendikten sonra `node scripts/generate-discovery.js` ve `node scripts/validate-news-editorial.js` çalıştırılır.
7. Ana sayfa, /haberler/ arşivi, RSS ve sitemap aynı üretim betiğinden hazırlanır. Cloudflare üretim hattı her gün 05:15 UTC'de yeniden derler.

## Denetim kuyruğu
12 Kasım 2026 kontrolü: vergi/Kindergeld 2027, başvurusuz Kindergeld 2027, Krankenkasse 2027, elektrik şebeke desteği 2027, ELSTER 2027 ve Kita reformu taslakları yeniden doğrulanana kadar `review`.
Ruhr 9–30 Ekim ulaşım duyurusu ve Eylül 2026 değişiklikleri `archived`.
Diğerleri `published`; bu, bağımsız kaynak doğrulamasının bu çalışma kapsamında tamamen tamamlandığı anlamına gelmez. `reviewBy` tarihlerinde tekrar incelenmelidir.

## Önemli sınır
Günlük derleme yalnız önceden tanımlanmış `expiresOn` tarihlerini uygular; haber yazmaz, mevzuat doğrulamaz veya yeni haberleri onaysız yayımlamaz. İnsan editoryal incelemesi hâlâ gereklidir.
