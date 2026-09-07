from pathlib import Path
import difflib
import itertools
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


def similarity(a, b):
    return difflib.SequenceMatcher(None, comparable(a), comparable(b)).ratio()


def comparable_answers(values):
    return tuple(comparable(v) for v in (values or []))


def best_answer_alignment(source_answers, stored_answers):
    if len(source_answers) != 4 or len(stored_answers) != 4:
        return None, 0.0, 0.0
    scores = [[similarity(src, stored) for stored in stored_answers] for src in source_answers]
    ranked = []
    for perm in itertools.permutations(range(4)):
        per_item = [scores[i][perm[i]] for i in range(4)]
        ranked.append((sum(per_item) / 4.0, min(per_item), perm))
    ranked.sort(reverse=True, key=lambda x: x[0])
    best = ranked[0]
    second = ranked[1][0] if len(ranked) > 1 else 0.0
    return best[2], best[0], second


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
                        value["_reviewFile"] = path.name
                    merged[f"{path.name}:{key}"] = value
        except Exception as exc:
            print(f"WARNING: reviewed file unreadable {path}: {exc}")
    print(f"Loaded {len(merged)} reviewed Turkish translation records from {len(files)} file(s)")
    return merged


def find_reviewed(reviewed, german_question, german_answers, source_num):
    tq = comparable(german_question)
    ta = comparable_answers(german_answers)
    candidates = [v for v in reviewed.values() if isinstance(v, dict) and comparable(v.get("germanQuestion", "")) == tq]

    for c in candidates:
        stored = c.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and comparable_answers(stored) == ta:
            c = dict(c)
            c["_matchMode"] = "exact-fingerprint"
            return c

    target_set = sorted(ta)
    for c in candidates:
        stored = c.get("germanAnswers")
        if isinstance(stored, list) and len(stored) == 4 and sorted(comparable_answers(stored)) == target_set:
            c = dict(c)
            c["_matchMode"] = "set-fingerprint"
            return c

    source_key = clean_text(source_num)
    for c in candidates:
        trs = c.get("answers")
        if clean_text(c.get("_reviewKey", "")) == source_key and isinstance(trs, list) and len(trs) == 4 and all(clean_text(v) for v in trs):
            c = dict(c)
            c["_matchMode"] = "legacy-source-order"
            return c

    # The technical mirror occasionally changes punctuation/wording/order while the
    # official BAMF question remains semantically identical. Use a conservative fuzzy
    # matcher only against records with a complete German answer fingerprint.
    fuzzy = []
    for c in reviewed.values():
        if not isinstance(c, dict):
            continue
        stored = c.get("germanAnswers")
        trs = c.get("answers")
        if not (isinstance(stored, list) and len(stored) == 4 and isinstance(trs, list) and len(trs) == 4):
            continue
        q_score = similarity(german_question, c.get("germanQuestion", ""))
        if q_score < 0.58:
            continue
        perm, a_score, second = best_answer_alignment(german_answers, stored)
        if perm is None:
            continue
        combined = 0.62 * q_score + 0.38 * a_score
        fuzzy.append((combined, q_score, a_score, a_score - second, c, perm))

    fuzzy.sort(reverse=True, key=lambda x: x[0])
    if fuzzy:
        best = fuzzy[0]
        runner_up = fuzzy[1][0] if len(fuzzy) > 1 else 0.0
        combined, q_score, a_score, perm_margin, c, perm = best
        # Require strong semantic agreement and a clear winner. This prevents a
        # translation from being attached to a merely similar political/history item.
        if combined >= 0.78 and q_score >= 0.66 and a_score >= 0.72 and (combined - runner_up) >= 0.025 and perm_margin >= 0.015:
            c = dict(c)
            c["_matchMode"] = "fuzzy-official"
            c["_fuzzyPermutation"] = list(perm)
            return c

    official = [c for c in candidates if c.get("officialOverride") is True]
    if len(official) == 1:
        c = dict(official[0])
        c["_matchMode"] = "official-override"
        return c
    if len(candidates) == 1:
        c = dict(candidates[0])
        c["_matchMode"] = "question-only"
        return c
    return {}


