# Almanya Pusulası Akademi — Dinleme V17.2 / İç kalite denetimi

Denetim tarihi: 28 Kasım 2026

## Korunan kapsam

- **90/90 özgün iletişim senaryosu** ve seviye dağılımı korundu: A1 12, A2 12, B1 15, B2 15, C1 18, C2 18.
- **450/450 MP3 yolu** korundu: `audio/` 360, `audio_new/` 24, `audio_v14/` 66. Dosyaların ses içeriği V17.2'de tamamen yenilendi.
- **282 nesnel soru** korundu: 90 konuşmacı, 90 sıralama ve 102 anlama/çıkarım sorusu.
- **90/90 Almanca model yanıt** ve 5 puanlık yönlendirilmiş öz değerlendirme rubriği korundu.

## V17.1'de tamamlanan kalite çalışmaları

- V17'de eklenen **78 yeni anlama/çıkarım sorusunun tamamı** soru, doğru seçenek, çeldirici ve transkript kanıtı birlikte okunarak yeniden incelendi.
- On soruda kanıt kapsamı, soru ifadesi, doğru seçenek veya kanıt çıpası daha kesin hale getirildi: B1-U15, B2-U02, B2-U13, C1-U09, C1-U17, C1-U18, C2-U02, C2-U05, C2-U07 ve C2-U12.
- A1-U03'te Türkçe kalmış senaryo başlığı kaynakla uyumlu Almanca başlıkla düzeltildi: **Eine Telefonnummer richtig verstehen**.
- V16 durumunu taşıyan eski `QA_90_SENARYO.json` ve `QA_90_SENARYO.csv` dosyaları V17.1 kapsamına göre yeniden üretildi.
- Seviye bazlı altı değerlendirme belgesi ve `V17_78_YENI_SENARYO_QA.csv` güncel ana veriden yeniden üretildi.
- Arayüzde seviye grubunun etiketi, Almanca içerik dil işaretleri, açılır alanların ARIA durumları ve canlı durum mesajları düzeltildi. Yerel ilerlemeyi JSON olarak indirme yeniden eklendi.
- Canlı demo katmanında resmî kurumsal logo, `noindex` demo metadatası, ana siteye dönüş bağlantısı ve cihazın Almanca konuşma motorunu kullanan isteğe bağlı tarayıcı okuması eklendi.
- Açık uçlu yanıtlara, yalnızca model yanıttaki anahtar kavramlar ile transkript kanıtlarının örtüşmesini gösteren şeffaf bir **otomatik ön değerlendirme** eklendi. Bu sonuç dilbilgisi, telaffuz veya CEFR yeterlilik notu değildir; öz değerlendirme ve model yanıt korunmuştur.

## V17.2 nöral ses yenilemesi

- Eski 450 eSpeak kaydının tamamı aynı dosya adları ve yolları korunarak Almanca nöral yapay sesle yeniden üretildi.
- 360 temel derste `de-DE-TanjaNeural` ve `de-DE-ChristophNeural` anlatıcıları dönüşümlü kullanıldı.
- 90 iletişim senaryosundaki 876 konuşma sırası ayrı üretildi; konuşmacı adı/rolüne göre kadın veya erkek ses atandı, aynı cinsiyetli konuşmacılarda Almanya, Avusturya ve İsviçre Almancası nöral sesleriyle ayrım sağlandı.
- Seviye hızları A1'de daha yavaş başlayıp C2'de doğal ileri düzey hıza çıkacak biçimde uygulandı. Konuşma başı/sonu sessizlikleri otomatik temizlenip kontrollü dönüş aralığı eklendi.
- Tüm dosyalar 24 kHz, 96 kbit/s, mono MP3 olarak üretildi. Eski manifestteki eSpeak karmalarından hiçbiri yeni manifestte yeniden kullanılmadı.

## Tekrarlanabilir yapısal ve dosya testleri

`node qa-v17.mjs` sonucu başarılıdır:

- 90 benzersiz senaryo ve beklenen altı seviye dağılımı.
- 282 benzersiz nesnel soru; geçerli cevap indeksleri ve benzersiz seçenekler.
- 102 anlama/çıkarım sorusu; bunların 78'i V17 kökenli.
- 78/78 yeni kanıt ve kanıt çıpası transkriptte birebir bulunuyor.
- 90/90 model yanıt, transkript kanıtı ve toplam 5 puanlık öz rubrik.
- 360 temel ders + 90 senaryo için **450 benzersiz ses referansı**.
- Diskte 450 MP3, manifestte 450 kayıt; dosya başlıkları ve **450/450 SHA-256** değeri eşleşiyor.
- 450 MP3'ün tamamı baştan sona kod çözme testinden geçti; sıfır veya iki saniyeden kısa kayıt bulunmadı.
- `index.html` içindeki gömülü veri dış JSON ile aynı; zorunlu arayüz kimlikleri benzersiz; bağımsız ve gömülü JavaScript sözdizimleri geçerli ve aynı.

