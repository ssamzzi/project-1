# Primer Tm Curation

## When to use
Use this guide when selecting primer pairs for PCR or qPCR and you need to compare multiple Tm estimates before ordering or validating a new assay.

## Why Tm curation matters
Primer Tm is not a cosmetic number. It directly affects annealing temperature, specificity, mismatch tolerance, and how evenly a primer pair behaves in the same reaction. A pair that looks acceptable by sequence alone can still perform poorly if the Tm estimate is based on the wrong salt model or if one primer sits several degrees away from its partner.

## Common input mistakes
- Ignoring sequence length and GC content differences.
- Using non-default salt assumptions without recording them.
- Entering a published Tm value and then converting units manually.
- Comparing calculators that use different nearest-neighbor or simplifed formulas as if they were identical.

## Interpretation pitfalls
- Different algorithms can differ by several degrees.
- Long primers, degenerate bases, or strong secondary structures need context-specific tuning.
- A "good" Tm value does not guarantee the absence of dimers or hairpins.
- Vendor calculators may bias assumptions toward their own reagent systems.

## Recommended tools
- Primer3: fast design suggestions and broad community familiarity.
- OligoCalc: helpful for quick checks and manual comparison.
- Thermo Fisher calculators: useful when the assay will run with vendor-specific chemistry.

## Practical review checklist
1. Confirm primer lengths and target GC content before comparing Tm.
2. Recalculate both primers with the same salt and oligo assumptions.
3. Check that the primer pair stays within an acceptable Tm gap.
4. Review dimer and hairpin risk separately from Tm.
5. Record the calculator and assumptions you used in the protocol notes.

## Alternative links in case of login or JavaScript issues
- NCBI Primer-BLAST
- EMBOSS `ntthal`
- Local spreadsheet or scripting workflows that document assumptions explicitly

## Disclaimer
Primer Tm formulas are approximations built on salt, concentration, and oligo-model assumptions. Treat Tm as a decision aid and verify the final annealing strategy empirically.
