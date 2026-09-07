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

    # Strongest match: exact German question plus exact four-answer fingerprint.
    for candidate in candidates:
        stored = candidate.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and comparable_answers(stored) == target_a:
            return candidate

    # Politically dynamic BAMF questions can deliberately override a stale technical mirror.
    official_overrides = [c for c in candidates if c.get("officialOverride") is True]
    if len(official_overrides) == 1:
        return official_overrides[0]

    # Backward compatibility for older reviewed records: only allow a question-only match
    # if there is exactly one candidate. Duplicate stems are never guessed.
    if len(candidates) == 1:
        return candidates[0]
    return {}


def compact(q, reviewed):
    question = clean_text(q.get("question", ""))
    answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    override = find_reviewed(reviewed, question, answers)

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

    # Critical quality rule: unreviewed Turkish is blank, never machine-translated fallback.
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
            "question": reviewed_question if is_reviewed else "",
            "answers": reviewed_answers if is_reviewed else ["", "", "", ""],
            "context": reviewed_explanation if is_reviewed else "",
            "reviewed": is_reviewed,
            "source": "Almanya Pusulası editör kontrolü" if is_reviewed else "Türkçe çeviri henüz editör kontrolünde",
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

    # Guard the exact question that exposed the production translation bug.
    ns = next((q for q in questions if comparable(q["question"]) == comparable("Was gab es während der Zeit des Nationalsozialismus in Deutschland?")), None)
    if not ns:
        raise ValueError("NS regression question not found")
    expected = "Almanya'da Nasyonal Sosyalizm döneminde aşağıdakilerden hangisi vardı?"
    if ns["tr"]["question"] != expected or not ns["tr"].get("reviewed"):
        raise ValueError("NS Turkish translation regression check failed")

    return len(general), len(states), per_state


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    reviewed = load_reviewed()
    try:
        req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/7.0"})
        with urllib.request.urlopen(req, timeout=45) as res:
            raw = json.load(res)
        questions = [compact(q, reviewed) for q in raw if q.get("question") and q.get("solution")]
        general, states, per_state = validate_questions(questions)
        reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
        unreviewed_count = len(questions) - reviewed_count
        official_overrides = sum(1 for q in questions if q.get("officialOverride"))
        payload = {
            "meta": {
                "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
                "officialCatalogStand": "07.05.2025",
                "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
                "technicalMirror": "https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper",
                "technicalMirrorLicense": "MIT",
                "translationPolicy": "Strict reviewed-only Turkish. No upstream AI-generated Turkish text is published. Reviewed translations are matched against the German source question and, where available, the four-answer fingerprint. Unreviewed items remain German-only until editor review is complete.",
                "translationQa": {
                    "reviewedQuestions": reviewed_count,
                    "unreviewedQuestions": unreviewed_count,
                    "officialGermanOverrides": official_overrides,
                    "regressionChecks": ["NS question Turkish wording"],
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
        # Write only after every validation passes, so a bad sync cannot replace a good dataset.
        OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"Synced {len(questions)} questions: {general} general, {states} state entries")
        print(f"Reviewed Turkish: {reviewed_count}; unreviewed hidden: {unreviewed_count}; official German overrides: {official_overrides}")
        print("Regression QA passed: NS Turkish translation is reviewed and exact")
    except Exception as exc:
        print(f"WARNING: citizenship test sync failed: {exc}")
        if OUT.exists():
            print("Keeping existing local dataset.")
        else:
            print("No local dataset created. Client fallback remains German-only by policy and should not expose upstream Turkish translations.")


if __name__ == "__main__":
    main()
