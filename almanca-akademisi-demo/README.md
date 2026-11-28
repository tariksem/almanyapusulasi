# Almanya Pusulası Akademi — Dinleme V17.2

V17 kaynak paketinin semantik kanıt, arayüz ve 450 ses dosyası bakımından doğrulanmış nöral ses sürümüdür.

- `index.html`: Sesli, transkripti gizlenebilen, 282 nesnel soru ve 90 Almanca model yanıt içeren çevrimdışı eğitim arayüzü. E-posta veya hesap gerekmez.
- `demo-enhancements.js`: Canlı demo başlığı, Almanca tarayıcı sesi ve yazılı yanıtı gözden geçirme arayüzü.
- `open-answer-feedback.js` her seviyeden üç senaryoda göreve özgü ipuçları ve diğer 72 senaryoda yönlendirmeli öz değerlendirme sunar.
- `dinleme-v17-kalite.json`: 90 senaryo, 282 nesnel soru ve 90 model yanıtın ana veri dosyası.
- `V17_78_YENI_SENARYO_QA.csv`: V17'de eklenen 78 sorunun insan gözetimli semantik inceleme ve birebir transkript kanıtı kaydı.
- `QA_90_SENARYO.json` ve `QA_90_SENARYO.csv`: V17.1 kapsamına göre yeniden üretilmiş 90 senaryoluk denetim özeti.
- `qa-v17.mjs`: Sayılar, kimlikler, cevap anahtarları, kanıtlar, ses yolları, MP3 başlıkları, SHA-256 değerleri, gömülü veri ve JavaScript sözdizimini yeniden denetleyen bağımsız Node.js betiği.
- `A1_DINLEME_DEGERLENDIRME_V17.md` … `C2_DINLEME_DEGERLENDIRME_V17.md`: Seviye bazında güncel denetim materyalleri.
- `KALITE_RAPORU_V17.md`: Gerçekleştirilen kontroller, tarayıcı testi ve yayın öncesi açık sınırlar.

Tam ZIP 450 nöral MP3'ü içerir. Güncelleme ZIP'i ses değişikliğinin eksiksiz uygulanması için 450 MP3'ü, manifesti, veri dosyalarını ve arayüzü içerir; geliştirme/rapor yardımcılarının bir bölümü yalnızca tam ZIP'tedir.

450 kaydın tamamı Almanca nöral yapay sesle üretilmiştir. Yazılı yanıtlar model yanıt ve transkript kanıtlarıyla karşılaştırılır. 18 senaryoda sınırlı ifade kalıplarına dayalı ek ipuçları vardır. Canlı demo kanonik kurumsal logoyu kullanır.
