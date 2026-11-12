const fs=require('node:fs');
const SITE='https://almanyapusulasi.de';
const pairs=[
["ALMANYA’DA YAŞAM, ÇALIŞMA VE AİLE HAYATI","LIVING, WORKING AND FAMILY LIFE IN GERMANY","LEBEN, ARBEITEN UND FAMILIE IN DEUTSCHLAND"],
["Almanya’da hayatınızı","Make life in Germany","Gestalten Sie Ihren Alltag"],
["kolaylaştıran","easier with a","in Deutschland einfacher –"],
["güvenilir rehber.","trusted guide.","mit unserem Ratgeber."],
["Vize, oturum, çalışma, aile destekleri, kira, sigorta ve daha fazlası için","For visas, residence, employment, family support, rent, insurance and more:","Zu Visum, Aufenthalt, Arbeit, Familienleistungen, Miete, Versicherung und mehr:"],
["güncel bilgiler, pratik hesaplayıcılar ve adım adım rehberler.","current information, practical calculators and step-by-step guides.","aktuelle Informationen, praktische Rechner und Schritt-für-Schritt-Ratgeber."],
["Ara","Search","Suchen"],
["Popüler aramalar:","Popular searches:","Beliebte Suchanfragen:"],
["Size en uygun yolu seçin","Choose the right path for you","Wählen Sie Ihren passenden Weg"],
["Durumunuza göre rehberlere, araçlara ve güncel bilgilere hızla ulaşın.","Quickly find guides, tools and updates relevant to your situation.","Finden Sie schnell passende Ratgeber, Werkzeuge und aktuelle Informationen."],
["Almanya’ya geliyorum","I am moving to Germany","Ich möchte nach Deutschland"],
["Vize, Chancenkarte, Blue Card ve ilk adımlar","Visas, Opportunity Card, EU Blue Card and first steps","Visum, Chancenkarte, Blaue Karte EU und erste Schritte"],
["Almanya’da yaşıyorum","I live in Germany","Ich lebe in Deutschland"],
["Oturum, iş, konut, sigorta ve günlük yaşam","Residence, work, housing, insurance and daily life","Aufenthalt, Arbeit, Wohnen, Versicherungen und Alltag"],
["Ailem için destek arıyorum","I need family support","Ich suche Familienleistungen"],
["Kindergeld, Elterngeld, Wohngeld ve diğer yardımlar","Kindergeld, parental allowance, housing allowance and other benefits","Kindergeld, Elterngeld, Wohngeld und weitere Leistungen"],
["En Çok Kullanılan Hesaplayıcı ve Araçlar","Most Popular Calculators and Tools","Beliebte Rechner und Werkzeuge"],
["Tüm araçları gör →","View all tools →","Alle Rechner ansehen →"],
["Brutto–Netto","Gross–Net","Brutto–Netto"],
["Hesaplayıcı","Calculator","Rechner"],
["Puan Hesabı","Points Check","Punktecheck"],
["Uygunluk","Eligibility","Eignungscheck"],
["Yeni","New","Neu"],
["Kontrolü","Review","Prüfung"],
["Sigorta","Insurance","Versicherung"],
["Seçim Aracı","Decision Tool","Entscheidungshilfe"],
["Auto-Kosten","Car Costs","Autokosten"],
["Check","Check","Check"],
["Tüm araçlar","All tools","Alle Rechner"],
["Öne Çıkan Rehberler","Featured Guides","Ausgewählte Ratgeber"],
["Tüm rehberler →","All guides →","Alle Ratgeber →"],
["Blue Card’tan süresiz oturuma (§ 9a) 21 veya 27 ayda geçiş","From the EU Blue Card to permanent residence after 21 or 27 months","Von der Blauen Karte zur Niederlassung nach 21 oder 27 Monaten"],
["Chancenkarte: Kimler başvurabilir, puan hesabı nasıl?","Opportunity Card: Who is eligible and how does the points system work?","Chancenkarte: Wer kann sie beantragen und wie funktioniert das Punktesystem?"],
["Kira ve Nebenkosten: Hesap dökümünü nasıl kontrol edersiniz?","Rent and utilities: How to review your annual service charge statement","Miete und Nebenkosten: So prüfen Sie Ihre Abrechnung"],
["Krankenkasse değiştirme: Adım adım rehber","Switching health insurers: Step-by-step guide","Krankenkasse wechseln: Schritt-für-Schritt-Anleitung"],
["Güncel Bilgiler","Latest Information","Aktuelle Informationen"],
["2027’de Kindergeld 267 €’ya çıkıyor (Taslak)","Proposed Kindergeld increase to €267 in 2027 (draft)","Geplantes Kindergeld von 267 € im Jahr 2027 (Entwurf)"],
["Bürgergeld 2027: Planlanan değişiklikler neler?","Bürgergeld 2027: Which changes are proposed?","Bürgergeld 2027: Welche Änderungen sind geplant?"],
["Krankenkasse değiştirme: Haklarınız ve adımlar","Changing health insurer: Your rights and next steps","Krankenkasse wechseln: Ihre Rechte und die nächsten Schritte"],
["Tüm güncel haberler →","All latest news →","Alle aktuellen Meldungen →"],
["Dikkat Çekenler","Worth Knowing","Wissenswertes"],
["Familienversicherung (Aile sigortası) şartları","Family health insurance: Eligibility requirements","Familienversicherung: Voraussetzungen"],
["Almanya’da ev kiralama: Haklar ve sözleşme","Renting a home in Germany: Rights and contracts","Wohnung mieten in Deutschland: Rechte und Mietvertrag"],
["İşten ayrılınca sağlık sigortası ne olur?","What happens to health insurance when you leave a job?","Krankenversicherung nach dem Ende des Arbeitsverhältnisses"],
["Almanya’da emeklilik: Hangi sistem, ne zaman?","German retirement: Which pension system applies?","Rente in Deutschland: Welches System gilt?"],
["En çok ihtiyaç duyulan araçlar","Essential Planning Tools","Wichtige Entscheidungshilfen"],
["Sizin için önemli kontroller","Checks that matter to you","Prüfungen für Ihre Situation"],
["Doğru kararı vermeden önce kendi durumunuzu ücretsiz değerlendirin.","Assess your own situation free of charge before making important decisions.","Prüfen Sie Ihre Situation kostenlos, bevor Sie wichtige Entscheidungen treffen."],
["Blue Card uygunluğu","EU Blue Card eligibility","Eignung für die Blaue Karte EU"],
["İş, maaş ve yeterlilik şartları →","Employment, salary and qualification conditions →","Beschäftigung, Gehalt und Qualifikation →"],
["Chancenkarte puanı","Opportunity Card points","Chancenkarte-Punkte"],
["İş arama kartı ön kontrolü →","Preliminary eligibility check →","Vorprüfung der Voraussetzungen →"],
["Çocuk ek desteği","Supplementary child allowance","Kinderzuschlag"],
["Familienleistungen ön kontrolü →","Initial family benefits check →","Vorprüfung der Familienleistungen →"],
["Banka hesabı seçimi","Choosing a bank account","Bankkonto auswählen"],
["İhtiyacınıza uygun hesabı bulun →","Find a suitable account →","Passendes Konto finden →"],
["Brüt–net maaş","Gross-to-net salary","Brutto-Netto-Gehalt"],
["Yaklaşık net gelirinizi hesaplayın →","Estimate your net salary →","Nettogehalt berechnen →"],
["Tüm konu merkezlerini aç","Show all topic centres","Alle Themenbereiche anzeigen"],
["Göç & Kariyer","Immigration & Career","Zuwanderung & Beruf"],
["İş & Gelir","Work & Income","Arbeit & Einkommen"],
["Yerleşim","Settling In","Ankommen & Wohnen"],
["Aile & Çocuk","Family & Children","Familie & Kinder"],
["Finans","Finance","Finanzen"],
["Vatandaşlık","Citizenship","Einbürgerung"],
["Sağlık Sigortası","Health Insurance","Krankenversicherung"],
["Vergi","Taxes","Steuern"],
["Mobilite & Araç","Mobility & Car","Mobilität & Auto"],
["Haberler ve duyurular","News and Announcements","Nachrichten und Mitteilungen"],
["Almanya'dan seçilmiş haberler ve duyurular","Selected news and announcements from Germany","Ausgewählte Nachrichten und Mitteilungen aus Deutschland"],
["Yayın tarihlerini dikkate alın. Süresi dolan ulaşım, teşvik veya başvuru duyuruları için güncel durumu resmî kaynaktan yeniden kontrol edin.","Check publication dates. For expired transport, funding or application announcements, verify the current status with official sources.","Beachten Sie das Veröffentlichungsdatum. Prüfen Sie abgelaufene Verkehrs-, Förder- oder Antragsmeldungen anhand amtlicher Quellen."],
["Tüm haberler →","All news →","Alle Nachrichten →"],
["Gündem","Current affairs","Aktuelles"],
["Haberi ve etkisini oku →","Read the news and its impact →","Nachricht und Auswirkungen lesen →"],
["Almanya","Germany","Deutschland"],
["Almanya'da Tankrabatt: Benzin ve dizelde Ekim–Aralık 2026 vergi indirimi","Germany fuel-tax relief: Petrol and diesel, October–December 2026","Energiesteuerentlastung für Benzin und Diesel von Oktober bis Dezember 2026"],
["Ruhr bölgesinde 9–30 Ekim 2026 tren kapanması: Düsseldorf Havalimanı bağlantılarına dikkat","Ruhr railway closures 9–30 October 2026: Düsseldorf Airport connections","Bahnstreckensperrungen im Ruhrgebiet vom 9. bis 30. Oktober 2026"],
["Duisburg, Essen, Oberhausen ve Düsseldorf çevresindeki tren hatlarında 9–30 Ekim 2026 arasında kapsamlı kapanma, yönlendirme ve otobüsle ikame ulaşım.","Extensive closures and replacement buses around Duisburg, Essen, Oberhausen and Düsseldorf from 9 to 30 October 2026.","Umfangreiche Sperrungen und Schienenersatzverkehr rund um Duisburg, Essen, Oberhausen und Düsseldorf vom 9. bis 30. Oktober 2026."],
["AfD Saksonya-Anhalt'ta birinci oldu: Almanya'daki Türkler için ne değişiyor?","AfD leads in Saxony-Anhalt: What changes for Turkish residents?","AfD liegt in Sachsen-Anhalt vorn: Was ändert sich für türkische Einwohner?"],
["Saksonya-Anhalt seçim sonucunun Türkler ve göçmenler için anlamını inceleyin. Oturum ve vatandaşlıkta neyin değişmediğini ve izlenecek adımları görün.","Understand the election result and its implications for migrants, including which residence and citizenship rules remain unchanged.","Die Bedeutung des Wahlergebnisses für Zugewanderte und unveränderte Aufenthalts- und Einbürgerungsregeln."],
["6 Kasım 2026","6 November 2026","6. November 2026"],["5 Kasım 2026","5 November 2026","5. November 2026"],["4 Kasım 2026","4 November 2026","4. November 2026"],
["27 Eylül 2026","27 September 2026","27. September 2026"],["24 Eylül 2026","24 September 2026","24. September 2026"],["8 Eylül 2026","8 September 2026","8. September 2026"]
];
const fallback={en:"The linked resource is currently available in Turkish.",de:"Der verlinkte Inhalt ist derzeit auf Türkisch verfügbar."};
const SOURCE=fs.readFileSync('index.html','utf8');
function build(lang){
 let html=SOURCE;
 const tr='/';
 const src='https://almanyapusulasi.de/';
 html=html.replace('<html lang="tr">','<html lang="'+lang+'">');
 html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+(lang==="en"?"Living and working in Germany":"Leben und Arbeiten in Deutschland")+' | Almanya Pusulası</title>');
 html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+(lang==="en"?"Guides, tools, work, residence, family support and current developments in Germany.":"Ratgeber zu Aufenthalt, Beruf, Familie, Wohnen und aktuellen Entwicklungen in Deutschland.")+'">');
 html=html.replace('<link rel="canonical" href="'+src+'">','<link rel="canonical" href="'+src+lang+'/">');
 html=html.replace(/(<meta property="og:locale" content=")[^"]+(">)/,'$1'+(lang==="en"?"en_US":"de_DE")+'$2');
 html=html.replace(/(<meta property="og:url" content=")[^"]+(">)/,'$1'+src+lang+'/$2');
 html=html.replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+(lang==="en"?"Living in Germany":"Leben in Deutschland")+' | Almanya Pusulası">');
 html=html.replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+(lang==="en"?"English guides and interactive tools for life in Germany.":"Deutsche Ratgeber und interaktive Werkzeuge für das Leben in Deutschland.")+'">');
 html=html.replace(/"inLanguage":"tr"/g,'"inLanguage":"'+lang+'"');
 html=html.replace(/"url":"https:\/\/almanyapusulasi.de\/"/g,'"url":"'+src+lang+'/"');
 // The source hero uses <br> and <span>: translate the entire marked-up heading,
 // rather than replacing only exact >text< nodes (which left "kolaylaştıran").
 const heroHeading=lang==="en"
  ?'Make life in Germany<br>easier with a <span class="gold">trusted guide.</span>'
  :'Gestalten Sie Ihren Alltag in Deutschland<br>einfacher – mit einem <span class="gold">zuverlässigen Ratgeber.</span>';
 const heroDescription=lang==="en"
  ?'For visas, residence, employment, family benefits, rent and insurance:<br>up-to-date information, practical calculators and step-by-step guides.'
  :'Zu Visum, Aufenthalt, Arbeit, Familienleistungen, Miete und Versicherungen:<br>aktuelle Informationen, praktische Rechner und Schritt-für-Schritt-Ratgeber.';
 html=html.replace(/(<h1 id="hero-title">)[\\s\\S]*?(<\\/h1>)/,'$1'+heroHeading+'$2');
 html=html.replace(/(<p class="desc">)[\\s\\S]*?(<\\/p>)/,'$1'+heroDescription+'$2');
 const bodyAt=html.indexOf('</head>');
 let head=html.slice(0,bodyAt),body=html.slice(bodyAt);
 for(const [tr,en,de] of pairs){
   const value=lang==="en"?en:de;
   const needle='>'+tr+'<';
   body=body.split(needle).join('>'+value+'<');
 }
 body=body.replace(/placeholder="Ne arıyorsunuz\?[^"]*"/,'placeholder="'+(lang==="en"?"Search: Blue Card, Kindergeld, rent, insurance...":"Suche: Blaue Karte, Kindergeld, Miete, Versicherung...")+'"');
 body=body.replace(/aria-label="Site içinde ara"/g,'aria-label="'+(lang==="en"?"Search this site":"Website durchsuchen")+'"');
 const scriptStart=body.lastIndexOf('<script>');
 const scriptEnd=body.lastIndexOf('</script>');
 if(scriptStart<0||scriptEnd<scriptStart||!body.slice(scriptStart,scriptEnd).includes('const records='))throw Error('Original homepage search script not found');
 body=body.slice(0,scriptStart)+body.slice(scriptEnd+'</script>'.length);
 for(const slug of ['blue-card','chancenkarte-firsat-karti','blue-card-uygunluk-kontrolu-2026','chancenkarte-puan-hesaplayici-2026']){
  body=body.replaceAll('href="https://almanyapusulasi.de/'+slug+'/"','href="/'+lang+'/'+slug+'/"');
  body=body.replaceAll('href="/'+slug+'/"','href="/'+lang+'/'+slug+'/"');
 }
 body=body.replaceAll('<section class="section journey-sec"','<section id="start" class="section journey-sec"');
 body=body.replaceAll('<section class="section tools-sec"','<section id="tools" class="section tools-sec"');
 body=body.replaceAll('<section class="section guides-sec"','<section id="guides" class="section guides-sec"');
 body=body.replaceAll('<section class="section news-home"','<section id="news" class="section news-home"');
 body=body.replace('</body>','</body>');
 head=head.replace('</head>','');
 head+='<script defer src="/assets/js/local-home-search.js"></script><link rel="stylesheet" href="/assets/i18n-home-parity.css">';
 html=head+body;
 // Related site content without an approved translation is labelled as Turkish.
 html=html.replace(/<a\b([^>]*?)href="(https:\/\/almanyapusulasi.de\/|\/)([^"\/#?]+)\/?"([^>]*)>/g,(all,before,prefix,slug,after)=>{
   if(['en','de'].includes(slug))return all;
   if(['blue-card','chancenkarte-firsat-karti','blue-card-uygunluk-kontrolu-2026','chancenkarte-puan-hesaplayici-2026'].includes(slug))return all;
   return '<a'+before+'href="'+prefix+slug+'/"'+after+' data-tr-only="1" lang="tr" hreflang="tr" title="'+fallback[lang]+'">';
 });
 fs.mkdirSync(lang,{recursive:true});
 fs.writeFileSync(lang+'/index.html',html);
}
for(const lang of ['en','de'])build(lang);
console.log("Generated V4.1 matching EN and DE home structure from Turkish source");
