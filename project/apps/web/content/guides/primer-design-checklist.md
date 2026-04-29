# Primer Design Checklist

Primer design is not only about getting a Tm value. A primer pair must be specific, balanced, compatible with the assay, and practical to troubleshoot when a reaction fails.

## Specificity

Check whether the primer sequence can bind unintended regions. For qPCR, specificity matters even more because a small off-target product can distort Ct values and melt curve interpretation.

## Pair balance

The two primers should have reasonably similar Tm values and compatible GC content. A large mismatch can make one primer behave as limiting or encourage non-specific amplification under a compromise annealing temperature.

## Amplicon context

For endpoint PCR, amplicon length often depends on gel resolution and downstream cloning. For qPCR, shorter amplicons are usually easier to amplify efficiently and consistently.

## Dimer and hairpin risk

Primer-dimer risk is especially important at the 3 prime end. A weak theoretical dimer may not matter, but a strong 3 prime interaction can create signal even when template is absent.

## Practical checklist

- Confirm primer sequence orientation.
- Check intended product length.
- Compare primer Tm values using the same method.
- Review GC content and 3 prime stability.
- Check predicted off-targets when possible.
- Document primer version and genome or plasmid reference.

## When to redesign

Redesign becomes more attractive when optimization repeatedly produces non-specific bands, weak efficiency, unstable melt curves, or amplification in negative controls. Changing cycling conditions cannot always rescue a poor primer pair.
