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
  };

  const negation = /\b(?:nicht|nie|niemals|keine\w*|weder|ohne)\b/u;
  const reportedSpeech = /\b(?:laut|angeblich|behaupt\w*|zitiert|zitat)\b/u;
  const selfReview = [
    'Sorunun her bölümünü kendi sözcüklerinle yanıtladığını kontrol et.',
    'Konuşmacıyı, olayı ve varsa neden-sonuç bağını transkriptle karşılaştır.',
    'Yanıtını destekleyen konuşma bölümünü bul. Soruda birden fazla örnek isteniyorsa her örneği ayrı kontrol et.',
  ];

  function lookForPoint(clauses, check) {
    const possibleConflict = clauses.some((clause) => (
      !reportedSpeech.test(clause)
      && (check.negativeConflict?.test(clause) || (!negation.test(clause) && check.conflict?.test(clause)))
    ));
    if (possibleConflict) return 'compare';

    const relevant = clauses.some((clause) => (
      !reportedSpeech.test(clause)
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
      .split(/[.!?;\n]+|,\s+(?:aber|jedoch|sondern|nicht bloß)\s+/u)
      .filter((clause) => clause.trim());

    return {
      kind: 'tailored',
      points: lessonChecks.map((check) => ({ hint: check.hint, status: lookForPoint(clauses, check) })),
    };
  }

  return { reviewAnswer, lessonIds: Object.keys(checks) };
})();
