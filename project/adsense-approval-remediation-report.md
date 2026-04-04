# BioLT AdSense Approval Remediation Report

## Goal

Lower the risk of another `low-value content` rejection by improving visible site quality, trust signals, and content usefulness for researchers.

## Key Risks Identified

1. Public-facing Korean copy had mojibake and broken strings on important pages.
2. Trust pages existed, but the wording did not look polished or complete enough for manual or automated quality review.
3. The homepage did not present the site mission and operator/contact details clearly enough at first glance.
4. Tool metadata and discovery pages had translation quality issues that reduced perceived quality.
5. Search Console verification and image accessibility signals were incomplete.

## Remediation Implemented

### 1. Public Quality and Trust Pages

- Rewrote `/about`
- Rewrote `/privacy`
- Rewrote `/terms`
- Rewrote `/editorial`

These pages now clearly explain:

- what BioLT is for
- who operates it
- how users should interpret results
- how browser data may be processed
- where users can contact the operator

### 2. Homepage and Discovery Improvements

- Rewrote the homepage copy for both English and Korean
- Made the site purpose visible above the fold
- Kept operator identity and contact email visible near the hero section
- Kept examples, guides, workflows, and the Genome Metadata Cleaner visible as content anchors

### 3. Translation Quality Improvements

- Replaced corrupted Korean strings in:
  - `apps/web/lib/i18n.ts`
  - `apps/web/lib/data/tools.ts`
  - `apps/web/lib/data/guides.ts`
  - `apps/web/lib/data/workflows.ts`
  - `apps/web/app/search/SearchClient.tsx`
  - `apps/web/components/SiteHeader.tsx`
  - `apps/web/components/SiteFooter.tsx`

### 4. Search Console and Technical Signals

- Added support for `google-site-verification` metadata
- Added the current Search Console verification token
- Confirmed `robots.ts` and `sitemap.ts` exist and are wired
- Improved `alt` text on existing visible `<img>` tags in `LabOpsAIClient.tsx`

## Content Strategy Recommendation

To further reduce `low-value content` risk, BioLT should continue to emphasize:

- worked examples
- interpretation guides
- workflow pages
- methodology and warning context

and avoid looking like:

- a thin calculator farm
- a set of near-duplicate utility pages
- a site with broken localization or weak operator identity

## Recommended Next Wave

1. Expand high-value guide pages with references and method-choice notes.
2. Add 3 to 5 more worked examples tied to existing calculators.
3. Audit calculator detail pages for any remaining broken Korean strings.
4. Reduce or hide weak pages that do not add interpretation value.
5. Re-submit AdSense only after Search Console indexing signals improve.

## Files Changed In This Wave

- `apps/web/app/about/page.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/app/terms/page.tsx`
- `apps/web/app/editorial/page.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/search/SearchClient.tsx`
- `apps/web/components/SiteHeader.tsx`
- `apps/web/components/SiteFooter.tsx`
- `apps/web/components/LabOpsAIClient.tsx`
- `apps/web/lib/i18n.ts`
- `apps/web/lib/data/tools.ts`
- `apps/web/lib/data/guides.ts`
- `apps/web/lib/data/workflows.ts`
- `apps/web/app/layout.tsx`
- `apps/web/lib/site.ts`

