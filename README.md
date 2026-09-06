# Almanya Pusulası

[Almanya Pusulası](https://almanyapusulasi.de/) Almanya'da yaşayan veya Almanya'ya gelmek isteyen Türkler için karar araçları, resmî kaynaklı rehberler ve güncel bilgi merkezi sunar.

Öne çıkan açık kaynaklar:

- [Brutto-Netto + yaşam bütçesi 2026](https://almanyapusulasi.de/brutto-netto-hesaplayici-2026/)
- [Chancenkarte uygunluk ve puan motoru](https://almanyapusulasi.de/chancenkarte-puan-hesaplayici-2026/)
- [EU Blue Card uygunluk motoru](https://almanyapusulasi.de/blue-card-uygunluk-kontrolu-2026/)
- [Kinderzuschlag uygunluk ön kontrolü](https://almanyapusulasi.de/kinderzuschlag-uygunluk-kontrolu-2026/)
- [Almanya 2026 resmî eşikler veri merkezi](https://almanyapusulasi.de/almanya-2026-resmi-esikler/)
- [Makine-okunabilir 2026 JSON veri seti](https://almanyapusulasi.de/data/almanya-2026-esikler.json)
- [Ücretsiz embed araçları](https://almanyapusulasi.de/embed-araclar/)

## Mimari

Statik bir web sitesidir. Framework veya çalışma zamanı bağımlılığı yoktur. Her sayfa kendi klasöründeki `index.html` dosyasıdır; paylaşılan stil ve site shell dosyaları `assets/` altında tutulur.

## Yerel önizleme

Kök dizinde bir statik sunucu çalıştırın:

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000/` adresini açın.

## Veri ve kaynak yaklaşımı

Göç, vergi, sosyal güvenlik ve aile destekleri gibi yüksek etkili konulardaki sayısal eşikler mümkün olduğunca Bundesministerium, Bundesagentur für Arbeit ve `Make it in Germany` gibi birincil resmî kaynaklardan doğrulanır. Kamuya açık 2026 eşik veri seti `data/almanya-2026-esikler.json` altında tutulur.

## Analiz

Google Analytics yalnızca kullanıcı analiz onayı verdikten sonra yüklenir. Seçim `localStorage` içinde saklanır ve site içindeki gizlilik ayarları üzerinden değiştirilebilir.

## Reklam ve ticari bağlantılar

Ticari teklif/affiliate alanları editoryal karar mantığından ayrı tutulur. Doğrulanmamış partner URL'leri üretime eklenmez.

## Yayın

Üretim alan adı: [https://almanyapusulasi.de/](https://almanyapusulasi.de/)
