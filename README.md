# Almanya Pusulası - Final Polish Pack

Bu paket siteyi son yayına hazır hale getirmek için hazırlanmıştır.

## Paket ne yapar?

- Header'daki zayıf `⌖` ikonunu yeni logo görseliyle değiştirir.
- Favicon ve Apple touch icon ekler.
- Mobil menüyü görünür ve daha kullanışlı hale getirir.
- Google Analytics'i doğrudan yüklemek yerine kullanıcı onayından sonra yükler.
- `/impressum/` sayfası ekler.
- `/privacy/` sayfasını Google Analytics ve çerez onayı mantığına göre günceller.
- Footer'a `Impressum` linki ekler.

## Uygulama

1. ZIP dosyasını açın.
2. İçindeki tüm dosya ve klasörleri GitHub repository kök dizinine kopyalayın.
3. `impressum/index.html` içindeki şu placeholder alanlarını gerçek bilgilerle değiştirin:

   - `[Sokak ve kapı numarası buraya yazılacak]`
   - `[Posta kodu ve şehir buraya yazılacak]`

4. Repository kök dizininde PowerShell açın ve çalıştırın:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\apply-final-polish.ps1
```

5. `sitemap.xml` içine `sitemap-final-snippet.xml` içindeki iki URL bloğunu ekleyin.
6. Commit ve push yapın.

## Commit mesajı önerisi

```text
Finalize branding, privacy, impressum and mobile navigation
```

## Önemli not

`Impressum` sayfasını placeholder adresle canlıya almayın. Yayına almadan önce gerçek ve eksiksiz adres bilgisi girilmelidir.

Google Analytics için mevcut inline GA kodlarının kaldırılması önemlidir. Aksi halde cookie banner görünse bile Analytics onaydan önce çalışabilir.
