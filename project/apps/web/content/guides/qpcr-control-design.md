# qPCR Control Design

qPCR interpretation depends on control design before it depends on fold-change math. A clean ddCt value is only meaningful when the reference gene, negative controls, and replicate structure support the biological question.

## Core controls

- NTC: no-template control for contamination and primer-dimer signals.
- No-RT: reverse transcription negative control for genomic DNA carryover in RNA workflows.
- Positive control: confirms that primers, master mix, and cycling conditions can amplify the intended target.
- Reference gene: normalizes sample input, but only if expression is stable in the actual condition being studied.

## Replicates

Technical replicates test pipetting and instrument consistency. Biological replicates test whether the result survives real sample variation. These are not interchangeable. Three technical wells from one sample do not replace independent biological samples.

## Before calculating ddCt

Check replicate spread, amplification curve shape, melt curve or specificity information, and whether Ct values are close to the detection limit. A fold-change number from weak upstream data should be treated as a warning sign, not a conclusion.

## Practical planning checklist

- Decide which controls must be present before the plate is designed.
- Avoid placing all controls at the edge if evaporation or edge effects are a concern.
- Keep the same thresholding approach across samples.
- Record excluded wells with a reason, not just a deletion.

## Interpretation boundary

qPCR gives a relative measurement under defined assumptions. It does not prove mechanism by itself. Use it as part of a chain of evidence that includes sample quality, primer performance, biological replication, and the downstream question.
