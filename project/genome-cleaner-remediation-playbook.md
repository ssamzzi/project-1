# Genome Metadata Cleaner Remediation Playbook

## Mission

Make the Genome Metadata Cleaner reliable on real researcher metadata.

Success means:

- Normal raw metadata is mostly left alone.
- Real errors are detected consistently.
- Suggestions are few, clear, and useful.
- Users can finish with `upload -> review -> export`.

This is not a "fix everything" tool.
It is a conservative review-first cleaner.

## Primary Product Rule

Prefer false negatives over noisy false positives for raw research metadata.

In practice:

- Do not normalize values just because formatting differs.
- Do not treat common raw metadata conventions as errors.
- Only escalate when the value is truly implausible, ambiguous, or clearly inconsistent.

## Team Roles

### 1. Product / Decision Lead

Owner:

- Final decision on what counts as an error
- Final decision on what should be preserved
- Weekly release approval

Responsibilities:

- Maintain the preserve list
- Maintain the "actionable issue" list
- Reject low-value cleanup rules
- Approve rollout only when regression gates pass

Current focus:

- Reduce low-value `separator`, `casing`, and `controlled-vocab` noise
- Keep only changes that matter for real metadata quality

### 2. Real-Data Analysis Lead

Owner:

- Raw metadata pattern analysis
- Fixture curation

Responsibilities:

- Inspect real metadata exports from GISAID-like sources
- Identify preserve-heavy fields
- Identify normal value diversity that should not be flagged
- Document real error patterns worth catching

Current preserve-heavy field candidates:

- `Location`
- `Lineage`
- `Clade`
- `Passage_History`
- `Publication`
- `Isolate_Name`
- `Submitting_Sample_Id`
- `Originating_Sample_Id`
- `Isolate_Submitter`
- `Host_Age`
- `Host_Age_Unit`
- `Host_Gender`
- `Patient_Status`

### 3. Engine Remediation Lead

Owner:

- Cleaner rules and scoring logic

Responsibilities:

- Refine `schemaDetector`, `profiler`, `recommender`, `normalization`
- Suppress low-value suggestions
- Preserve source-specific formatting where needed
- Add source-aware defaults

Current rule priorities:

- Treat subtype formatting-only differences as low priority or ignore
- Never treat underscore-only differences as separator issues by default
- Do not normalize slash-delimited raw isolate and location strings
- Avoid treating lab/sample identifiers as dates
- Only mark controlled vocabulary values invalid when clearly implausible

### 4. UX / Workflow Lead

Owner:

- Review experience

Responsibilities:

- Group suggestions by issue type and column
- Keep trivial formatting hidden by default
- Surface only actionable changes first
- Support bulk keep / bulk apply / bulk skip

Current UX priorities:

- Trivial formatting issues should not dominate the review screen
- Preserve-heavy columns should be excluded by default
- Review should open on the most important items first

### 5. QA / Regression Lead

Owner:

- Regression safety

Responsibilities:

- Maintain realistic fixtures
- Compare suggestion volume across versions
- Validate that fixes reduce false positives without hiding real errors

Required release checks:

- Real GISAID-style raw metadata does not explode into thousands of suggestions unless truly dirty
- Trivial subtype spacing is ignored
- Preserve-heavy columns are skipped by default
- Actual typos and invalid dates still surface

## Operating Flow

1. Real-data lead inspects raw metadata and updates fixture expectations.
2. Product lead updates preserve rules and success criteria.
3. Engine lead implements the narrowest safe logic change.
4. UX lead reduces noise in presentation and defaults.
5. QA lead validates against realistic fixtures and raw file patterns.
6. Product lead approves deployment.

## Issue Escalation Rule

Escalate to the user immediately when any of the following happen:

- A real metadata pattern conflicts with an existing rule
- A change reduces noise but hides real errors
- A high-impact field needs a policy decision
- Multiple source formats require different defaults
- Runtime or build issues block verification

When escalating, report:

- the exact field or value pattern
- why it is ambiguous
- the tradeoff between preserve vs normalize
- the recommended default

## Current Implementation Priorities

### Priority 1

Reduce low-value suggestions in real GISAID-like metadata.

Targets:

- subtype formatting-only noise
- location consensus overreach
- isolate name separator cleanup
- submitting/originating sample id false positives
- demographic duplicate noise

### Priority 2

Introduce source-aware presets.

Required first preset:

- `GISAID influenza raw metadata`

Preset behavior:

- preserve-heavy columns skipped by default
- date, host, country/region, and real controlled-vocab errors prioritized
- trivial formatting changes suppressed

### Priority 3

Refactor internal suggestion model.

Target model:

- `AutoFixItem`
- `ReviewItem`
- `ManualFixItem`

This should replace the current overuse of one proposal type for different intents.

## Release Gates

Do not ship unless all are true:

- `Subtype` spacing-only differences do not create mass suggestions
- `Location` values are not forced toward one dominant location string
- `Isolate_Name` raw formatting is preserved by default
- `Submitting_Sample_Id` is not treated like a date
- `Host_Age` repetition is not treated as an error
- impossible dates still reach manual review
- obvious typos like `humna` still surface

## Working Rule for This Project

If a change makes the cleaner quieter but more truthful, keep it.
If a change makes the cleaner busier without improving scientific usefulness, remove it.
