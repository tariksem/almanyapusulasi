from pathlib import Path
import json
import re
import urllib.request

SOURCE = "https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json"
OUT = Path("assets/data/einbuergerungstest.json")
REVIEWED_GLOB = "einbuergerungstest-tr-reviewed*.json"
REVIEWED_DIR = Path("data")

def clean_text(value): return re.sub(r"\s+", " ", str(value or "")).strip()
def comparable(value): return clean_text(value).replace("…", "...").casefold()
def comparable_answers(values): return tuple(comparable(v) for v in (values or []))

def load_reviewed():
    merged={}; files=sorted(REVIEWED_DIR.glob(REVIEWED_GLOB))
    for path in files:
        try:
            raw=json.loads(path.read_text(encoding="utf-8"))
            if isinstance(raw,dict):
                for key,value in raw.items(): merged[f"{path.name}:{key}"]=value
        except Exception as exc: print(f"WARNING: reviewed file unreadable {path}: {exc}")
    print(f"Loaded {len(merged)} reviewed Turkish translation records from {len(files)} file(s)")
    return merged

def find_reviewed(reviewed,german_question,german_answers):
    tq=comparable(german_question); ta=comparable_answers(german_answers)
    candidates=[v for v in reviewed.values() if isinstance(v,dict) and comparable(v.get("germanQuestion",""))==tq]
    for c in candidates:
        stored=c.get("germanAnswers")
        if isinstance(stored,list) and len(stored)==4 and comparable_answers(stored)==ta: return c
    target_set=sorted(ta)
    for c in candidates:
        stored=c.get("germanAnswers")
        if isinstance(stored,list) and len(stored)==4 and sorted(comparable_answers(stored))==target_set: return c
    official=[c for c in candidates if c.get("officialOverride") is True]
    if len(official)==1:return official[0]
    if len(candidates)==1:return candidates[0]
    return {}

def align_reviewed_answers(override,actual):
    trs=override.get("answers") if isinstance(override.get("answers"),list) else []
    des=override.get("germanAnswers") if isinstance(override.get("germanAnswers"),list) else []
    if len(trs)!=4 or len(des)!=4:return ["","","",""],False
    pairs={}
    for de,tr in zip(des,trs):
        k=comparable(de)
        if not k or k in pairs or not clean_text(tr):return ["","","",""],False
        pairs[k]=clean_text(tr)
    aligned=[pairs.get(comparable(a),"") for a in actual]
    return (aligned,True) if all(aligned) else (["","","",""],False)

def compact(q,reviewed):
    question=clean_text(q.get("question","")); answers=[clean_text(q.get(k,"")) for k in ("a","b","c","d")]
    o=find_reviewed(reviewed,question,answers)
    trq=clean_text(o.get("question","")); tre=clean_text(o.get("explanation",""))
    tra,answers_reviewed=align_reviewed_answers(o,answers)
    return {"num":str(q.get("num","")).strip(),"id":q.get("id",""),"question":question,"answers":answers,"solution":clean_text(q.get("solution","")).lower(),"image":q.get("image",""),"context":clean_text(q.get("context","")),"category":q.get("category") or "General","tr":{"question":trq,"answers":tra if answers_reviewed else ["","","",""],"context":tre if trq else "","reviewed":bool(trq),"answersReviewed":answers_reviewed,"source":"Almanya Pusulası editör kontrolü" if trq else "Türkçe çeviri henüz editör kontrolünde"}}

def main():
    OUT.parent.mkdir(parents=True,exist_ok=True); reviewed=load_reviewed()
    req=urllib.request.Request(SOURCE,headers={"User-Agent":"AlmanyaPusulasi-Einbuergerungstest-Sync/10.0"})
    with urllib.request.urlopen(req,timeout=45) as res: raw=json.load(res)
    general_raw=[q for q in raw if str(q.get("num","")).isdigit() and int(str(q.get("num")))<=300]
    missing_solution=[q for q in general_raw if not clean_text(q.get("solution",""))]
    for q in missing_solution: print(f"QA: upstream unanswered item excluded: num={q.get('num')} question={clean_text(q.get('question'))}")
    questions=[compact(q,reviewed) for q in raw if q.get("question") and clean_text(q.get("solution",""))]
    general=[q for q in questions if q["num"].isdigit() and int(q["num"])<=300]
    states=[q for q in questions if not(q["num"].isdigit() and int(q["num"])<=300)]
    if len(general)<299: raise ValueError(f"Expected at least 299 answered general questions, got {len(general)}")
    reviewed_count=sum(1 for q in questions if q["tr"].get("reviewed")); answer_count=sum(1 for q in questions if q["tr"].get("answersReviewed"))
    payload={"meta":{"officialCatalog":"BAMF Gesamtfragenkatalog zum Test Leben in Deutschland und Einbürgerungstest","officialCatalogStand":"07.05.2025","translationPolicy":"Only Almanya Pusulası-reviewed Turkish is published; upstream AI Turkish is never used.","translationQa":{"reviewedQuestions":reviewed_count,"fingerprintVerifiedAnswerSets":answer_count,"upstreamUnansweredGeneralItems":len(missing_solution)},"datasetQa":{"answeredGeneralQuestions":len(general),"stateQuestions":len(states)},"note":"Turkish translations and explanations are study aids, not official BAMF translations."},"questions":questions}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print(f"Generated study dataset: {len(general)} answered general + {len(states)} state questions; reviewed Turkish={reviewed_count}; verified answer sets={answer_count}")

if __name__=="__main__": main()
