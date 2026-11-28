'use strict';

const academyAnswerFeedback = (() => {
  // Each pattern group must be satisfied within the same clause. These rules flag
  // possible points to review; they never assign a score or certify correctness.
  const checks = {
    'A1-U01-COMM': [
      {
        hint: 'Mina’nın kursa yeni başladığını kendi sözcüklerinle anlat.',
        clues: [/\bmina\b/u, /\b(?:neu|zum ersten mal)\b/u, /kurs/u],
      },
      {
        hint: 'Jonas’ın birlikte alıştırma yapma teklifini belirt.',
        clues: [/\b(?:jonas|er)\b/u, /\b(?:gemeinsam|zusammen)\b/u, /(?<!\p{L})(?:lernen|üben|ueben)\b/u, /\b(?:an|können|koennen|wollen|schlägt|schlaegt)\b/u],
        negativeConflict: /\b(?:jonas|er)\b.*\bnicht\b.*\b(?:gemeinsam|zusammen)\b.*(?<!\p{L})(?:üben|ueben|lernen)\b/u,
      },
    ],
    'A1-U02-COMM': [
      {
        hint: 'E-posta adresini kimin tekrar ettiğini belirt.',
        clues: [/\bben\b/u, /(?:e[- ]?mail[- ]?)?adresse/u, /wiederhol|noch einmal.*(?:liest|vor)|liest.*noch einmal/u],
        conflict: /\beda\b.*(?:wiederholt|liest).*adresse/u,
      },
      {
        hint: 'Ben’in adresi tekrarlarken neyi kontrol etmek istediğini açıkla.',
        clues: [/schreibfehler|adresse|mail/u, /verhinder|vermeid|prüf|kontroll|sicherstell|richtig verstand/u],
        negativeConflict: /\b(?:ben|er)\b.*\badresse\b.*\bnicht\b.*(?:prüfen|kontrollieren)/u,
      },
    ],
    'A1-U03-COMM': [
      {
        hint: 'Lea’nın telefonda okuduğu numarada hangi bölümün yanlış olduğunu belirt.',
        clues: [/\blea\b/u, /letzte\w* (?:drei )?(?:ziffern|zahlen)|endung/u, /falsch|verwechsel|versprech/u],
        conflict: /\bmina\b.*\b(?:liest|las|nennt)\b.*\b(?:falsche\w*|falsch)\b.*\b(?:ziffern|endung|nummer)\b/u,
      },
      {
        hint: 'Mina’nın düzelttiği son üç rakamı ve doğru sırayı kontrol et.',
        clues: [/\bmina\b/u, /sag|korrigier|nenn|bestätig/u, /\b(?:587|5[\s-]+8[\s-]+7|fünf[\s-]+acht[\s-]+sieben)\b/u],
        conflict: /\bmina\b.*(?:bestätigt.*\b(?:589|5[\s-]+8[\s-]+9|fünf[\s-]+acht[\s-]+neun)\b|(?:auf|mit) (?:589|5[\s-]+8[\s-]+9|fünf[\s-]+acht[\s-]+neun) endet)/u,
      },
    ],
    'A2-U01-COMM': [
      {
        hint: 'Tom’un kendi kitabını neden yanında getiremediğini belirt.',
        clues: [/\btom\b/u, /\bbuch\b/u, /\b(?:vergessen|liegen lassen|liegen gelassen)\b/u],
      },
      {
        hint: 'Kitabı kimin kime ödünç vereceğini ve ne zaman getireceğini açıkla.',
        clues: [/\bselin\b/u, /\b(?:leihen|ausleihen|borgen|ausborgen|leiht|borgt)\b/u, /\b(?:morgen|am nächsten tag)\b/u],
        negativeConflict: /\bselin\b.*\bnicht\b.*\b(?:leihen|ausleihen|borgen|ausborgen)\b/u,
      },
    ],
    'A2-U03-COMM': [
      {
        hint: 'Ahmet’in kira ve aylık avansla ilgili hangi tutarları kontrol etmesi gerektiğini belirt.',
        clues: [/miete|heizkosten/u, /monatlich|jeden monat/u, /vorauszahlung|abschlag|bezahlt|zahlen|kost/u],
      },
      {
        hint: 'Isınma giderlerinin nihai hesabının ne sıklıkla yapıldığını belirt.',
        clues: [/heizkosten|nebenkosten/u, /ab(?:ge)?rechn/u, /einmal im jahr|jährlich|jedes jahr/u],
        conflict: /\b(?:heizkosten|nebenkosten)\b.*(?:alle drei monate|vierteljährlich|jeden monat|monatlich).*(?:abgerechnet|endabrechnung)/u,
      },
      {
        hint: 'Dairenin ne zaman boşalacağını veya taşınmanın ne zaman mümkün olduğunu belirt.',
        clues: [/einzug|einzieh|wohnung.*frei/u, /(?:\bersten? märz\b|\b1[\s.-]+märz\b)/u],
        conflict: /^(?=.*(?:einzug|einzieh|wohnung.*frei)).*\b(?:ersten? april|1[\s.-]+april)\b/u,
      },
    ],
    'A2-U04-COMM': [
      {
        hint: 'Ceketin neden hemen değiştirilemediğini açıklamak için bedenin stok durumuna bak.',
        clues: [/größe|groesse/u, /ausverkauft|fehl|nicht (?:mehr )?(?:da|auf lager|vorrätig|vorhanden)/u],
        allowsNegation: true,
        conflict: /(?:passende|diese|ihre|richtige) größe.*(?:noch vorrätig|auf lager|sofort verfügbar)/u,
      },
      {
        hint: 'Satıcının diğer şubeyle ilgili ne yapmayı teklif ettiğini belirt.',
        clues: [/verkäufer|\ber\b/u, /filiale|geschäft|laden/u, /prüf|nachfrag|nachseh|schau|anruf/u],
        negativeConflict: /\b(?:verkäufer|er)\b.*\b(?:keine andere filiale|nicht in einer anderen filiale)\b.*(?:prüfen|nachfragen|anrufen)/u,
      },
    ],
    'B1-U01-COMM': [
      {
        hint: 'Mika’nın geç kalmasıyla mesajı yanlış anlaması arasındaki bağı kur.',
        clues: [/\bmika\b/u, /\b(?:spät|später|erst um neun)\b/u, /\b(?:nachricht|mitteilung)\b/u, /\b(?:falsch gelesen|missverstanden)\b/u],
      },
      {
        hint: 'Özrün arkadaşları için neden önemli olabileceğini gerekçelendir.',
        clues: [/entschuldig|bedauern/u, /verantwortung|einstand|ernst nahm|fehler eingestand/u],
        negativeConflict: /\b(?:mika|er)\b.*\b(?:nicht entschuldigt|keine verantwortung)\b/u,
      },
    ],
    'B1-U02-COMM': [
      {
        hint: 'Lara’nın günün hangi saatinde çalışmayı planladığını bir ayrıntıyla açıkla.',
        clues: [/\blara\b/u, /morgens?|am vormittag/u, /minut|handy|lern/u],
        conflict: /\blara\b.*\b(?:abends|nach dem abendessen)\b.*\b(?:zwei|2)\b.*aufgaben/u,
      },
      {
        hint: 'Yusuf’un akşam planını ve kendine ayırdığı görevleri belirt.',
        clues: [/\byusuf\b/u, /abend/u, /(?:zwei|2) (?:kleine |kurze |überschaubare )?(?:aufgaben|übungen)/u],
        conflict: /\byusuf\b.*\b(?:morgens?|vormittag)\b.*\b(?:zwanzig|20)\b.*minut/u,
      },
      {
        hint: 'Her iki planın kişinin günlük düzenine uyması gerektiğini veya deneyimlerini karşılaştıracaklarını açıkla.',
        clues: [/alltag|tagesablauf|erfahrungen/u, /pass|einfüg|vergleich|austausch/u],
      },
    ],
    'B1-U03-COMM': [
      {
        hint: 'Kontrol listesinin sonraki vardiyaya hangi bilgiyi aktardığını açıkla.',
        clues: [/schicht|team|kolleg/u, /lieferung|ware/u, /bereits|schon|noch offen|fehlt/u, /kontroll|prüf|erkenn|wuss|sah/u],
        conflict: /\bliste\b.*(?:verdeckte|verbarg|verschwieg).*lieferung/u,
      },
      {
        hint: 'Daha az soru sorulması veya aynı teslimatın iki kez kontrol edilmemesi gibi bir sonucu göster.',
        clues: [/rückfrag|doppelt|zweimal/u, /weniger|seltener|vermeid|niemand|keine? doppelt/u],
        allowsNegation: true,
        conflict: /(?:mehr|zusätzliche) rückfragen|(?:mehr|zusätzliche) doppelt\w* prüf/u,
      },
    ],
    'B2-U01-COMM': [
      {
        hint: 'Kararların sonradan anlaşılabilmesi hedefini açıkla.',
        clues: [/entscheid|entschied/u, /nachvollziehbar|\bklar\b.*\bwarum\b|\bwarum\b.*\bso\b/u],
      },
      {
        hint: 'Belgeleme yapılırken gereksiz iş yükünün nasıl önleneceğini belirt.',
        clues: [/bürokratie|aufwand|arbeit/u, /\b(?:ohne|gering|vermeiden|unnötig\w*|begrenzt)\b/u],
        allowsNegation: true,
      },
      {
        hint: 'Başarı ölçütünü sonradan yanıtsız kalan sorularla ilişkilendir.',
        clues: [/\bfragen\b/u, /offen|unbeantwortet/u, /weniger|prüf|mess|zählt|später/u],
        conflict: /\b(?:nur|allein|ausschließlich)\b.*\b(?:zahl|anzahl)\b.*\bformulare\b.*\b(?:messen|bewerten|beurteilen)\b/u,
      },
    ],
    'B2-U02-COMM': [
      {
        hint: 'Atölye planını etkileyen koşulu, yani desteğin gelmemesini belirt.',
        clues: [/förder|finanzier|zuschuss/u, /ohne|ausbleib|wegfäll|wegfall|ausfäll|ausfall|nicht zustande/u],
        allowsNegation: true,
      },
      {
        hint: 'Desteğin olmaması hâlinde kurucunun atölyeye başlangıçta hangi ölçekte devam edeceğini açıkla.',
        clues: [/werkstatt|beginn|anfang|investier|start/u, /kleiner|geringer|reduzier|weniger umfang/u],
        conditionPrefix: /^\s*ohne\s+(?:(?:die|eine|finanzielle|öffentliche|staatliche)\s+)*(?:förderung|finanzierung|zuschuss)\b/u,
        conflict: /(?:werkstatt|projekt).*(?:vollständig|endgültig).*(?:abgesagt|aufgegeben|gestrichen)|(?:gleich groß|in gleicher größe|unverändert).*(?:start|investier|bau)/u,
        negativeConflict: /\b(?:werkstatt|projekt)\b.*(?:überhaupt nicht|gar nicht).*(?:gebaut|begonnen|gestartet)/u,
      },
    ],
    'B2-U03-COMM': [
      {
        hint: 'Portalın hızlandırdığı aşamayı, yani verilerin ilk girişini, belirt.',
        clues: [/portal|system|software/u, /erfass|einles|einliest|importier|übernimm/u, /rasch|schnell|zügig|automatisch/u],
        conflict: /(?:portal|system|software).*(?:entscheidet|genehmigt).*(?:automatisch|selbstständig)|(?:portal|system|software).*(?:automatisch|selbstständig).*(?:endgültig genehmigt|über den antrag entscheidet)/u,
      },
      {
        hint: 'Sonraki insan denetiminin karar süresini neden uzatabildiğini açıkla.',
        clues: [/manuell|von hand|mitarbeit|menschen|person/u, /prüf|kontroll/u, /danach|danach noch|verzöger|dauer|anschließend|weiterhin|warten/u],
        negativeConflict: /\b(?:kontrollen|prüfungen)\b.*(?:nicht mehr nötig|nicht mehr erforderlich)/u,
      },
    ],
    'C1-U01-COMM': [
      {
        hint: 'İkinci yılda dijital ödünç almaların ziyaret sayısına katılmasını belirt.',
        clues: [/\bzweiten jahr\b/u, /online[- ]ausleih|digital\w* ausleih/u, /besuch/u, /flossen|erfasst|zähl|rechn/u],
      },
      {
        hint: 'Kullanımdaki değişime dair bulgularla erişimin iyileştiği iddiasını birbirinden ayır.',
        clues: [/nutzung/u, /\bzugang\b/u, /\b(?:keinen? schluss|keinen? nachweis|keinen? verbesserten zugang belegen|nicht automatisch|nicht belegt|nicht beweisen)\b/u],
        allowsNegation: true,
        conflict: /\bstudie\b.*\b(?:beweist|belegt)\b.*\b(?:zugang verbessert|verbesserten zugang|leichteren zugang)\b/u,
      },
    ],
    'C1-U02-COMM': [
      {
        hint: 'Bölümlerin ortak soruya nasıl hizmet ettiğini açıkla. Ulaşım ve konut arasındaki bağ bir örnek olabilir.',
        clues: [/leitfrage|fragestellung|these|(?:verkehr|mobilität).*(?:mieten|wohn)/u, /verbind|zusammen|beitr|beeinfluss|folgt|ableit|zusammenh/u],
        conflict: /(?:übergangswörter|verbindungswörter).*(?:allein|für sich).*(?:ausreichen|ausreicht|schlüssig mach)/u,
      },
      {
        hint: 'Önce hangi düzeltmenin yapıldığını ve geçiş ifadelerinin ne zaman seçildiğini belirt.',
        clues: [/zuerst|zunächst|erst einmal/u, /struktur|reihenfolge|argument|gedankengang|zusammenhang/u, /danach|anschließend|dann|erst später/u, /übergäng|verknüpf|überleit/u],
        conflict: /(?:zuerst|zunächst).*übergäng.*(?:danach|anschließend|dann).*(?:struktur|reihenfolge|argument)/u,
      },
    ],
    'C1-U03-COMM': [
      {
        hint: 'Eşit haklarla farklı yaşam koşullarında ihtiyaç duyulan desteği birbirinden ayır.',
        clues: [/gleich\w* recht/u, /unterstütz|hilfe|hilfen/u, /anpass|unterschied|verschieden|nicht zwingend identisch/u],
        allowsNegation: true,
        conflict: /gleich\w* recht.*(?:immer|zwingend|ausnahmslos).*(?:identisch|dieselbe|genau gleich).*(?:unterstütz|hilfe)/u,
      },
      {
        hint: 'Farklı desteğin hangi açık ölçütlerle gerekçelendirileceğini veya sonuçlarının nasıl değerlendirileceğini açıkla.',
        clues: [/kriteri|maßstäb|maßstab|folgen/u, /transparent|offenleg|nachvollzieh|überprüf|begrün|abwäg/u],
        negativeConflict: /(?:abweichung|ausnahmen|unterstützung|unterschiede).*(?:keine begründung|keine kriterien|nicht begründet werden)/u,
      },
    ],
    'C2-U01-COMM': [
      {
        hint: 'Övgünün reformun ele aldığı sorunu tanıdığını belirt.',
        clues: [/lob|anerkenn|positiv/u, /problem|diagnose/u, /ernst|berechtig|anerkenn|greift|aufgreift/u],
      },
      {
        hint: 'Somut yönteme desteğin hangi denetlenebilir koşula bağlı olduğunu açıkla.',
        clues: [/kontroll|überprüf|aufsicht/u, /(?:nachprüf|überprüf|messbar|wirkung|greif)/u, /zustimm|befürwort|bedingung|knüpft|verlang|fordert/u],
        conflict: /\b(?:experte|er)\b.*(?:bedingungslos|vorbehaltlos).*(?:zustimmt|stimmt.*zu|zustimmung|befürwort)|\b(?:experte|er)\b.*(?:stimmt|befürwortet).*(?:bedingungslos|vorbehaltlos)/u,
      },
    ],
    'C2-U02-COMM': [
      {
        hint: 'Görünürdeki övgünün ardındaki ironiyi veya eleştiriyi açıkla.',
        clues: [/\b(?:ironie|ironisch\w*|spott|sarkasmus|sarkastisch\w*|scheinbar\w*)\b/u, /\b(?:ist|war|klingt|meint|zeigt|wirkt|lobt)\b/u],
        conflict: /\b(?:kollegin|sie)\b.*\b(?:lobt.*\baufrichtig|meint.*\bwörtlich)\b/u,
      },
      {
        hint: 'Çok sayıdaki bildirimin hazırlığa ayırdığı zamanı nasıl etkilediğini açıkla.',
        clues: [/erinnerung|benachrichtigung|meldung/u, /vorbereit/u, /kostet|fehlt|behinder|erschwer|weniger zeit/u],
        conflict: /\b(?:erinnerungen|benachrichtigungen|meldungen)\b.*\b(?:erleichtern|verbessern)\b.*\b(?:vorbereitung|vorbereitungszeit)\b/u,
      },
    ],
    'C2-U03-COMM': [
      {
        hint: 'Bölgesel dil biçimlerinin kendi dilbilgisi veya düzenli yapısı olduğunu açıkla.',
        clues: [/dialekt|varietät|mundart/u, /eigene\w*|systematisch|eigenständig/u, /regel|grammatik|struktur/u],
        negativeConflict: /(?:dialekt|varietät|mundart).*(?:keine eigenen? regeln|keine eigene grammatik|ohne grammatik)/u,
      },
      {
        hint: 'Standart dilin bir durumda yararlı olmasıyla başka bir dil biçiminin değerini birbirinden ayır.',
        clues: [/standard|hochdeutsch/u, /situation|publik|register|kontext/u, /pass|angemess|erleichter|hilf|verständig/u],
        allowsNegation: true,
        conflict: /standard(?:deutsch|sprache).*sprachlich.*(?:überlegen|höherwertig)/u,
      },
    ],
  };

  const negation = /\b(?:nicht|nie|niemals|keine\w*|weder|ohne)\b/u;
  const quotedOrRefuted = /\b(?:laut|angeblich|behaupt\w*|zitiert|zitat)\b|\b(?:stimmt nicht|ist falsch|trifft nicht zu|ist unzutreffend)\s*,?\s*dass\b/u;
  const selfReview = [
    'Sorunun her bölümünü kendi sözcüklerinle yanıtladığını kontrol et.',
    'Konuşmacıyı, olayı ve varsa neden-sonuç bağını transkriptle karşılaştır.',
    'Yanıtını destekleyen konuşma bölümünü bul. Soruda birden fazla örnek isteniyorsa her örneği ayrı kontrol et.',
  ];

  function lookForPoint(clauses, check) {
    const possibleConflict = clauses.some((clause) => {
      if (quotedOrRefuted.test(clause)) return false;
      // A clause can state a condition using "ohne" and still make an affirmative claim.
      const assertion = check.conditionPrefix ? clause.replace(check.conditionPrefix, '') : clause;
      return check.negativeConflict?.test(assertion) || (!negation.test(assertion) && check.conflict?.test(assertion));
    });
    if (possibleConflict) return 'compare';

    const relevant = clauses.some((clause) => (
      !quotedOrRefuted.test(clause)
      && (check.allowsNegation || !negation.test(clause))
      && check.clues.every((clue) => clue.test(clause))
    ));
    return relevant ? 'possible' : 'review';
  }

  function reviewAnswer(lessonId, response) {
    if (!/\p{L}/u.test(response)) return { kind: 'empty', points: [] };

    const lessonChecks = checks[lessonId];
    if (!Object.hasOwn(checks, lessonId)) return { kind: 'guided', points: selfReview.map((hint) => ({ hint, status: 'review' })) };

    const clauses = response
      .normalize('NFC')
      .toLocaleLowerCase('de-DE')
      .replace(/„[^“”]*[“”]|»[^«]*«|«[^»]*»|"[^"]*"/gu, ' ')
      .replace(/\b(\d{1,2})\.(?=\s+(?:januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\b)/gu, '$1')
      .split(/[.!?;\n]+|,\s+(?:aber|jedoch|sondern|nicht bloß)\s+/u)
      .filter((clause) => clause.trim());

    return {
      kind: 'tailored',
      points: lessonChecks.map((check) => ({ hint: check.hint, status: lookForPoint(clauses, check) })),
    };
  }

  return { reviewAnswer, lessonIds: Object.keys(checks) };
})();
