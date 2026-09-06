from pathlib import Path
import json
import re
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")

# Upstream translations are AI-generated and occasionally contain untranslated German,
# broken line-wrap grammar or generic/non-explanatory context. Never publish those blindly.
GERMAN_MARKERS = re.compile(
    r"\b(der|die|das|den|dem|des|ein|eine|einer|einem|einen|und|oder|ist|sind|war|waren|"
    r"wird|werden|hat|haben|für|mit|von|zur|zum|bei|auf|nicht|Bundeskanzler|Bundestag|"
    r"Bundesrat|Grundgesetz|Deutschland|Deutschen|deutsche|Recht|Gesetz)\b",
    re.IGNORECASE,
)
GENERIC_CONTEXT = {
    "almanya'daki hayat için önemli bir soru",
    "almanya'da yaşam için önemli bir soru",
    "almanya'daki yaşam için önemli bir soru",
}


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def looks_broken_turkish(value, german_source=""):
    text = clean_text(value)
    if not text:
        return True
    low = text.casefold()
    # Typical damaged line-wrap translations such as "... neler vardı? Almanya mı?"
    if "almanya mı?" in low or "almanya mı" in low:
        return True
    # An answer copied from German verbatim is not a Turkish translation. Proper names,
    # dates and short universal labels are allowed by requiring alphabetic multiword text.
    source = clean_text(german_source)
    if text == source and len(re.findall(r"[A-Za-zÄÖÜäöüß]+", source)) >= 2:
        return True
    # Flag clearly German clauses accidentally left inside Turkish text. One isolated
    # institutional proper noun is tolerated; multiple markers indicate a bad translation.
    markers = GERMAN_MARKERS.findall(text)
    if len(markers) >= 2:
        return True
    return False


def safe_tr(value, german_source=""):
    text = clean_text(value)
    return "" if looks_broken_turkish(text, german_source) else text


def safe_context(value):
    text = clean_text(value)
    if not text or text.casefold() in GENERIC_CONTEXT or looks_broken_turkish(text):
        return ""
    return text


def compact(q):
    tr = (q.get("translation") or {}).get("tr") or {}
    question = clean_text(q.get("question", ""))
    answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    return {
        "num": str(q.get("num", "")).strip(),
        "id": q.get("id", ""),
        "question": question,
        "answers": answers,
        "solution": str(q.get("solution", "")).strip().lower(),
        "image": q.get("image", ""),
        "context": clean_text(q.get("context", "")),
        "category": q.get("category") or "General",
        "tr": {
            "question": safe_tr(tr.get("question", ""), question),
            "answers": [safe_tr(tr.get(k, ""), answers[i]) for i, k in enumerate(("a", "b", "c", "d"))],
            "context": safe_context(tr.get("context", "")),
        },
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/2.0"})
        with urllib.request.urlopen(req, timeout=45) as res:
            raw = json.load(res)
        questions = [compact(q) for q in raw if q.get("question") and q.get("solution")]
        rejected_questions = sum(1 for q in questions if not q["tr"]["question"])
        rejected_answers = sum(1 for q in questions for a in q["tr"]["answers"] if not a)
        payload = {
            "meta": {
                "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
                "officialCatalogStand": "07.05.2025",
                "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
                "technicalMirror": "https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper",
                "technicalMirrorLicense": "MIT",
                "translationPolicy": "Turkish text is a learning aid. Automated upstream translations that fail local quality checks are suppressed instead of being shown as trustworthy translations.",
                "translationQa": {"rejectedQuestions": rejected_questions, "rejectedAnswers": rejected_answers},
                "note": "German questions and answers originate from the official BAMF catalog. Turkish translations and explanatory context are learning aids and are not official BAMF translations."
            },
            "questions": questions,
        }
        OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        general = sum(1 for q in questions if q["num"].isdigit() and int(q["num"]) <= 300)
        states = len(questions) - general
        print(f"Synced {len(questions)} questions: {general} general, {states} state entries")
        print(f"Turkish QA suppressed {rejected_questions} question translations and {rejected_answers} answer translations")
    except Exception as exc:
        print(f"WARNING: citizenship test sync failed: {exc}")
        if OUT.exists():
            print("Keeping existing local dataset.")
        else:
            print("No local dataset created; client will use the upstream fallback.")


if __name__ == "__main__":
    main()
