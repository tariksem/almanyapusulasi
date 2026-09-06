from pathlib import Path
import json
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")


def compact(q):
    tr = (q.get("translation") or {}).get("tr") or {}
    return {
        "num": str(q.get("num", "")).strip(),
        "id": q.get("id", ""),
        "question": q.get("question", ""),
        "answers": [q.get("a", ""), q.get("b", ""), q.get("c", ""), q.get("d", "")],
        "solution": str(q.get("solution", "")).strip().lower(),
        "image": q.get("image", ""),
        "context": q.get("context", ""),
        "category": q.get("category") or "General",
        "tr": {
            "question": tr.get("question", ""),
            "answers": [tr.get("a", ""), tr.get("b", ""), tr.get("c", ""), tr.get("d", "")],
            "context": tr.get("context", "")
        }
    }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(SOURCE, headers={"User-Agent": "AlmanyaPusulasi-Einbuergerungstest-Sync/1.0"})
        with urllib.request.urlopen(req, timeout=45) as res:
            raw = json.load(res)
        questions = [compact(q) for q in raw if q.get("question") and q.get("solution")]
        payload = {
            "meta": {
                "officialCatalog": "BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest",
                "officialCatalogStand": "07.05.2025",
                "officialCatalogUrl": "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile",
                "technicalMirror": "https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper",
                "technicalMirrorLicense": "MIT",
                "note": "German questions and answers originate from the official BAMF catalog. Turkish translations and explanatory context are learning aids and are not official BAMF translations."
            },
            "questions": questions
        }
        OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        general = sum(1 for q in questions if q["num"].isdigit() and int(q["num"]) <= 300)
        states = len(questions) - general
        print(f"Synced {len(questions)} questions: {general} general, {states} state entries")
    except Exception as exc:
        print(f"WARNING: citizenship test sync failed: {exc}")
        if OUT.exists():
            print("Keeping existing local dataset.")
        else:
            print("No local dataset created; client will use the upstream fallback.")


if __name__ == "__main__":
    main()
