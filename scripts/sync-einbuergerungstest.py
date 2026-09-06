from pathlib import Path
import json
import re
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")
REVIEWED_GLOB = "einbuergerungstest-tr-reviewed*.json"
REVIEWED_DIR = Path("data")

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


def comparable(value):
    return clean_text(value).replace("…", "...").casefold()


def comparable_answers(values):
    return tuple(comparable(v) for v in (values or []))


def looks_broken_turkish(value, german_source=""):
    text = clean_text(value)
    if not text:
        return True
    low = text.casefold()
    if "almanya mı?" in low or "almanya mı" in low:
        return True
    source = clean_text(german_source)
    if text == source and len(re.findall(r"[A-Za-zÄÖÜäöüß]+", source)) >= 2:
        return True
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


def load_reviewed():
    merged = {}
    files = sorted(REVIEWED_DIR.glob(REVIEWED_GLOB))
    if not files:
        print("WARNING: no reviewed Turkish translation files found")
        return merged
    for path in files:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(raw, dict):
                print(f"WARNING: ignored non-object reviewed translation file: {path}")
                continue
            for key, value in raw.items():
                merged[f"{path.name}:{key}"] = value
        except Exception as exc:
            print(f"WARNING: reviewed Turkish translation file could not be read ({path}): {exc}")
    print(f"Loaded {len(merged)} reviewed Turkish translation records from {len(files)} file(s)")
    return merged


def find_reviewed(reviewed, german_question, german_answers):
    target_q = comparable(german_question)
    target_a = comparable_answers(german_answers)
    candidates = [
        value for value in reviewed.values()
        if isinstance(value, dict) and comparable(value.get("germanQuestion", "")) == target_q
    ]
    if not candidates:
        return {}

    # Strongest match: same German question AND the same four German answer choices.
    for candidate in candidates:
        stored = candidate.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and comparable_answers(stored) == target_a:
            return candidate

    # A small number of politically dynamic BAMF questions deliberately override a stale
    # technical mirror. They are explicitly marked and may therefore carry newer answers.
    official_overrides = [c for c in candidates if c.get("officialOverride") is True]
    if len(official_overrides) == 1:
        return official_overrides[0]

    # Old reviewed records did not always store answer fingerprints. Use them only when the
    # German question text is unique; never guess when duplicate question stems exist.
    if len(candidates) == 1:
        return candidates[0]
    return {}


def compact(q, reviewed):
    tr = (q.get("translation") or {}).get("tr") or {}
    question = clean_text(q.get("question", ""))
    answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    override = find_reviewed(reviewed, question, answers)

    auto_question = safe_tr(tr.get("question", ""), question)
    auto_answers = [safe_tr(tr.get(k, ""), answers[i]) for i, k in enumerate(("a", "b", "c", "d"))]
    auto_context = safe_context(tr.get("context", ""))

    reviewed_question = clean_text(override.get("question", ""))
    reviewed_answers = override.get("answers") if isinstance(override.get("answers"), list) else []
    reviewed_answers = [clean_text(v) for v in reviewed_answers]
    reviewed_explanation = clean_text(override.get("explanation", ""))
    is_reviewed = bool(reviewed_question and len(reviewed_answers) == 4 and all(reviewed_answers))

    override_de_answers = override.get("germanAnswers") if isinstance(override.get("germanAnswers"), list) else []
    override_de_answers = [clean_text(v) for v in override_de_answers]
    override_solution = clean_text(override.get("solution", "")).lower()
    has_official_override = bool(
        override.get("officialOverride") is True
        and len(override_de_answers) == 4
        and all(override_de_answers)
        and override_solution in ("a", "b", "c", "d")
    )
    final_answers = override_de_answers if has_official_override else answers
    final_solution = override_solution if has_official_override else str(q.get("solution", "")).strip().lower()

    return {
        "num": str(q.get("num", "")).strip(),
        "id": q.get("id", ""),
        "question": question,
        "answers": final_answers,
        "solution": final_solution,
        "image": q.get("image", ""),
        "context": clean_text(q.get("context", "")),
        "category": q.get("category") or "General",
        "officialOverride": has_official_override,
        "tr": {
            "question": reviewed_question if is_reviewed else auto_question,
            "answers": reviewed_answers if is_reviewed else auto_answers,
            "context": reviewed_explanation if is_reviewed else auto_context,
            "reviewed": is_reviewed,
            "source": "Almanya Pusulası editör kontrolü" if is_reviewed else "otomatik çeviri + yerel kalite filtresi",
        },
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    reviewed = load_reviewed()
    try:
        req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/6.0"})
        with urllib.request.urlopen(req, timeout=45) as res:
            raw = json.load(res)
        questions = [compact(q, reviewed) for q in raw if q.get("question") and q.get("solution")]
        rejected_questions = sum(1 for q in questions if not q["tr"]["question"])
        rejected_answers = sum(1 for q in questions for a in q["tr"]["answers"] if not a)
        reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
        official_overrides = sum(1 for q in questions if q.get("officialOverride"))
        payload = {
            "meta": {
                "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
                "officialCatalogStand": "07.05.2025",
                "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
                "technicalMirror": "https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper",
                "technicalMirrorLicense": "MIT",
                "translationPolicy": "Reviewed Almanya Pusulası Turkish overrides are matched against German source text and, where available, the German answer fingerprint. Explicit BAMF-current overrides can replace politically stale mirror answers. Unreviewed Turkish text is shown only after local quality checks.",
                "translationQa": {
                    "reviewedQuestions": reviewed_count,
                    "officialGermanOverrides": official_overrides,
                    "rejectedQuestions": rejected_questions,
                    "rejectedAnswers": rejected_answers,
                },
                "note": "German questions and answers originate from the official BAMF catalog. Turkish translations and explanatory context are learning aids and are not official BAMF translations."
            },
            "questions": questions,
        }
        OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        general = sum(1 for q in questions if q["num"].isdigit() and int(q["num"]) <= 300)
        states = len(questions) - general
        print(f"Synced {len(questions)} questions: {general} general, {states} state entries")
        print(f"Reviewed Turkish: {reviewed_count}; official German overrides: {official_overrides}; suppressed {rejected_questions} question translations and {rejected_answers} answer translations")
    except Exception as exc:
        print(f"WARNING: citizenship test sync failed: {exc}")
        if OUT.exists():
            print("Keeping existing local dataset.")
        else:
            print("No local dataset created; client will use the upstream fallback.")


if __name__ == "__main__":
    main()
