from pathlib import Path
import json
import re
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")
REVIEWED_GLOB = "einbuergerungstest-tr-reviewed*.json"
REVIEWED_DIR = Path("data")

# Turkish content is intentionally strict: only Almanya Pusulası-reviewed translations
# are published. Upstream Turkish text is AI-generated and may be inaccurate or awkward,
# so it is never shown to users as a fallback.


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def comparable(value):
    return clean_text(value).replace("…", "...").casefold()


def comparable_answers(values):
    return tuple(comparable(v) for v in (values or []))


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

    for candidate in candidates:
        stored = candidate.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and comparable_answers(stored) == target_a:
            return candidate

    # Same answer set but a different option order is still safe: answer translations
    # will be realigned by German answer text in align_reviewed_answers().
    target_set = sorted(target_a)
    for candidate in candidates:
        stored = candidate.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and sorted(comparable_answers(stored)) == target_set:
            return candidate

    official_overrides = [c for c in candidates if c.get("officialOverride") is True]
    if len(official_overrides) == 1:
        return official_overrides[0]

    # A unique question-only record is safe for the Turkish question/explanation text,
    # but its answer translations are NOT considered safe without a German fingerprint.
    if len(candidates) == 1:
        return candidates[0]
    return {}


def align_reviewed_answers(override, actual_german_answers):
    tr_answers = override.get("answers") if isinstance(override.get("answers"), list) else []
    de_answers = override.get("germanAnswers") if isinstance(override.get("germanAnswers"), list) else []
    if len(tr_answers) != 4 or len(de_answers) != 4:
        return ["", "", "", ""], False
    tr_answers = [clean_text(v) for v in tr_answers]
    de_answers = [clean_text(v) for v in de_answers]
    if not all(tr_answers) or not all(de_answers):
        return ["", "", "", ""], False

    pairs = {}
    for de, tr in zip(de_answers, tr_answers):
        key = comparable(de)
        if key in pairs:
            return ["", "", "", ""], False
        pairs[key] = tr

    aligned = []
    for answer in actual_german_answers:
        tr = pairs.get(comparable(answer))
        if not tr:
            return ["", "", "", ""], False
        aligned.append(tr)
    return aligned, True


def add_official_supplements(raw):
    question = "Was ist ein Beispiel für antisemitisches Verhalten?"
    if any(comparable(q.get("question", "")) == comparable(question) for q in raw):
        return raw

    used = {
        int(str(q.get("num", ""))) for q in raw
        if str(q.get("num", "")).isdigit() and 1 <= int(str(q.get("num"))) <= 300
    }
    missing = [n for n in range(1, 301) if n not in used]
    num = str(missing[0] if missing else 300)
    raw.append({
        "num": num,
        "id": "official-bamf-2025-antisemitism-example",
        "question": question,
        "a": "ein jüdisches Fest besuchen",
        "b": "die israelische Regierung kritisieren",
        "c": "den Holocaust leugnen",
        "d": "gegen Juden Fußball spielen",
        "solution": "c",
        "image": "",
        "context": "",
        "category": "History & Geography",
        "translation": None,
    })
    print(f"Added official BAMF supplement at internal question number {num}: antisemitism example")
    return raw


def compact(q, reviewed):
    question = clean_text(q.get("question", ""))
    answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    override = find_reviewed(reviewed, question, answers)

    reviewed_question = clean_text(override.get("question", ""))
    reviewed_explanation = clean_text(override.get("explanation", ""))
    question_reviewed = bool(reviewed_question)

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

    aligned_tr_answers, answers_reviewed = align_reviewed_answers(override, final_answers)

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
            "question": reviewed_question if question_reviewed else "",
            "answers": aligned_tr_answers if answers_reviewed else ["", "", "", ""],
            "context": reviewed_explanation if question_reviewed else "",
            "reviewed": question_reviewed,
            "answersReviewed": answers_reviewed,
            "source": "Almanya Pusulası editör kontrolü" if question_reviewed else "Türkçe çeviri henüz editör kontrolünde",
        },
    }


