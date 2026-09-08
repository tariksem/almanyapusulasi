# NebenkostenCheck DE → AlmanyaPusulasi.de Web Integration Audit

Date: 2026-09-08
Branch: `feature/nebenkostencheck-web`

## Decision

The existing indexed route `/nebenkosten-abrechnung-kontrolu/` will remain the primary canonical tool URL. This avoids creating a second competing Nebenkosten tool URL and preserves existing internal links/SEO equity. The `/araclar/` hub will continue to link to this route.

## Current repository

- Site is static HTML/CSS/JavaScript; no `package.json` or application build system is present.
- Shared design tokens and responsive rules live in `assets/style.css`.
- Analytics is loaded through `assets/js/analytics-consent.js` and must not receive invoice values, dates, document text, names, IDs or other user-entered data.
- `/araclar/` already exists and already links to the legacy Nebenkosten tool.
- The legacy `/nebenkosten-abrechnung-kontrolu/` page currently performs only a simple monthly-advance × months calculation plus a basic 12-month receipt timing check.

## Integration architecture

Because the site has no build step, the portable NK-01 logic will be implemented as a browser-neutral JavaScript core, isolated from DOM rendering. It will use integer cents for money calculations and UTC-safe/calendar-safe date helpers. UI code will consume the core's stable result contract.

There must be one authoritative implementation of the web rules. Do not duplicate rule formulas in the page HTML.

Planned files:

- `assets/js/nebenkosten-core.js` — deterministic rules and parsing helpers.
- `assets/js/nebenkosten-tool.js` — browser UI, validation, result rendering, local-only history/report helpers and privacy-safe analytics events.
- `assets/nebenkosten-tool.css` — tool-specific mobile-first UI.
- `nebenkosten-abrechnung-kontrolu/index.html` — indexable landing page and application shell.

## Rules baseline

The original NK-01 rules R001–R007 are preserved as the first authoritative baseline:

1. billing period length,
2. landlord notification timing,
3. tenant review-deadline reminder,
4. cost-line sum,
5. balance calculation,
6. allocation calculation,
7. heating consumption percentage.

The web tool may add clearly separated screening helpers (warm-water split, potentially non-operating labels, caretaker separation, supporting-document request) without changing the semantics of R001–R007.

## Legal/product boundary

The tool is general information and calculation support, not legal advice. Result language must use neutral verbs such as `kontrol edin`, `açıklama isteyin`, `belgeleri inceleyin`. It must not state that a bill is legally invalid, that the user definitely has a claim/refund, or that payment should be withheld.

Official source baseline checked on 2026-09-08:

- BGB § 556 — annual operating-cost settlement framework and timing.
- BetrKV § 2 — operating-cost categories including Hauswart separation.
- HeizkostenV § 7 — generally 50–70% heat-consumption allocation, subject to statutory exceptions.
- HeizkostenV § 8 — generally 50–70% warm-water-consumption allocation.

## Data/privacy

- Manual invoice input is processed in the browser only.
- No user-entered financial value, date, free text, uploaded document text or identifier may be passed to GA4.
- Analytics may receive only coarse events such as tool start, step number, result status/count bucket, print/copy actions.
- Local history, if enabled, stays in `localStorage` and has a one-click delete action.
- Future PDF/OCR must require explicit confirmation of extracted critical values before high-severity findings are produced.

## UX requirements

- Mobile-first guided flow instead of a dense single form.
- Plain Turkish labels with the German document term shown secondarily.
- Immediate inline explanations and examples.
- Main result must answer within seconds: `Ne kadar Nachzahlung/Guthaben?` and `Neyi kontrol etmeliyim?`
- Technical rule IDs stay out of the primary UI.
- Missing data must produce `eksik veri`, never a false pass/fail conclusion.
- The user can reset the analysis at any time.

## SEO

- Keep `/nebenkosten-abrechnung-kontrolu/` self-canonical and indexable.
- Keep meaningful static explanatory HTML for no-JavaScript/search-engine rendering.
- Add FAQ structured data only for statements fully supported by the page/source text.
- Keep existing related Nebenkosten guides and link them bidirectionally.
- Do not create a duplicate `/araclar/nebenkostenabrechnung-kontrolu/` page unless a redirect/canonical migration is intentionally planned later.

## Test strategy

The source mobile repository itself is not currently accessible through the connected GitHub installation, so exact source-level port parity and the reported 130+ mobile tests cannot yet be asserted. The web implementation must therefore:

- reproduce the documented R001–R007 contracts exactly,
- include deterministic fixture tests for consistent bill, >12-month period, late receipt, wrong line sum, wrong balance, allocation mismatch, 40/60 heating split, 70/30 split, missing data, German/Turkish decimal formats, leap-year and month-end dates,
- avoid claiming mobile/web fixture parity until the original NK-01 source or fixture bundle is available.

## Delivery sequence

1. Replace legacy calculator with guided manual analysis and deterministic rule core.
2. Add robust results, sources, neutral next actions, report/letter helpers and local privacy controls.
3. Validate on mobile/desktop and run deterministic browser fixtures.
4. Add document/PDF extraction only after a de-identified document prototype proves extraction quality and performance.
5. Add OCR lazily and require confirmation before analysis.
