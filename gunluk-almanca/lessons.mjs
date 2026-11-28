export const lessons = [
  {
    id: 'telefon',
    sourceId: 'A1-U03-COMM',
    title: 'Telefonda numara doğrulama',
    task: 'Mina’nın yerinde ol. Numaranın son üç rakamını doğru sırayla söyle veya yaz.',
    example: 'Die letzten drei Ziffern sind fünf, acht, sieben.',
    evidence: 'Fast. Die letzten drei Zahlen sind fünf acht sieben.',
    checks: [
      { tip: 'Mina’nın söylediği son üç rakamı ve sırasını kontrol et.', cues: [/\b(?:587|5[\s,-]+8[\s,-]+7|fünf[\s,-]+acht[\s,-]+sieben)\b/u], conflict: /\b(?:589|5[\s,-]+8[\s,-]+9|fünf[\s,-]+acht[\s,-]+neun)\b/u },
    ],
  },
  {
    id: 'randevu',
    sourceId: 'A1-U07-COMM',
    title: 'Randevu alma',
    task: 'Ben’in yerinde ol. Kabul ettiğin randevunun gününü ve saatini Almanca doğrula.',
    example: 'Mittwoch um zehn Uhr passt mir.',
    evidence: 'Am Mittwoch ist um zehn Uhr noch ein Termin frei.',
    checks: [
      { tip: 'Ben’in kabul ettiği günü kontrol et.', cues: [/\bmittwoch\b/u], conflict: /\b(?:dienstag|donnerstag|freitag|montag)\b/u },
      { tip: 'Randevu saatini ekle.', cues: [/\b(?:zehn|10)\s+uhr\b|\b10:00\b|\bum (?:zehn|10)\b(?!\s+minuten)|\b(?:zehn|10)$/u], conflict: /\b(?:neun|9|elf|11|zwölf|12)\s+uhr\b|\b(?:9|11|12):00\b/u },
    ],
  },
  {
    id: 'pazar',
    sourceId: 'A1-U09-COMM',
    title: 'Pazarda ödeme',
    task: 'Satıcının yerinde ol. Müşteriye hangi ödeme biçimini kabul ettiğini söyle.',
    example: 'Nur bar, bitte.',
    evidence: 'Leider nicht. Nur bar.',
    checks: [
      { tip: 'Satıcının kabul ettiği ödeme biçimini kontrol et.', cues: [/\b(?:bar|bargeld|barzahlung)\b/u], conflict: /\b(?:nur\s+(?:mit\s+)?karte|kartenzahlung\s+(?:geht|ist möglich)|mit karte bezahlen können|(?:bar|bargeld)\s+und\s+(?:mit\s+)?karte)\b/u, negativeConflict: /\b(?:kein bargeld|keine barzahlung|nicht bar)\b/u },
    ],
  },
  {
    id: 'yol-tarifi',
    sourceId: 'A1-U11-COMM',
    title: 'İstasyona yol tarifi',
    task: 'Birine istasyona giden yolun ilk iki adımını söyle. Işıklara kadar nasıl gider ve orada hangi yöne döner?',
    example: 'Bis zur Ampel geradeaus, dann links.',
    evidence: 'An der Ampel links.',
    checks: [
      { tip: 'Trafik ışıklarına kadar nasıl gidileceğini belirt.', cues: [/ampel/u, /geradeaus|gerade aus/u] },
      { tip: 'Işıklarda dönülecek yönü kontrol et.', cues: [/\blinks\b/u], conflict: /(?:ampel|dann).*(?:rechts abbiegen|nach rechts|,\s*rechts\b)|^(?:an der ampel\s+)?rechts\b/u, negativeConflict: /\bnicht (?:nach )?links\b/u },
    ],
  },
  {
    id: 'doktor',
    sourceId: 'A2-U02-COMM',
    title: 'Doktorda şikâyet anlatma',
    task: 'Selin’in yerinde ol. Boğazındaki şikâyeti ve ne zamandır sürdüğünü doktora söyle.',
    example: 'Ich habe seit drei Tagen Halsschmerzen.',
    evidence: 'Ich habe seit drei Tagen Halsschmerzen und huste besonders nachts.',
    checks: [
      { tip: 'Selin’in boğazındaki şikâyeti belirt.', cues: [/halsschmerz|halsweh|hals.*(?:weh|schmerz)/u], negativeConflict: /\b(?:keine halsschmerzen|kein halsweh)\b/u },
      { tip: 'Şikâyetin kaç gündür sürdüğünü belirt.', cues: [/\b(?:drei|3)\s+tage[n]?\b/u], conflict: /\bseit\s+(?:zwei|2|vier|4|fünf|5|sieben|7)\s+tagen\b/u },
    ],
  },
  {
    id: 'ev-arama',
    sourceId: 'A2-U03-COMM',
    title: 'Ev ararken ısınma gideri',
    task: 'Ev sahibinin cevabını bir arkadaşına anlat. Isınma gideri hangi ödemeye dahil?',
    example: 'Die Heizkosten sind in der monatlichen Vorauszahlung enthalten.',
    evidence: 'In der monatlichen Vorauszahlung sind Heizkosten vorgesehen.',
    checks: [
      { tip: 'Isınma giderini aylık avans ödemesiyle ilişkilendir.', cues: [/heiz|wärm/u, /vorauszahlung|abschlag/u], conflict: /heizkosten.*(?:kaltmiete|grundmiete).*(?:enthalten|inklusive)|heizkosten.*(?:enthalten|inklusive).*(?:kaltmiete|grundmiete)/u, negativeConflict: /heizkosten.*(?:nicht in der (?:monatlichen )?vorauszahlung|in der (?:monatlichen )?vorauszahlung nicht)/u },
    ],
  },
  {
    id: 'urun-degisimi',
    sourceId: 'A2-U04-COMM',
    title: 'Mağazada ürün değiştirme',
    task: 'Müşterinin yerinde ol. Fermuarın sorununu belirt ve ceketi değiştirmek istediğini söyle.',
    example: 'Der Reißverschluss ist kaputt. Kann ich die Jacke umtauschen?',
    evidence: 'Ja, hier. Ich hätte gern dieselbe Jacke in Ordnung.',
    checks: [
      { tip: 'Ceketteki sorunu belirt.', cues: [/rei(?:ß|ss)verschluss/u, /kaputt|defekt|klemmt|beschädigt/u], conflict: /rei(?:ß|ss)verschluss.*(?:in ordnung|funktioniert einwandfrei)/u },
      { tip: 'Ceketi değiştirmek istediğini söyle.', cues: [/umtausch|austausch|(?:andere|neue|dieselbe)\s+jacke/u], negativeConflict: /\b(?:nicht umtauschen|keinen umtausch)\b/u },
    ],
  },
  {
    id: 'belediye-randevusu',
    sourceId: 'A2-U06-COMM',
    title: 'Belediye randevusuna hazırlık',
    task: 'Rana’nın yerinde ol. Gerekli belgelerin listesini nerede kontrol edeceğini Almanca söyle.',
    example: 'Ich schaue in meiner Terminbestätigung nach.',
    evidence: 'Bitte sehen Sie zuerst in Ihrer Terminbestätigung nach.',
    checks: [
      { tip: 'Listenin randevu onayında olduğunu belirt.', cues: [/terminbestätigung|termin[- ](?:e[- ]?)?mail|bestätigung.*termin|(?:e[- ]?)?mail.*termin/u] },
    ],
  },
  {
    id: 'apartman',
    sourceId: 'B1-U06-COMM',
    title: 'Komşudan nazikçe rica etme',
    task: 'Komşundan akşamları apartman kapısını sessizce kapatmasını rica et.',
    example: 'Könnten Sie bitte abends die Haustür leise schließen?',
    evidence: 'Es geht nicht um ein vollständiges Verbot, sondern darum, abends Rücksicht zu nehmen und die Haustür leise zu schließen.',
    checks: [
      {
        tip: 'Apartman kapısını sessiz kapatma isteğini söyle.',
        cues: [/\b(?:haus)?tür\b/u, /leise|vorsichtig|geräuschlos/u, /schließ|schliess|zumach/u],
        negatedCue: /^(?=.*\b(?:haus)?tür\b)(?=.*(?:schließ|schliess|zumach)).*\bnicht laut\b/u,
        conflict: /^(?=.*\b(?:haus)?tür\b)(?=.*(?:schließ|schliess|zumach)).*\blaut\b/u,
      },
      { tip: 'Ricanın akşamlar için olduğunu belirt.', cues: [/\b(?:abends?|nachts|am abend)\b/u], negatedCue: /\b(?:abends?|nachts|am abend)\b.*\bnicht laut\b/u },
    ],
  },
  {
    id: 'banka',
    sourceId: 'B1-U09-COMM',
    title: 'Bankada yıllık masrafı sorma',
    task: 'Banka görevlisine hesap ve kartın toplam yıllık masrafını sor.',
    example: 'Was kosten das Konto und die Karte zusammen pro Jahr?',
    evidence: 'Ich möchte wissen, welche Leistungen ich wirklich brauche und was am Ende pro Jahr anfällt.',
    checks: [
      { tip: 'Hem hesabı hem kartı soruna dahil et.', cues: [/konto|kontoführ|grundgebühr/u, /karte/u] },
      { tip: 'Toplam maliyeti yıllık olarak sor.', cues: [/pro jahr|im jahr|jährlich|jahreskosten|jedes jahr|im ganzen jahr/u, /kost|gebühr|zahl|betrag/u], conflict: /\bnur\b.*\b(?:im monat|pro monat|monatlich)\b/u },
    ],
  },
  {
    id: 'belge-teslimi',
    sourceId: 'B1-U10-COMM',
    title: 'Eksik belge için süre sorma',
    task: 'Görevliye eksik belgeleri en geç ne zamana kadar gönderebileceğini sor.',
    example: 'Bis wann muss ich die fehlenden Unterlagen nachreichen?',
    evidence: 'Gibt es eine Frist, bis wann ich die Dokumente nachreichen soll?',
    checks: [
      { tip: 'Belgeleri tamamlamak için son günü veya süreyi sor.', cues: [/bis wann|frist|spätestens wann|letzte[rn]? termin/u, /unterlag|dokument|nachweis|nachreich|einreich/u] },
    ],
  },
  {
    id: 'tren-aktarmasi',
    sourceId: 'B1-U12-COMM',
    title: 'Geciken trende aktarma',
    task: 'Bir yolcuya alternatif bağlantının hangi şehir üzerinden gittiğini ve hangi perondan kalktığını söyle.',
    example: 'Die Alternative fährt über Bonn von Gleis zwei.',
    evidence: 'Es gibt eine Alternative über Bonn. Sie fährt von Gleis zwei ab.',
    checks: [
      { tip: 'Alternatif güzergâhta anılan şehri belirt.', cues: [/\bbonn\b/u] },
      { tip: 'Alternatif trenin peronunu belirt.', cues: [/\b(?:gleis|bahnsteig)\s+(?:zwei|2)\b/u], conflict: /^(?:gleis|bahnsteig)\s+(?:vier|4)\b|(?:alternative|bonn).*\b(?:gleis|bahnsteig)\s+(?:vier|4)\b/u },
    ],
  },
];