def validate_questions(questions):
    general = [q for q in questions if q["num"].isdigit() and int(q["num"]) <= 300]
    states = [q for q in questions if not (q["num"].isdigit() and int(q["num"]) <= 300)]
    if len(general) != 300:
        raise ValueError(f"Expected 300 general questions, got {len(general)}")

    per_state = {}
    for q in states:
        code = q["num"].split("-", 1)[0].upper() if "-" in q["num"] else "UNKNOWN"
        per_state[code] = per_state.get(code, 0) + 1
    bad_states = {code: count for code, count in per_state.items() if count != 10}
    if bad_states:
        raise ValueError(f"State question count validation failed: {bad_states}")

    ns = next((q for q in questions if comparable(q["question"]) == comparable("Was gab es während der Zeit des Nationalsozialismus in Deutschland?")), None)
    if not ns:
        raise ValueError("NS regression question not found")
    expected = "Almanya'da Nasyonal Sosyalizm döneminde aşağıdakilerden hangisi vardı?"
    if ns["tr"]["question"] != expected or not ns["tr"].get("reviewed"):
        raise ValueError("NS Turkish translation regression check failed")
    if not ns["tr"].get("answersReviewed"):
        raise ValueError("NS answer translations are not fingerprint-verified")
    expected_by_de = {
        comparable("das Recht zur freien Entfaltung der Persönlichkeit"): "Kişiliğini özgürce geliştirme hakkı",
        comparable("den Schutz der Menschenwürde"): "İnsan onurunun korunması",
        comparable("das Verbot von Parteien"): "Siyasi partilerin yasaklanması",
        comparable("Pressefreiheit"): "Basın özgürlüğü",
    }
    for de, tr in zip(ns["answers"], ns["tr"]["answers"]):
        if expected_by_de.get(comparable(de)) != tr:
            raise ValueError("NS Turkish answer alignment regression check failed")

    anti = next((q for q in questions if comparable(q["question"]) == comparable("Was ist ein Beispiel für antisemitisches Verhalten?")), None)
    if not anti or anti["solution"] != "c" or not anti["tr"].get("reviewed") or not anti["tr"].get("answersReviewed"):
        raise ValueError("Current BAMF antisemitism question regression check failed")

    return len(general), len(states), per_state


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    reviewed = load_reviewed()
    try:
        req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/9.0"})
        with urllib.request.urlopen(req, timeout=45) as res:
            raw = json.load(res)
        raw = add_official_supplements(raw)
        questions = [compact(q, reviewed) for q in raw if q.get("question") and q.get("solution")]
        general, states, per_state = validate_questions(questions)
        reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
        answers_reviewed_count = sum(1 for q in questions if q["tr"].get("answersReviewed"))
        unreviewed_count = len(questions) - reviewed_count
        official_overrides = sum(1 for q in questions if q.get("officialOverride"))
        payload = {
            "meta": {
                "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
                "officialCatalogStand": "07.05.2025",
                "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
                "technicalMirror": "https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper",
                "technicalMirrorLicense": "MIT",
                "translationPolicy": "Strict reviewed-only Turkish. Upstream AI Turkish is never published. Turkish answer translations are shown only when their German answer fingerprint is present and each translation is realigned to the actual German option order.",
                "translationQa": {
                    "reviewedQuestions": reviewed_count,
                    "fingerprintVerifiedAnswerSets": answers_reviewed_count,
                    "unreviewedQuestions": unreviewed_count,
                    "officialGermanOverrides": official_overrides,
                    "regressionChecks": ["NS Turkish wording", "NS answer fingerprint/order", "current BAMF antisemitism item"],
                },
                "datasetQa": {
                    "generalQuestions": general,
                    "stateQuestions": states,
                    "perState": per_state,
                },
                "note": "German questions and answers originate from the official BAMF catalog. Turkish translations and explanatory context are learning aids and are not official BAMF translations."
            },
            "questions": questions,
        }
        OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"Synced {len(questions)} questions: {general} general, {states} state entries")
        print(f"Reviewed Turkish questions: {reviewed_count}; fingerprint-verified answer sets: {answers_reviewed_count}; unreviewed hidden: {unreviewed_count}; official German overrides: {official_overrides}")
        print("Regression QA passed: NS wording/answer alignment and current BAMF antisemitism item")
    except Exception as exc:
        print(f"WARNING: citizenship test sync failed: {exc}")
        if OUT.exists():
            print("Keeping existing local dataset.")
        else:
            print("No local dataset created. Client fallback remains German-only by policy.")


if __name__ == "__main__":
    main()
