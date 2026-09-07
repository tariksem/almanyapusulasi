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
    text = clean_text(value).casefold()
    replacements = {
        "…": "...", "„": '"', "“": '"', "”": '"', "‘": "'", "’": "'",
        "\u00ad": "", "\u200b": "", "fuеr": "für", "für": "für"
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\s*/\s*", "/", text)
    text = re.sub(r"[^0-9a-zäöüß]+", " ", text)
    return clean_text(text)


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
                    if isinstance(value, dict):
                        value = dict(value)
                        value["_reviewKey"] = key
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
    """Repair known gaps in the technical mirror using the current official catalog."""
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
            print("QA: repaired official item 'Was verbietet das deutsche Grundgesetz?' -> solution b")
    return repaired


def state_official_number(question):
    q = comparable(question)
    if "wappen" in q:
        return 1
    if "landkreis" in q or "stadtteil" in q:
        return 2
    if "für wie viele jahre" in q and ("landtag" in q or "landesparlament" in q or "bürgerschaft" in q or "abgeordnetenhaus" in q):
        return 3
    if "ab welchem alter" in q and "kommunalwahlen" in q:
        return 4
    if "farben" in q and "landesflagge" in q:
        return 5
    if "über politische themen informieren" in q:
        return 6
    if "landeshauptstadt" in q or "welches bundesland ist ein stadtstaat" in q:
        return 7
    if q.startswith("welches bundesland ist "):
        return 8
    if "regierungschef" in q or "regierungschefin" in q:
        return 9
    if ("welchen minister" in q or "welche ministerin" in q or "welchen senator" in q or "welche senatorin" in q) and "nicht" in q:
        return 10
    return None


def repair_and_renumber_states(raw):
    """Canonicalize state question numbers and add two capital-city items missing from the mirror."""
    state_rows = [q for q in raw if "-" in str(q.get("num", ""))]
    for q in state_rows:
        code = str(q.get("num", "")).split("-", 1)[0].upper()
        n = state_official_number(q.get("question", ""))
        if n:
            q["num"] = f"{code}-{n}"

    supplements = [
        {
            "num": "BB-7",
            "id": "official-bb-7-supplement",
            "question": "Die Landeshauptstadt von Brandenburg heißt ...",
            "a": "Potsdam.", "b": "Cottbus.", "c": "Brandenburg.", "d": "Frankfurt/Oder.",
            "solution": "a", "image": "", "context": "", "category": "General"
        },
        {
            "num": "HE-7",
            "id": "official-he-7-supplement",
            "question": "Die Landeshauptstadt von Hessen heißt ...",
            "a": "Kassel.", "b": "Darmstadt.", "c": "Frankfurt.", "d": "Wiesbaden.",
            "solution": "d", "image": "", "context": "", "category": "General"
        }
    ]
    existing = {(str(q.get("num", "")), comparable(q.get("question", ""))) for q in raw}
    added = 0
    for q in supplements:
        sig = (q["num"], comparable(q["question"]))
        if sig not in existing:
            raw.append(q)
            existing.add(sig)
            added += 1
    print(f"QA: state numbering canonicalized; official state supplements added={added}")
    return added


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
    review_key = clean_text(o.get("_reviewKey", ""))
    m = re.fullmatch(r"official-(\d{1,3})", review_key)
    official_number = int(m.group(1)) if m else None

    return {
        "num": str(q.get("num", "")).strip(),
        "officialNumber": official_number,
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

    req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/12.0"})
    with urllib.request.urlopen(req, timeout=45) as res:
        raw = json.load(res)

    repaired = repair_official_items(raw)
    state_supplements = repair_and_renumber_states(raw)
    questions = [compact(q, reviewed) for q in raw if q.get("question") and clean_text(q.get("solution", ""))]

    general = [q for q in questions if q["num"].isdigit() and int(q["num"]) <= 300]
    states = [q for q in questions if not (q["num"].isdigit() and int(q["num"]) <= 300)]
    if len(general) != 300:
        raise ValueError(f"Expected exactly 300 answered general questions after official repairs, got {len(general)}")

    state_counts = {}
    state_numbers = {}
    for q in states:
        code = q["num"].split("-", 1)[0].upper() if "-" in q["num"] else "UNKNOWN"
        state_counts[code] = state_counts.get(code, 0) + 1
        state_numbers.setdefault(code, set()).add(q["num"])
    incomplete_states = {code: count for code, count in state_counts.items() if count != 10}
    invalid_number_sets = {code: sorted(nums) for code, nums in state_numbers.items() if nums != {f"{code}-{i}" for i in range(1, 11)}}
    if incomplete_states or invalid_number_sets:
        raise ValueError(f"State dataset QA failed: counts={incomplete_states}, numbering={invalid_number_sets}")

    reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
    answer_count = sum(1 for q in questions if q["tr"].get("answersReviewed"))
    general_reviewed = sum(1 for q in general if q["tr"].get("reviewed"))
    general_answers_reviewed = sum(1 for q in general if q["tr"].get("answersReviewed"))
    mapped_official_numbers = len({q["officialNumber"] for q in general if q.get("officialNumber")})

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
                "mappedOfficialGeneralNumbers": mapped_official_numbers,
                "officialRepairs": repaired,
                "stateSupplements": state_supplements
            },
            "datasetQa": {
                "answeredGeneralQuestions": len(general),
                "stateQuestions": len(states),
                "stateCounts": state_counts,
                "incompleteStateSets": incomplete_states,
                "invalidStateNumberSets": invalid_number_sets
            },
            "note": "German questions and answers follow the current official catalog. Turkish translations and explanations are study aids, not official BAMF translations."
        },
        "questions": questions
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Generated study dataset: {len(general)} general + {len(states)} state questions")
    print(f"Turkish QA: general reviewed={general_reviewed}/300; verified answer sets={general_answers_reviewed}/300; official numbers mapped={mapped_official_numbers}/300")
    print("State QA passed: all 16 Bundesländer contain canonical questions 1-10")
    print("Regression QA passed: Grundgesetz/Zwangsarbeit item is complete and Turkish fingerprint-verified")


if __name__ == "__main__":
    main()
