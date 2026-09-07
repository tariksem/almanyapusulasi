from pathlib import Path
import json
import re
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")
REVIEWED_GLOB = "einbuergerungstest-tr-reviewed*.json"
REVIEWED_DIR = Path("data")


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def comparable(value):
    return clean_text(value).replace("…", "...").casefold()


def comparable_answers(values):
    return tuple(comparable(v) for v in (values or []))


def load_reviewed():
    merged = {}
    files = sorted(REVIEWED_DIR.glob(REVIEWED_GLOB))
    for path in files:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                for key, value in raw.items():
                    merged[f"{path.name}:{key}"] = value
        except Exception as exc:
            print(f"WARNING: reviewed file unreadable {path}: {exc}")
    print(f"Loaded {len(merged)} reviewed Turkish translation records from {len(files)} file(s)")
    return merged


def find_reviewed(reviewed, german_question, german_answers):
    tq = comparable(german_question)
    ta = comparable_answers(german_answers)
    candidates = [v for v in reviewed.values() if isinstance(v, dict) and comparable(v.get("germanQuestion", "")) == tq]

    for c in candidates:
        stored = c.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and comparable_answers(stored) == ta:
            return c

    target_set = sorted(ta)
    for c in candidates:
        stored = c.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and sorted(comparable_answers(stored)) == target_set:
            return c

    official = [c for c in candidates if c.get("officialOverride") is True]
    if len(official) == 1:
        return official[0]
    if len(candidates) == 1:
        return candidates[0]
    return {}


def align_reviewed_answers(override, actual):
    trs = override.get("answers") if isinstance(override.get("answers"), list) else []
    des = override.get("germanAnswers") if isinstance(override.get("germanAnswers"), list) else []
    if len(trs) != 4 or len(des) != 4:
        return ["", "", "", ""], False

    pairs = {}
    for de, tr in zip(des, trs):
        k = comparable(de)
        tr = clean_text(tr)
        if not k or k in pairs or not tr:
            return ["", "", "", ""], False
        pairs[k] = tr

    aligned = [pairs.get(comparable(a), "") for a in actual]
    return (aligned, True) if all(aligned) else (["", "", "", ""], False)


def repair_official_items(raw):
    """Repair known gaps in the technical mirror using the current official BAMF catalog."""
    repaired = 0
    for q in raw:
        question = comparable(q.get("question", ""))
        if question == comparable("Was verbietet das deutsche Grundgesetz?"):
            q["a"] = "Militärdienst"
            q["b"] = "Zwangsarbeit"
            q["c"] = "freie Berufswahl"
            q["d"] = "Arbeit im Ausland"
            q["solution"] = "b"
            repaired += 1
            print("QA: repaired official BAMF item 'Was verbietet das deutsche Grundgesetz?' -> solution b")
    return repaired


def compact(q, reviewed):
    question = clean_text(q.get("question", ""))
    source_answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    o = find_reviewed(reviewed, question, source_answers)

    official_answers = o.get("germanAnswers") if isinstance(o.get("germanAnswers"), list) else []
    official_solution = clean_text(o.get("solution", "")).lower()
    use_override = bool(o.get("officialOverride") is True and len(official_answers) == 4 and all(clean_text(v) for v in official_answers) and official_solution in ("a", "b", "c", "d"))

    answers = [clean_text(v) for v in official_answers] if use_override else source_answers
    solution = official_solution if use_override else clean_text(q.get("solution", "")).lower()

    trq = clean_text(o.get("question", ""))
    tre = clean_text(o.get("explanation", ""))
    tra, answers_reviewed = align_reviewed_answers(o, answers)

    return {
        "num": str(q.get("num", "")).strip(),
        "id": q.get("id", ""),
        "question": question,
        "answers": answers,
        "solution": solution,
        "image": q.get("image", ""),
        "context": clean_text(q.get("context", "")),
        "category": q.get("category") or "General",
        "officialOverride": use_override,
        "tr": {
            "question": trq,
            "answers": tra if answers_reviewed else ["", "", "", ""],
            "context": tre if trq else "",
            "reviewed": bool(trq),
            "answersReviewed": answers_reviewed,
            "source": "Almanya Pusulası editör kontrolü" if trq else "Türkçe çeviri henüz editör kontrolünde"
        }
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    reviewed = load_reviewed()

    req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/11.0"})
    with urllib.request.urlopen(req, timeout=45) as res:
        raw = json.load(res)

    repaired = repair_official_items(raw)
    questions = [compact(q, reviewed) for q in raw if q.get("question") and clean_text(q.get("solution", ""))]

    general = [q for q in questions if q["num"].isdigit() and int(q["num"]) <= 300]
    states = [q for q in questions if not (q["num"].isdigit() and int(q["num"]) <= 300)]
    if len(general) != 300:
        raise ValueError(f"Expected exactly 300 answered general questions after official repairs, got {len(general)}")

    state_counts = {}
    for q in states:
        code = q["num"].split("-", 1)[0].upper() if "-" in q["num"] else "UNKNOWN"
        state_counts[code] = state_counts.get(code, 0) + 1
    incomplete_states = {code: count for code, count in state_counts.items() if count != 10}
    if incomplete_states:
        print(f"QA: state sets needing source repair: {incomplete_states}")

    reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
    answer_count = sum(1 for q in questions if q["tr"].get("answersReviewed"))
    general_reviewed = sum(1 for q in general if q["tr"].get("reviewed"))
    general_answers_reviewed = sum(1 for q in general if q["tr"].get("answersReviewed"))

    q15 = next((q for q in general if comparable(q["question"]) == comparable("Was verbietet das deutsche Grundgesetz?")), None)
    if not q15 or q15["solution"] != "b" or not q15["tr"].get("reviewed") or not q15["tr"].get("answersReviewed"):
        raise ValueError("Grundgesetz/Zwangsarbeit regression QA failed")

    payload = {
        "meta": {
            "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
            "officialCatalogStand": "07.05.2025",
            "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
            "translationPolicy": "Only Almanya Pusulası-reviewed Turkish is published; upstream AI Turkish is never used. Turkish answer translations are published only after German-answer fingerprint verification.",
            "translationQa": {
                "reviewedQuestions": reviewed_count,
                "fingerprintVerifiedAnswerSets": answer_count,
                "reviewedGeneralQuestions": general_reviewed,
                "verifiedGeneralAnswerSets": general_answers_reviewed,
                "officialRepairs": repaired
            },
            "datasetQa": {
                "answeredGeneralQuestions": len(general),
                "stateQuestions": len(states),
                "stateCounts": state_counts,
                "incompleteStateSets": incomplete_states
            },
            "note": "German questions and answers follow the current official BAMF catalog. Turkish translations and explanations are study aids, not official BAMF translations."
        },
        "questions": questions
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Generated study dataset: {len(general)} general + {len(states)} state questions")
    print(f"Turkish QA: general reviewed={general_reviewed}/300; verified answer sets={general_answers_reviewed}/300; all reviewed={reviewed_count}; all verified={answer_count}")
    print("Regression QA passed: Grundgesetz/Zwangsarbeit item is complete and Turkish fingerprint-verified")


if __name__ == "__main__":
    main()
