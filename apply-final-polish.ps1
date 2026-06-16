# Almanya Pusulası final polish updater
# Bu script repository kök dizininde çalıştırılmalıdır.
# Yaptığı işler:
# 1) Eski inline Google Analytics kodlarını kaldırır.
# 2) Consent bazlı analytics scriptini ekler.
# 3) Header logosunu yeni görsel logo ile değiştirir.
# 4) Footer'a Impressum linki ekler.
# 5) style.css sonuna final CSS snippet'i ekler.

$ErrorActionPreference = "Stop"

$brandHead = @'
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

'@

$consentScript = '  <script defer src="/assets/js/analytics-consent.js"></script>'

$newLogo = @'
<a class="logo" href="/">
      <img class="logo-img" src="/assets/brand/almanya-pusulasi-logo-64.png" alt="Almanya Pusulası logosu">
      <span>Almanya Pusulası</span>
    </a>
'@

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object {
    $_.FullName -notmatch "\\\.git\\" -and $_.FullName -notmatch "\\\.vs\\"
}

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Eski inline GA bloğunu kaldır
    $content = [regex]::Replace(
        $content,
        '(?s)\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-2E8PT2LRG1"></script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\(''js'', new Date\(\)\);\s*gtag\(''config'', ''G-2E8PT2LRG1''\);\s*</script>\s*',
        "`r`n"
    )

    # Logo bloğunu değiştir
    $content = [regex]::Replace(
        $content,
        '(?s)<a class="logo" href="/">\s*<span class="logo-mark">⌖</span>\s*<span>Almanya Pusulası</span>\s*</a>',
        $newLogo.Trim()
    )

    # Head brand linkleri ekle
    if ($content -notmatch 'favicon-32x32\.png') {
        $content = $content -replace '<link rel="stylesheet" href="/assets/style.css">', ($brandHead + '  <link rel="stylesheet" href="/assets/style.css">')
    }

    # Consent script ekle
    if ($content -notmatch 'analytics-consent\.js') {
        $content = $content -replace '</head>', ($consentScript + "`r`n</head>")
    }

    # Footer'a Impressum ekle
    if ($content -notmatch '/impressum/') {
        $content = $content -replace '<a href="/privacy/">Gizlilik</a>', '<a href="/privacy/">Gizlilik</a> · <a href="/impressum/">Impressum</a>'
    }

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

# CSS snippet ekle
$cssPath = Join-Path "." "assets/style.css"
$snippetPath = Join-Path "." "style-final-snippet.css"

if (Test-Path $cssPath) {
    $css = Get-Content $cssPath -Raw -Encoding UTF8
    if ($css -notmatch 'Almanya Pusulası final polish') {
        $snippet = Get-Content $snippetPath -Raw -Encoding UTF8
        Add-Content -Path $cssPath -Value ("`r`n" + $snippet) -Encoding UTF8
    }
} else {
    Write-Warning "assets/style.css bulunamadı. CSS snippet manuel eklenmeli."
}

Write-Host "Final polish tamamlandı. Şimdi Impressum adres alanlarını doldurmayı unutmayın." -ForegroundColor Green