## Tarayıcı uçtan uca testi

Yerel HTTP sunucusu üzerinden Chromium tabanlı uygulama içi tarayıcıda aşağıdaki akışlar çalıştırıldı:

- A1–C2 seviye ve senaryo geçişleri.
- A1 örneğinde dört doğru seçimin **4/4** olarak puanlanması.
- Transkriptin açılıp kapanması.
- Açık uçlu yanıtın yerel saklanması, model yanıtın açılması ve rubrikte **5/5** öz puan.
- İlerleme JSON'unun indirilmesi.
- B2 ve C2'de revize edilen soruların görünmesi.
- `audio_v14/A1-U01-COMM.mp3`, `audio_new/A1-U03-COMM.mp3`, `audio_v14/B2-U02-COMM.mp3` ve `audio/A1-U01-D01.mp3` dosyalarının tarayıcı tarafından hatasız yüklenmesi; temel ders MP3'ünün gerçek oynatmada süre ilerletmesi.
- Test edilen sayfalarda tarayıcı konsolu uyarı veya hata üretmedi.

Not: 450 dosyanın tamamı hash, dosya başlığı, yol ve tam ses akışı çözümleme bakımından doğrulandı; tarayıcıda gerçek oynatma üç ses klasörünü temsil eden örneklerle yapıldı. Bu, 450 kaydın insan tarafından baştan sona dinlendiği anlamına gelmez.

## Açık kalan kalite sınırları

- **450 MP3 nöral sentetik sestir; doğal insan kaydı değildir.** Çok konuşmacılı ayrım ve Almanca bölgesel ses çeşitliliği vardır, fakat C2 ironi/prozodi yorumu insan dinleme testiyle doğrulanmamıştır.
- İsteğe bağlı tarayıcı okumasının sesi işletim sistemi ve tarayıcıya bağlıdır; bu özellik 450 MP3'ün yerini alan sabit bir ses arşivi değildir.
- Özellikle ironi, ton ve örtük tutum gerektiren C2 görevlerinde sentetik ses kesin prozodi kanıtı sayılmaz.
- İş Paketi 4'te açık uçlu ön puan kaldırıldı. Güncel demoda model yanıt, transkript kanıtları ve öz değerlendirme ile birlikte altı senaryoda ifadeye özgü otomatik ipuçları sunuluyor.
- Model yanıtlar referans çekirdek yanıtlardır; C1/C2 resmî sınavındaki uzun sözlü veya yazılı performansa eşdeğer değildir.
- İçerik ve yanıtlar resmî CEFR, telc veya Goethe sınavı değildir.

## Kullanıcı kararıyla kapsam dışı kabul testleri

- Canlı öğrenci pilotu ve bağımsız Almanca öğretmeni kalibrasyonu yapılmayacaktır; bunlar yayın engeli olarak değerlendirilmez.
- İç kalite, semantik kanıt, dosya bütünlüğü, otomatik puanlama davranışı ve tarayıcı akışlarının sorumluluğu proje içi QA kapsamındadır.

**Sonuç:** V17.2'nin kapsamı, 450 nöral ses dosyası, 78 yeni sorunun semantik kanıtları, çevrimdışı arayüz ve canlı demo katmanı doğrulandı. Paket, yapay ses ve yaklaşık açık uçlu ön değerlendirme sınırları görünür tutularak **demo yayınına uygundur**; resmî sınav veya doğal insan sesi ürünü olarak sunulamaz.

## İş Paketi 4 · Açık uçlu geri bildirim

Eski sistem, A1–C2 arasındaki altı deneme senaryosunda anahtar kelimeleri kullanan yanlış yanıta, doğru anlamı başka sözcüklerle veren yanıttan daha yüksek puan verdi. Yeni akış otomatik sayısal puan yerine olası ipuçları, kontrol noktaları ve konuşmayla karşılaştırılması gereken ifadeleri gösterir.

Her seviyeden bir senaryo üç yanıtla sınandı. Bunlar doğru anlamı farklı sözcüklerle veren, kısmi ve yanıltıcı yanıtlardır. Boş yanıt, alıntı, anahtar kelime listesi ve olumsuzlama da test edildi. Diğer 84 senaryoda aynı düğme yönlendirmeli öz değerlendirmeyi açar. Kural kapsamı altı senaryodaki sınırlı ifade kalıplarıdır.
