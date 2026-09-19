# Almanya Pusulası — Master Plan Status

Last updated: 2026-09-19

## Current phase

**Phase 4 — Acquisition / Traffic Growth (ACTIVE)**

The technical, content-quality and monetization foundations are largely in place. The current bottleneck is qualified traffic, not affiliate-slot availability.

## Completed foundations

- Cloudflare production deploy + smoke tests
- Site Quality Audit and canonical/internal-link guards
- Consent-aware commercial tracking
- Verified configuration for revenue-critical TARIFCHECK/CHECK24 slots
- P0 decision/conversion funnels for Kfz, Girokonto, Kredit, Kreditkarte, Strom, Risikoleben, Familienleistungen, Elterngeld, Wohngeld/Miet-Budget and Auto-Kosten
- Curated sitemap families and IndexNow workflow

## Search Console baseline

Finalized GSC period: **2026-08-20 → 2026-09-16**
Comparison period: **2026-07-23 → 2026-08-19**

- Clicks: **16** (previous 0)
- Impressions: **76** (previous 45)
- CTR: **21.1%**
- Average position: **42.1**, improved from **51.9**
- Data is sparse; do not infer stable conversion behavior yet.

High-opportunity pages receiving first-page tests but no clicks in this window:
- Blue Card eligibility checker — 6 impressions, avg position 3.3
- Chancenkarte points calculator — 6 impressions, avg position 3.7
- Kinderzuschlag eligibility checker — 5 impressions, avg position 4.8
- Bank selector — 5 impressions, avg position 6.0
- Brutto-Netto calculator — 5 impressions, avg position 6.2

Kinderzuschlag guide produced 2 clicks / 45 impressions.

## Acquisition P0 actions closed 2026-09-19

- Search-opportunity tools promoted from the homepage.
- Titles/meta descriptions aligned with Turkish/German search intent for Blue Card, Chancenkarte, Kinderzuschlag, Girokonto/Basiskonto and Brutto-Netto.
- Kredit, Kreditkarte, Risikoleben and credit-selector pages added to commercial/finance sitemap coverage.
- IndexNow expanded so changed sitemap files submit their URLs after successful deploy.
- CI acquisition guard added.

## Active blockers

1. Traffic scale is too small for conversion optimization.
2. Metricool Facebook/Instagram post on 2026-09-19 failed with `You have reached your Metricool account limit.`; do not buy a plan automatically.
3. Wise is deliberately deferred by owner.
4. No genuine partner-side sale/commission evidence yet; do not generate synthetic clicks.

## Next operating target

- Review settled GSC every 7–14 days.
- Prioritize positions 2–15 with zero/low clicks, new query/page matches and cannibalization.
- Push traffic to pages already receiving Google tests before broad new clusters.
- Use manual/direct social distribution while Metricool is blocked.
- Resume conversion reconciliation after meaningful affiliate-click volume exists.

## Exit criteria

Return to conversion optimization when the site reaches roughly **50–100 qualified visits/day** or a revenue funnel accumulates enough genuine affiliate clicks for page/placement comparison.

## Growth Sprint 1 — 2026-09-19

Status: **DEPLOYING / VALIDATING**

Actions:
- homepage search-opportunity block expanded to every meaningful GSC page signal, not only tools;
- Kinderzuschlag flagship aligned to actual GSC queries: “kinderzuschlag nedir”, “ne demek” and “antrag türkisch”;
- official BA application/form route surfaced without implying a Turkish official application form;
- core Kindergeld/KiZ/Wohngeld pages added to the family sitemap;
- GSC-supported retirement and Turkey-child pages strengthened with homepage links and priority-sitemap freshness;
- acquisition CI guard expanded to protect these routes.

Measurement: wait for finalized GSC data before another snippet rewrite; compare impressions, clicks, CTR and average position for the same pages after the next settled window.

## Growth Sprint 2 — Kindergeld query capture — 2026-09-19

Status: **DEPLOYING / VALIDATING**

GSC evidence: query `almanya da çocuk yardımı ne kadar 2026` appeared at average position ~11 with no click in the finalized window.

Actions:
- canonical `/kindergeld/` title/meta aligned to the Turkish “Almanya çocuk parası” wording while retaining the official term Kindergeld;
- exact answer heading added: “Almanya'da çocuk parası ne kadar 2026?”;
- answer states the official 2026 amount, 259 € per eligible child, without creating a duplicate URL;
- priority sitemap freshness updated;
- acquisition guard now protects this query-intent alignment.

Measurement rule: judge only after new finalized GSC data arrives; do not rewrite the snippet again on same-day evidence.
