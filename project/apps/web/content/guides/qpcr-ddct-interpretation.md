# qPCR ddCt Interpretation

## When to use
Use this guide when you already have Ct values and want to decide whether the resulting dCt, ddCt, and fold-change numbers are biologically interpretable or only mathematically computable.

## Why interpretation matters
The ddCt workflow is simple enough to automate, but the interpretation is where most mistakes happen. A fold-change number can look clean while hiding unstable reference genes, poor replicate spread, or Ct values too close to the assay limit.

## The minimum logic behind the method
- dCt compares target and reference within the same sample.
- ddCt compares that normalized value against a control condition.
- Fold change converts ddCt into a more intuitive relative expression number.

The math is not the hard part. The defensibility of the upstream Ct values is.

## Review the data before trusting the fold change
1. Check replicate consistency first.
2. Confirm that the reference gene is stable in the biological context.
3. Look at the absolute Ct range, not only the final fold change.
4. Ask whether the amplification efficiencies are reasonably compatible.
5. Decide whether any outlier handling was predefined rather than improvised.

## Common failure patterns
### High Ct values near the detection edge
Even if the calculation completes, the biological meaning may be weak because the assay is operating near its limit.

### Reference gene instability
If the reference moves with the biology or the treatment, the normalization step becomes part of the error rather than part of the solution.

### Fold-change overinterpretation
A large fold change does not rescue poor assay quality. If the inputs are unstable, the answer is unstable.

## What to document with the result
- Ct values and replicate spread.
- Reference gene choice and why it was selected.
- Any excluded wells and the rule used to exclude them.
- The control condition used for ddCt.
- The exact software or calculator assumptions used.

## How this connects to BioLT
The qPCR Relative Quantification tool gives the calculation quickly. This guide exists so that the result page is not the end of the reasoning process. Use the tool for speed and this guide for interpretation discipline.

## Bottom line
ddCt is valuable when the normalization strategy, replicate quality, and Ct range are all defensible. When those conditions are weak, the fold-change number can still be produced, but it should not be trusted automatically.
