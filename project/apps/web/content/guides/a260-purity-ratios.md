# A260 Purity Ratios in Practice

## When to use
Use this guide after a NanoDrop or similar spectrophotometer readout when you need to decide whether a nucleic acid sample is ready for PCR, qPCR, cloning, sequencing, or another cleanup step.

## Why the ratios matter
Concentration alone does not tell you whether the sample is usable. A prep can look concentrated enough for downstream work and still carry protein, phenol, guanidine, salt, or other contaminants that lower performance. A260/280 and A260/230 are not perfect diagnostics, but they are fast screening signals that help you decide whether the sample deserves more scrutiny before it reaches a sensitive assay.

## What each ratio is trying to tell you
- A260/280 is commonly used as a rough check for protein contamination in DNA and RNA preps.
- A260/230 is often more sensitive to salts, chaotropic agents, phenol carryover, and other cleanup leftovers.
- These numbers are interpretation aids, not purity certificates. They become more useful when considered together with concentration, extraction method, and downstream sensitivity.

## Common bench scenarios
### The concentration is high but A260/230 is poor
This often means the sample is still concentrated enough to measure well, but not clean enough to behave consistently in amplification or enzymatic reactions. The question becomes whether dilution is sufficient or whether the contamination source is likely to continue interfering.

### The ratios look decent but downstream performance is weak
Spectrophotometer ratios do not detect everything. Fragmentation, inhibitors at low abundance, and poor target integrity can still produce a bad assay even when the numbers seem acceptable.

### RNA and DNA are being interpreted with the same rule
The same ratio threshold is not always equally meaningful across sample types. Always connect the readout to the extraction method, molecule type, and assay tolerance.

## Practical review checklist
1. Confirm that the blank matched the sample buffer.
2. Check concentration and both purity ratios together, not in isolation.
3. Ask what the next assay is most sensitive to: inhibitors, protein carryover, or low input mass.
4. Decide whether dilution, cleanup, or a fresh prep is the most defensible next step.
5. Record the instrument, blank, and any cleanup decision in your notes.

## Mistakes that make the readout misleading
- Blanking with water when the sample is in elution buffer or another non-water solution.
- Measuring a very low-concentration sample and overinterpreting noisy ratios.
- Treating every low A260/280 as protein and every low A260/230 as the same contamination source.
- Reusing a published threshold without considering the next assay.

## How this connects to BioLT tools
- Use the A260 Quantitation tool to convert absorbance-based concentration into a usable planning value.
- If the sample is usable but too concentrated, move next to a dilution planner.
- If the sample will be used in qPCR or cloning, document the purity call before you continue so the result can be defended later.

## Bottom line
Purity ratios are best used as fast pre-bench signals. Their real value is not the number itself, but the decision they support: proceed confidently, clean up first, or stop trusting the sample.
