# GISAID Raw Regression Expectations

These expectation files define guardrails for real raw influenza metadata.

They are intentionally conservative:

- preserve-heavy columns should not generate noisy formatting cleanup
- subtype formatting-only differences should stay suppressed
- manual fixes should remain near zero on mostly clean raw exports

Use these files as release-gate references when running fixture-based audits.