export function reviewAnswer(lesson, answer) {
  if (!/[\p{L}\p{N}]/u.test(answer)) return { status: 'empty', tips: [] };

  const statements = answer
    .normalize('NFC')
    .toLocaleLowerCase('de-DE')
    .split(/[.!?;\n]+|,\s+(?:aber|sondern|jedoch)\s+|,\s+(?=(?:nicht|nur|bitte)\b)/u)
    .map((statement) => statement.trim())
    .filter(Boolean);
  const negation = /\b(?:nicht|nie|kein(?:e|en|er|es|em)?|weder)\b/u;
  const rejectedClaim = /\b(?:stimmt nicht|ist falsch)\s*,?\s*dass\b/u;
  const conflicts = lesson.checks.filter((check) => statements.some((statement) => {
    if (rejectedClaim.test(statement)) return false;
    return check.negativeConflict?.test(statement) || (!negation.test(statement) && check.conflict?.test(statement));
  }));
  if (conflicts.length) return { status: 'compare', tips: conflicts.map(({ tip }) => tip) };

  const missing = lesson.checks.filter((check) => !statements.some((statement) => (
    !rejectedClaim.test(statement)
      && (check.negatedCue?.test(statement) || (!negation.test(statement) && check.cues.every((cue) => cue.test(statement))))
  )));
  if (!missing.length) return { status: 'ready', tips: [] };
  return {
    status: missing.length === lesson.checks.length ? 'unclear' : 'partial',
    tips: missing.map(({ tip }) => tip),
  };
}
