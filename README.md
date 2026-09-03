# Almanya Pusulası

Almanya Pusulası, Almanya'da yaşayan Türkler için SCHUFA, konut kredisi, Blue Card,
Kindergeld, emeklilik ve Türkiye seyahati konularında sade ve bağımsız bilgi rehberleri
sunan bir bilgi sitesidir.

## Mimari

Statik bir web sitesidir. Framework, derleme adımı veya çalışma zamanı bağımlılığı yoktur:

- El ile yazılmış HTML sayfaları
- Tek bir paylaşılan stil dosyası: `assets/style.css`
- Tek bir istemci betiği: `assets/js/analytics-consent.js`
- Görseller ve ikonlar: `assets/`

## Yönlendirme

Her sayfa kendi klasöründeki bir `index.html` dosyasıdır (`schufa/index.html`,
`blue-card/index.html`, ...). URL'ler klasör diziniyle temiz kalır (`/schufa/`).
Kök sayfa `index.html` dosyasıdır. Tüm bağlantı ve varlık yolları köke göredir (`/assets/...`),
bu yüzden site bir statik sunucu üzerinden servis edilmelidir.

## Yerel önizleme

Yol yapısı gereği dosyalar doğrudan `file://` ile açılamaz. Kök dizinde yerel bir statik
sunucu çalıştırın, örneğin:

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000/` adresini açın.

## Analiz

Google Analytics yalnızca kullanıcı analiz onayı verdikten sonra yüklenir. Kurulum Google
Consent Mode'un temel yaklaşımını kullanır; onay öncesinde Google etiketi yüklenmez ve
Google'a ölçüm isteği gönderilmez. Onay akışı ve GA yükleme mantığı tamamen
`assets/js/analytics-consent.js` içindedir; hiçbir sayfada satır içi GA kodu yoktur.
Seçim `localStorage` içinde saklanır ve her sayfanın altındaki **Çerez tercihleri** düğmesiyle
yeniden açılabilir.

## Reklam

Google AdSense henüz etkin değildir. Gerçek `ca-pub-...` yayıncı kimliği ve Google
sertifikalı TCF CMP kurulmadan reklam kodu ya da örnek `ads.txt` satırı eklenmemelidir.
Sahte veya yer tutucu yayıncı kimliği üretimde kullanılmamalıdır.

## Yayın

Üretim alan adı: `almanyapusulasi.de`
