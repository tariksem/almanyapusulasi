const fs=require('node:fs');
const assert=require('node:assert/strict');
const pages={
  "blue-card":{
    en:{
      title:"EU Blue Card Germany 2026: Salary, Eligibility and Settlement",
      desc:"Complete EU Blue Card guide for Germany: 2026 salary thresholds, degrees, special IT route, family reunification and permanent residence.",
      badge:"EU Blue Card · 2026 decision guide",
      h1:"EU Blue Card Germany 2026: Are you eligible?",
      intro:"Do not evaluate a Blue Card application on salary alone. Contract length, qualifications or IT experience, matching employment, professional authorisation and the correct salary threshold must all be checked.",
      cta:"Check eligibility (Turkish tool)",alt:"Review my salary offer (Turkish guide)",
      quick:"The answer in 30 seconds",
      facts:["Standard annual gross salary: <strong>€50,700</strong>","Eligible reduced salary threshold: <strong>€45,934.20</strong>","Specific job offer for at least <strong>six months</strong>","Certain <strong>IT professionals</strong> can qualify without a degree","Settlement permit potentially after <strong>27 months / 21 months with B1</strong>"],
      toc:"In this guide",
      heads:["Who is the EU Blue Card designed for?","Five-step eligibility decision tree","Understanding the 2026 salary thresholds","IT professionals without a university degree","How long is the EU Blue Card valid?","Changing jobs in the first 12 months","What if you lose your job?","Family reunification and permanent residence","Application checklist","What should you do next?","Official sources"],
      paragraphs:[
        "The EU Blue Card is a residence permit under §18g AufenthG for third-country nationals who take up qualified employment in Germany. The usual pathway requires an academic or equivalent tertiary qualification and a qualifying job. Certain IT professionals may qualify through a special experience-based pathway without a formal university degree.",
        "<ol><li><strong>Is there a concrete job offer lasting at least six months?</strong></li><li><strong>Do you have an eligible qualification?</strong> A degree or a qualifying IT-experience pathway.</li><li><strong>Does the position match your qualification or expertise?</strong></li><li><strong>Which salary threshold applies?</strong> Standard or specifically permitted reduced threshold.</li><li><strong>Does your profession require a licence?</strong> Regulated professions have additional rules.</li></ol><p>A salary above the threshold alone does not guarantee approval.</p>",
        "In 2026 the standard minimum annual gross salary is <strong>€50,700</strong>. The lower threshold of <strong>€45,934.20</strong> may apply to eligible shortage occupations, qualifying recent graduates and certain qualifying IT specialists. Lower pay does not in itself establish eligibility for the reduced threshold. Some lower-threshold cases require Federal Employment Agency approval.",
        "For certain IT professionals without a university degree, at least three years of relevant academic-level IT experience within the past seven years may provide a route, subject to the position, salary and other conditions. This is not a general exemption from qualification requirements for other professions.",
        "The EU Blue Card is generally issued for the employment contract period <strong>plus three months</strong>, with an overall maximum of four years. Renewals are possible if the requirements remain satisfied.",
        "During the first 12 months of Blue Card employment you must notify the immigration authority (<em>Ausländerbehörde</em>) about a job change. Prior permission is generally not required, but the authority may check whether the new employment meets the Blue Card conditions and temporarily suspend the change under statutory rules.",
        "Losing a job does not mean that the Blue Card automatically expires on the same day. The competent immigration authority must assess the individual situation and whether other employment or job-search residence options are available.",
        "Facilitated rules may apply to spouses and children. With the required employment, pension contributions and German language knowledge, Blue Card holders can potentially apply for a settlement permit (<em>Niederlassungserlaubnis</em>) after 27 months, or after 21 months with B1 German. Other statutory requirements still apply.",
        "<ul><li>Contract or qualifying job offer, term and annual gross salary</li><li>Academic/tertiary qualification or relevant IT experience evidence</li><li>Match between employment and qualification or expertise</li><li>Reason for applying the reduced salary threshold, if relevant</li><li>Professional licence for regulated occupations</li><li>Separate documents for family members where applicable</li></ul>",
        "First check the salary, job and qualification requirements. Next, compare the result against the current government guidance and §18g AufenthG. If you have a complicated employment or family situation, contact the competent immigration authority before relying on a general guide.",
        "<ul><li><a href=\"https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card\" target=\"_blank\" rel=\"noopener\">Make it in Germany — EU Blue Card</a></li><li><a href=\"https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html\" target=\"_blank\" rel=\"noopener\">German Residence Act §18g</a></li></ul>"
      ],
      updated:"Reviewed against official guidance on 12 November 2026. This page is general guidance; only the competent authority can issue a binding decision.",
      turkish:"Detailed tool available in Turkish",salary:"2026 salary thresholds"
    },
    de:{
      title:"Blaue Karte EU 2026: Voraussetzungen, Gehalt und Niederlassung",
      desc:"Ausführlicher Ratgeber zur Blauen Karte EU: Gehaltsgrenzen 2026, Qualifikation, IT-Sonderregelung, Familiennachzug und Niederlassungserlaubnis.",
      badge:"Blaue Karte EU · Entscheidungsratgeber 2026",
      h1:"Blaue Karte EU 2026: Erfüllen Sie die Voraussetzungen?",
      intro:"Nicht allein das Gehalt entscheidet. Vertragslaufzeit, Qualifikation oder IT-Erfahrung, Bezug der Beschäftigung zur Qualifikation, Berufszulassung und die zutreffende Gehaltsgrenze müssen geprüft werden.",
      cta:"Voraussetzungen prüfen (Rechner auf Türkisch)",alt:"Gehaltsangebot prüfen (Türkischer Ratgeber)",
      quick:"Das Wichtigste in 30 Sekunden",
      facts:["Reguläre Jahresbruttogrenze: <strong>50.700 €</strong>","Ermäßigte Grenze für berechtigte Fälle: <strong>45.934,20 €</strong>","Konkretes Arbeitsangebot für mindestens <strong>sechs Monate</strong>","Bestimmte <strong>IT-Fachkräfte</strong> können sich ohne Abschluss qualifizieren","Niederlassungserlaubnis unter Umständen nach <strong>27 Monaten / mit B1 nach 21 Monaten</strong>"],
      toc:"In diesem Ratgeber",
      heads:["Für wen ist die Blaue Karte EU geeignet?","Entscheidungsbaum mit fünf Prüfungen","Die Gehaltsgrenzen 2026 richtig einordnen","IT-Fachkräfte ohne Hochschulabschluss","Wie lange ist die Blaue Karte gültig?","Arbeitgeberwechsel innerhalb der ersten zwölf Monate","Was passiert bei Arbeitsplatzverlust?","Familiennachzug und Niederlassung","Checkliste für den Antrag","Die nächsten Schritte","Amtliche Quellen"],
      paragraphs:[
        "Die Blaue Karte EU ist ein Aufenthaltstitel nach §18g AufenthG für qualifizierte Drittstaatsangehörige mit einer entsprechenden Beschäftigung in Deutschland. Im Regelfall sind ein Hochschulabschluss oder eine vergleichbare tertiäre Qualifikation und eine geeignete Beschäftigung erforderlich. Bestimmte IT-Fachkräfte können über eine Sonderregelung auch ohne formalen Hochschulabschluss berücksichtigt werden.",
        "<ol><li><strong>Liegt ein konkretes Arbeitsangebot für mindestens sechs Monate vor?</strong></li><li><strong>Ist ein geeigneter Qualifikationsweg vorhanden?</strong> Hochschulabschluss oder besondere IT-Erfahrung.</li><li><strong>Passt die Beschäftigung zur Qualifikation oder Expertise?</strong></li><li><strong>Welche Gehaltsgrenze gilt?</strong> Die reguläre oder eine ausdrücklich zulässige ermäßigte Grenze.</li><li><strong>Ist der Beruf reglementiert?</strong> Dann gelten weitere Zulassungsvoraussetzungen.</li></ol><p>Ein ausreichendes Gehalt allein garantiert keine Genehmigung.</p>",
        "Im Jahr 2026 beträgt das reguläre Mindestjahresbruttogehalt <strong>50.700 €</strong>. Die ermäßigte Grenze von <strong>45.934,20 €</strong> kann für berechtigte Engpassberufe, bestimmte Berufseinsteiger und qualifizierte IT-Spezialisten gelten. Ein niedrigeres Gehalt allein begründet keine Berechtigung. In bestimmten Fällen ist die Zustimmung der Bundesagentur für Arbeit erforderlich.",
        "Für bestimmte IT-Fachkräfte ohne Hochschulabschluss kann eine mindestens dreijährige einschlägige Berufserfahrung auf vergleichbarem Niveau innerhalb der letzten sieben Jahre relevant sein. Beschäftigung, Gehalt und die übrigen Voraussetzungen müssen passen. Dies ist keine allgemeine Ausnahme für andere Berufe.",
        "Die Blaue Karte EU wird bei befristeten Arbeitsverträgen grundsätzlich für die Vertragslaufzeit <strong>zuzüglich drei Monaten</strong> ausgestellt, maximal jedoch für vier Jahre. Eine Verlängerung ist bei fortbestehenden Voraussetzungen möglich.",
        "Während der ersten zwölf Monate einer Beschäftigung mit der Blauen Karte muss ein Arbeitgeberwechsel der Ausländerbehörde mitgeteilt werden. Eine vorherige Genehmigung ist grundsätzlich nicht in jedem Fall nötig. Die Behörde darf die Voraussetzungen der neuen Tätigkeit prüfen und den Wechsel im gesetzlichen Rahmen vorübergehend aussetzen.",
        "Der Verlust der Arbeitsstelle führt nicht automatisch am selben Tag zum Erlöschen der Blauen Karte. Die zuständige Ausländerbehörde muss den Einzelfall und mögliche andere Beschäftigungs- oder Aufenthaltsperspektiven prüfen.",
        "Für Ehepartner und Kinder können erleichterte Regelungen gelten. Wer die erforderliche Beschäftigung, Rentenbeiträge und Deutschkenntnisse nachweist, kann unter den gesetzlichen Bedingungen eine Niederlassungserlaubnis nach 27 Monaten oder mit B1-Deutsch nach 21 Monaten beantragen. Weitere Voraussetzungen bleiben zu beachten.",
        "<ul><li>Arbeitsvertrag oder Angebot mit Dauer und Jahresbruttogehalt</li><li>Abschlussnachweis oder Belege für den IT-Sonderweg</li><li>Zusammenhang zwischen Beschäftigung und Qualifikation</li><li>Begründung für eine ermäßigte Gehaltsgrenze, falls relevant</li><li>Berufszulassung in reglementierten Berufen</li><li>Gegebenenfalls gesonderte Unterlagen für Familienmitglieder</li></ul>",
        "Prüfen Sie zuerst Gehalt, Tätigkeit und Qualifikation. Vergleichen Sie das Ergebnis anschließend mit aktuellen amtlichen Informationen und §18g AufenthG. Bei besonderen Vertrags- oder Familiensituationen sollte die zuständige Ausländerbehörde einbezogen werden.",
        "<ul><li><a href=\"https://www.make-it-in-germany.com/de/visum-aufenthalt/arten/blaue-karte-eu\" target=\"_blank\" rel=\"noopener\">Make it in Germany — Blaue Karte EU</a></li><li><a href=\"https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html\" target=\"_blank\" rel=\"noopener\">Aufenthaltsgesetz §18g</a></li></ul>"
      ],
      updated:"Am 12. November 2026 anhand amtlicher Informationen geprüft. Dieser Ratgeber dient der Orientierung; verbindlich entscheidet die zuständige Behörde.",
      turkish:"Ausführlicher Rechner auf Türkisch",salary:"Gehaltsgrenzen 2026"
    }
  }
};
const SITE="https://almanyapusulasi.de";
function render(lang,slug,d){
 const path="/"+lang+"/"+slug+"/";
 const base=SITE+path;
 const tool="/blue-card-uygunluk-kontrolu-2026/";
 const salary="/blue-card-maas-sarti/";
 const toc=d.heads.map((h,i)=>'<a href="#section-'+(i+1)+'">'+h+'</a>').join("");
 const sections=d.heads.map((h,i)=>'<h2 id="section-'+(i+1)+'">'+h+'</h2><div>'+d.paragraphs[i]+'</div>').join("");
 const alternate='<link rel="alternate" hreflang="tr" href="'+SITE+'/'+slug+'/"><link rel="alternate" hreflang="en" href="'+SITE+'/en/'+slug+'/"><link rel="alternate" hreflang="de" href="'+SITE+'/de/'+slug+'/">';
 return '<!DOCTYPE html><html lang="'+lang+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>'+d.title+'</title><meta name="description" content="'+d.desc+'"><link rel="canonical" href="'+base+'">'+alternate+'<link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/v42-preview.css"><script defer src="/assets/js/analytics-consent.js"></script></head><body class="v41-preview v42-preview page-rehber"><header class="site-header"></header><main><section class="hero"><div class="container hero-grid"><div><span class="badge">'+d.badge+'</span><h1>'+d.h1+'</h1><p>'+d.intro+'</p><div class="hero-actions"><a class="btn btn-primary" href="'+tool+'" lang="tr" hreflang="tr">'+d.cta+' →</a><a class="btn btn-secondary" href="'+salary+'" lang="tr" hreflang="tr">'+d.alt+'</a></div></div><div class="trust-card"><h3>'+d.quick+'</h3><ul class="trust-list">'+d.facts.map(f=>'<li>'+f+'</li>').join('')+'</ul></div></div></section><section class="section"><div class="container"><div class="reading-body"><div class="v42-page-label">'+d.toc+'</div>'+sections+'<div class="info-box">'+d.updated+'</div><div class="info-box">'+d.turkish+': <a href="'+tool+'" lang="tr" hreflang="tr">'+d.cta+'</a></div></div><aside class="v41-toc" aria-label="'+d.toc+'"><b>'+d.toc+'</b>'+toc+'</aside></div></section></main><footer class="footer"></footer></body></html>';
}
for(const [slug,translations] of Object.entries(pages)){
 for(const [lang,d] of Object.entries(translations)){
  assert.equal(d.heads.length,d.paragraphs.length,"title-content parity");
  const path=lang+'/'+slug+'/index.html';
  fs.mkdirSync(lang+'/'+slug,{recursive:true});
  fs.writeFileSync(path,render(lang,slug,d));
 }
}
console.log("Generated verified EN/DE Blue Card guide pages");