def align_reviewed_answers(override, actual):
    trs = override.get("answers") if isinstance(override.get("answers"), list) else []
    if len(trs) != 4 or not all(clean_text(v) for v in trs):
        return ["", "", "", ""], False

    if override.get("_matchMode") == "legacy-source-order":
        return [clean_text(v) for v in trs], True

    des = override.get("germanAnswers") if isinstance(override.get("germanAnswers"), list) else []
    if len(des) != 4:
        return ["", "", "", ""], False

    pairs = {}
    for de, tr in zip(des, trs):
        k = comparable(de)
        tr = clean_text(tr)
        if not k or k in pairs or not tr:
            return ["", "", "", ""], False
        pairs[k] = tr

    aligned = [pairs.get(comparable(a), "") for a in actual]
    if all(aligned):
        return aligned, True

    perm, avg_score, second = best_answer_alignment(actual, des)
    if perm is None or avg_score < 0.72 or (avg_score - second) < 0.015:
        return ["", "", "", ""], False
    fuzzy_aligned = [clean_text(trs[perm[i]]) for i in range(4)]
    return (fuzzy_aligned, True) if all(fuzzy_aligned) else (["", "", "", ""], False)


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
        elif question == comparable("Die Landeshauptstadt von Brandenburg heißt ..."):
            q["num"] = "BB-7"
            q["a"] = "Potsdam."
            q["b"] = "Cottbus."
            q["c"] = "Brandenburg."
            q["d"] = "Frankfurt/Oder."
            q["solution"] = "a"
            repaired += 1
            print("QA: repaired Brandenburg capital question -> BB-7 / Potsdam")
        elif question == comparable("Die Landeshauptstadt von Hessen heißt ..."):
            q["num"] = "HE-7"
            q["a"] = "Kassel."
            q["b"] = "Darmstadt."
            q["c"] = "Frankfurt."
            q["d"] = "Wiesbaden."
            q["solution"] = "d"
            repaired += 1
            print("QA: repaired Hessen capital question -> HE-7 / Wiesbaden")
    return repaired


def compact(q, reviewed):
    question = clean_text(q.get("question", ""))
    source_answers = [clean_text(q.get(k, "")) for k in ("a", "b", "c", "d")]
    source_num = str(q.get("num", "")).strip()
    o = find_reviewed(reviewed, question, source_answers, source_num)

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
        "num": source_num,
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
            "matchMode": clean_text(o.get("_matchMode", "")),
            "source": "Almanya Pusulası editör kontrolü" if trq else "Türkçe çeviri henüz editör kontrolünde"
        }
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    reviewed = load_reviewed()

    req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/13.0"})
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
    expected_codes = {"BW","BY","BE","BB","HB","HH","HE","MV","NI","NW","RP","SL","SN","ST","SH","TH"}
    missing_codes = sorted(expected_codes - set(state_counts))
    if incomplete_states or missing_codes:
        raise ValueError(f"State dataset QA failed: counts={incomplete_states}, missing={missing_codes}")

    reviewed_count = sum(1 for q in questions if q["tr"].get("reviewed"))
    answer_count = sum(1 for q in questions if q["tr"].get("answersReviewed"))
    general_reviewed = sum(1 for q in general if q["tr"].get("reviewed"))
    general_answers_reviewed = sum(1 for q in general if q["tr"].get("answersReviewed"))
    mapped_official_numbers = len({q["officialNumber"] for q in general if q.get("officialNumber")})
    match_modes = {}
    for q in general:
        mode = q["tr"].get("matchMode") or "unmatched"
        match_modes[mode] = match_modes.get(mode, 0) + 1

    q15 = next((q for q in general if comparable(q["question"]) == comparable("Was verbietet das deutsche Grundgesetz?")), None)
    if not q15 or q15["solution"] != "b" or not q15["tr"].get("reviewed") or not q15["tr"].get("answersReviewed"):
        raise ValueError("Grundgesetz/Zwangsarbeit regression QA failed")

    q_may8 = next((q for q in general if comparable(q["question"]) == comparable("Was war am 8. Mai 1945?")), None)
    if not q_may8 or not q_may8["tr"].get("reviewed") or not q_may8["tr"].get("answersReviewed"):
        raise ValueError("8 May 1945 Turkish translation regression QA failed")

    payload = {
        "meta": {
            "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
            "officialCatalogStand": "07.05.2025",
            "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
            "translationPolicy": "Only Almanya Pusulası-reviewed Turkish is published. German question/answer fingerprints are matched exactly first; conservative fuzzy matching is used only for technical-mirror wording variants.",
            "translationQa": {
                "reviewedQuestions": reviewed_count,
                "fingerprintVerifiedAnswerSets": answer_count,
                "reviewedGeneralQuestions": general_reviewed,
                "verifiedGeneralAnswerSets": general_answers_reviewed,
                "mappedOfficialGeneralNumbers": mapped_official_numbers,
                "matchModes": match_modes,
                "officialRepairs": repaired
            },
            "datasetQa": {
                "answeredGeneralQuestions": len(general),
                "stateQuestions": len(states),
                "stateCounts": state_counts,
                "incompleteStateSets": incomplete_states
            },
            "note": "German questions and answers follow the current official catalog. Turkish translations and explanations are study aids, not official BAMF translations."
        },
        "questions": questions
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Generated study dataset: {len(general)} general + {len(states)} state questions")
    print(f"Turkish QA: general reviewed={general_reviewed}/300; verified answer sets={general_answers_reviewed}/300; official numbers mapped={mapped_official_numbers}/300")
    print(f"Translation match modes: {match_modes}")
    print("State QA passed: all 16 Bundesländer contain 10 questions")
    print("Regression QA passed: Grundgesetz/Zwangsarbeit and 8 May 1945 translations are complete")


if __name__ == "__main__":
    main()
