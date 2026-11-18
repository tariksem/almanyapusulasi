# Almanya Pusulası Akademi — Dinleme V17.1

V17 kaynak paketinin semantik kanıt, QA dosyaları ve tarayıcı arayüzü bakımından doğrulanmış düzeltme sürümüdür.

- `index.html`: Sesli, transkripti gizlenebilen, 282 nesnel soru ve 90 Almanca model yanıt içeren çevrimdışı eğitim arayüzü. E-posta veya hesap gerekmez.
- `demo-enhancements.js`: Canlı demo için kanonik marka başlığı, cihaz bağımlı Almanca sesli okuma ve açık uçlu yanıta şeffaf içerik/kanıt ön değerlendirmesi.
- `dinleme-v17-kalite.json`: 90 senaryo, 282 nesnel soru ve 90 model yanıtın ana veri dosyası.
- `V17_78_YENI_SENARYO_QA.csv`: V17'de eklenen 78 sorunun insan gözetimli semantik inceleme ve birebir transkript kanıtı kaydı.
- `QA_90_SENARYO.json` ve `QA_90_SENARYO.csv`: V17.1 kapsamına göre yeniden üretilmiş 90 senaryoluk denetim özeti.
- `qa-v17.mjs`: Sayılar, kimlikler, cevap anahtarları, kanıtlar, ses yolları, MP3 başlıkları, SHA-256 değerleri, gömülü veri ve JavaScript sözdizimini yeniden denetleyen bağımsız Node.js betiği.
- `A1_DINLEME_DEGERLENDIRME_V17.md` … `C2_DINLEME_DEGERLENDIRME_V17.md`: Seviye bazında güncel denetim materyalleri.
- `KALITE_RAPORU_V17.md`: Gerçekleştirilen kontroller, tarayıcı testi ve yayın öncesi açık sınırlar.

Tam ZIP 450 MP3'ü içerir. Küçük güncelleme ZIP'i sesleri içermez ve V16/V17 tam paketindeki aynı `audio/`, `audio_new/`, `audio_v14/` klasörleriyle birlikte kullanılmalıdır.

Mevcut 450 kayıt eSpeak tabanlı sentetik sestir. Tarayıcı okuması cihazdaki yapay sesi kullanır; doğal insan kaydı değildir. Açık uçlu otomatik ön değerlendirme yalnızca içerik ve kanıt örtüşmesini yaklaşık olarak gösterir; güvenilir dilbilgisi veya CEFR puanı değildir. Canlı demoda repo içindeki kanonik kurumsal logo doğrudan kullanılır.
