# Almanya Pusulası — AdSense Content Quality Audit

Status: ACTIVE
Started: 2026-09-11
Trigger: Google AdSense review — “Düşük değere sahip içerik / Low value content”

## Objective

The recovery target is not more URLs. It is a materially higher ratio of original, decision-supporting, trustworthy pages across the indexable site.

Almanya Pusulası should answer four questions better than a generic article or translation:

1. **Bu bilgi benim durumum için geçerli mi?**
2. **Şimdi ne yapmalıyım?**
3. **Hangi belge, süre, eşik veya istisna kritik?**
4. **Bunu hangi resmî kaynaktan doğrulayabilirim?**

The site's defensible position is: **Turkish-language Germany decision and action guidance backed by primary sources**, not a high-volume generic news/blog portal.

## Audit classification

Every indexable editorial page will be assigned one of these states.

### A — Flagship / keep and strengthen

A page qualifies when it has a clear user problem, substantial original synthesis or functionality, actionable next steps, appropriate primary sources, current status/date and a distinct search intent.

Action: preserve URL; strengthen gaps; use as internal-link destination.

### B — Useful but insufficiently differentiated

The page answers the query but could be reproduced by translating/summarising public information. Typical missing elements: decision logic, scenarios, exceptions, checklist, process steps, practical consequences or strong source traceability.

Action: rebuild around user decisions before AdSense resubmission.

### C — Low-value risk

Thin, repetitive, stale, overlapping, weakly sourced or unclear-intent content. A page can also be C when its information is correct but adds little beyond another stronger page.

Action: merge into the canonical stronger page, substantially rewrite, or remove from index/sitemap when there is no independent user value.

### X — Utility / legal / navigation

Hubs, legal pages, calculators/tools and navigation pages are not judged like long-form articles. They must nevertheless have a clear purpose, usable navigation, accurate metadata and enough context for users to understand the function.

## Quality scorecard — editorial pages (100 points)

| Dimension | Points | Requirement |
| --- | ---: | --- |
| Search intent & direct answer | 15 | One clear problem; concise answer near top |
| Original decision value | 20 | Decision tree, interpretation, scenario, comparison logic or unique synthesis |
| Actionability | 15 | Concrete next steps/checklist/process |
| Primary-source traceability | 15 | Relevant official/primary sources tied to claims |
| Accuracy & freshness | 10 | Checked/updated date; draft vs enacted vs effective status where relevant |
| Exceptions & risk | 10 | Important edge cases, limitations and common mistakes |
| Internal journey | 5 | Meaningful next/previous related guides or tool |
| Trust/transparency | 5 | Editorial context, commercial separation where relevant |
| UX/readability | 5 | Scannable structure; mobile-friendly; no filler |

Classification guide:
- **A:** 80–100 and no critical defect
- **B:** 60–79 or one material differentiation gap
- **C:** <60, duplicate intent, stale critical facts, weak sourcing, or no meaningful independent value

Critical defects override the numerical score: unsupported high-stakes claim, misleading legal status, materially stale threshold, duplicate intent without a clear reason, or commercial copy presented as neutral editorial advice.

## Flagship rebuild template

Priority guides should converge on this structure where appropriate:

1. 30-second answer
2. Who this applies to / who it does not
3. Current rule/status and effective date
4. Decision tree or eligibility logic
5. Step-by-step process
6. Document/checklist section
7. Realistic example scenarios
8. Exceptions and common mistakes
9. “Şimdi ne yapmalısınız?” — 3 concrete actions
10. Official/primary sources
11. Related decision tool and sibling guides
12. Last checked / editorial transparency

Do not force sections that do not help the query. The template is a value checklist, not a word-count target.

## P0 audit batches

### Batch 1 — highest impact / YMYL / monetisation-adjacent

Audit first:
- Blue Card / settlement permit cluster
- citizenship cluster
- Kindergeld / Kinderzuschlag / family-benefit cluster
- SCHUFA cluster
- Anmeldung / renting / Nebenkosten cluster
- bank-account and comparison cluster
- insurance decision cluster
- health-insurance cluster
- tax cluster
- employment termination / unemployment cluster

### Batch 2 — arrival and daily-life journeys

- family reunification
- diploma recognition / job search / Chancenkarte / Ausbildung
- driving licence / car / Kfz
- electricity / internet / phone
- pension
- Germany–Turkey travel/customs/return topics

### Batch 3 — news and long-tail

News must earn indexability by answering:
- what changed;
- what did **not** change;
- who is affected;
- effective date/status;
- what action is needed;
- which evergreen guide should be updated.

A news item that merely restates an announcement is not sufficient.

## Initial repository findings

1. The repository already contains a technical `Site Quality Audit` workflow. It checks internal targets, viewport, canonical, title, meta description, H1 count and canonical diagnostics. This is useful but it does **not** measure substantive content quality.
2. The repository has a broad set of editorial URLs plus calculators/decision engines. This is an advantage only if weak/overlapping pages do not dilute the stronger material.
3. Existing decision engines/calculators should be treated as product assets and connected to the strongest evergreen guides rather than left as isolated utilities.
4. Commercial/affiliate infrastructure must remain secondary to editorial purpose during recovery. No unapproved partner links should be activated.
5. AdSense resubmission is a release gate, not a date. Do not request review merely because a fixed number of pages has been edited.

## P0 release gates

Do **not** request another AdSense review until all are true:

- [ ] All indexable editorial URLs have an A/B/C classification.
- [ ] No unresolved C page remains in the sitemap/index without a documented reason.
- [ ] Top 15–20 flagship guides meet A criteria or have documented exceptions.
- [ ] Critical YMYL claims have primary-source traceability and a current checked date.
- [ ] Duplicate/cannibalising intents are merged or clearly differentiated.
- [ ] Tools/calculators are linked from the relevant guides and explain their result/limitations.
- [ ] About/editorial/transparency pages clearly explain sourcing, updates, corrections and commercial independence.
- [ ] News pages meet the action-oriented news standard.
- [ ] Technical site-quality audit passes after content cleanup.
- [ ] Sitemap contains only intentional canonical/indexable URLs.
- [ ] Mobile navigation and content journeys remain usable after consolidation.

## Immediate execution order

1. Build URL inventory from repository/sitemap.
2. Score Batch 1 pages; record A/B/C and defect reason.
3. Identify duplicate-intent/merge candidates before rewriting anything.
4. Rebuild highest-impact B/C pages into flagship pages.
5. Strengthen editorial trust layer and tool-to-guide integration.
6. Repeat for Batch 2 and Batch 3.
7. Run technical audit, sitemap/indexability review and final AdSense readiness review.

## Non-goals

- No mass AI page generation.
- No arbitrary minimum word count.
- No copying or close paraphrasing competitors.
- No adding FAQ schema merely to create SERP surface.
- No affiliate-first rankings.
- No premature AdSense resubmission.

## Definition of success

A first-time Turkish-speaking user in Germany should be able to land on a page, determine whether the rule applies to them, understand the reason, see the important exceptions, complete the next step and verify the underlying rule from a primary source. If a page cannot materially help them do that, it must justify why it deserves a separate indexable URL.
