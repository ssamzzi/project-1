# Statistical Test Chooser

## When to use
Use this guide for first-pass decisions when choosing a statistical comparison for a lab experiment, especially when you need to separate paired designs, independent groups, or multi-group comparisons.

## Why this decision is easy to get wrong
Many lab analyses fail before software is opened. The wrong decision often happens when experimental design is not mapped clearly: repeated measurements are treated as independent samples, multiple endpoints are tested without correction, or assumptions are ignored because the graph "looks normal enough."

## Common input mistakes
- Wrong pairing of repeated measures with independent tests.
- Omitting test assumptions such as normality or variance equality.
- Using one-tailed testing without a pre-specified directional hypothesis.
- Treating technical replicates as if they were biological replicates.

## Interpretation pitfalls
- A p-value is not an effect size.
- Multiple testing increases false positives and should be corrected.
- Small sample sizes can make assumption checks unstable.
- A statistically significant result may still be biologically trivial.

## Recommended tools
- R with transparent scripts for reproducible workflows.
- GraphPad Prism for quick GUI-based analysis in small teams.
- Python SciPy for code-driven pipelines and automation.

## Practical review checklist
1. Write down the experimental unit before choosing any test.
2. Separate technical replicates from biological replicates.
3. Check whether groups are paired, repeated, or fully independent.
4. Decide whether you are comparing two groups or several groups.
5. Record assumption checks and any multiple-testing correction.

## Alternative references
- Official university or public statistics method pages
- Introductory biostatistics textbooks
- Internal lab SOPs for common assay readouts

## Disclaimer
This page is only a starting point. Complex designs, batch effects, mixed models, and repeated measures across time usually require a more specific analysis plan.
