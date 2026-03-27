export interface ExampleMeta {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  toolHref: string;
  workflowHref?: string;
  sections: Array<{ heading: string; body: string[] }>;
}

export const exampleMetas: ExampleMeta[] = [
  {
    slug: 'pcr-master-mix-25ul',
    title: 'PCR Master Mix Example for a 25 uL Reaction',
    summary: 'Worked example for setting up a 25 uL endpoint PCR reaction with overage and control wells.',
    audience: 'Researchers preparing routine endpoint PCR or first-pass assay validation.',
    toolHref: '/tools/pcr-master-mix',
    workflowHref: '/workflows/pcr-qpcr',
    sections: [
      { heading: 'Scenario', body: ['You need eight sample reactions plus one positive control and one no-template control at 25 uL each.', 'The purpose of this example is to show how overage and control planning should be done before reagents are thawed.'] },
      { heading: 'Inputs to confirm', body: ['Reaction count: 10 total wells.', 'Add 10 to 15 percent overage to reduce pipetting error during master mix preparation.', 'Confirm whether primer concentration and polymerase conditions match the kit insert.'] },
      { heading: 'How a researcher would use the result', body: ['Use the calculator output to prepare one shared master mix, then aliquot identical volumes into each tube or plate well.', 'Record the final reagent table in the bench notebook so the same setup can be repeated later without recalculating.'] },
      { heading: 'Common failure points', body: ['Forgetting to include controls in the total reaction count.', 'Using the correct total volume but forgetting that stock concentrations may differ from kit defaults.', 'Adding template before the master mix is fully balanced.'] },
    ],
  },
  {
    slug: 'serial-dilution-10fold-standard-curve',
    title: '10-fold Serial Dilution Example for a Standard Curve',
    summary: 'Worked example showing how to build a standard curve dilution series without carryover mistakes.',
    audience: 'Users preparing qPCR standards, titration panels, or assay sensitivity checks.',
    toolHref: '/tools/serial-dilution',
    workflowHref: '/workflows/pcr-qpcr',
    sections: [
      { heading: 'Scenario', body: ['You have a concentrated stock and need six 10-fold dilution steps for a standard curve.', 'The example focuses on maintaining consistent transfer volumes and enough final material for replicates.'] },
      { heading: 'Inputs to confirm', body: ['Define the target dilution factor and the transfer volume used at every step.', 'Make sure each tube has enough final volume for replicates and repeat testing.', 'Label the tubes in order before starting the transfer sequence.'] },
      { heading: 'Why this is valuable', body: ['Researchers often know the dilution factor conceptually but still make avoidable bench errors when planning total volume.', 'This page turns a generic dilution calculator into a repeatable standard-curve setup reference.'] },
      { heading: 'Common failure points', body: ['Reusing tips and accidentally contaminating lower concentration tubes.', 'Mixing too weakly after transfer.', 'Running out of final volume because replicate planning was not included at the start.'] },
    ],
  },
  {
    slug: 'cell-seeding-6well-example',
    title: 'Cell Seeding Example for a 6-well Plate',
    summary: 'Worked example for turning a live cell count into a practical seeding plan for a 6-well experiment.',
    audience: 'Researchers seeding mammalian cells for routine culture or treatment assays.',
    toolHref: '/tools/cell-seeding',
    workflowHref: '/workflows/cell-culture',
    sections: [
      { heading: 'Scenario', body: ['You counted cells after harvest and need to seed a 6-well plate at a consistent density.', 'The value of the example is not only the final number, but also the sequence: count, confirm viability, calculate, then dispense.'] },
      { heading: 'Inputs to confirm', body: ['Initial concentration from a recent count or hemocytometer result.', 'Target cells per well or target cells per cm squared depending on the assay design.', 'Final volume per well and an overage factor for dead volume.'] },
      { heading: 'How to use the output', body: ['Prepare one mixed suspension instead of recalculating per well.', 'Mix again immediately before each dispense to reduce settling bias.', 'Record the final seeded density along with passage number and any notable morphology changes.'] },
      { heading: 'Common failure points', body: ['Using a cell count collected too early and allowing the suspension to settle before plating.', 'Forgetting that different plate formats have different growth areas.', 'Treating viability and total cell count as interchangeable.'] },
    ],
  },
  {
    slug: 'hemocytometer-trypan-blue-example',
    title: 'Hemocytometer and Trypan Blue Example',
    summary: 'Worked example for converting manual chamber counts into viable cell concentration and viability.',
    audience: 'Researchers who still rely on manual counting and need a clean reference for the math.',
    toolHref: '/tools/hemocytometer',
    workflowHref: '/workflows/cell-culture',
    sections: [
      { heading: 'Scenario', body: ['You mixed a harvested cell suspension with trypan blue and counted several squares in a hemocytometer.', 'This example shows how to translate those counts into viable cells per mL and percent viability.'] },
      { heading: 'Inputs to confirm', body: ['Counted squares and dilution factor.', 'Separate live and dead counts rather than using one combined number.', 'Use enough squares to reduce sampling noise.'] },
      { heading: 'Why this matters', body: ['Manual counting is still common in small labs and during troubleshooting.', 'A worked example helps newer users catch unit and dilution mistakes that often survive into the actual seeding step.'] },
      { heading: 'Common failure points', body: ['Using too few squares for a stable average.', 'Counting clumps as single cells or vice versa.', 'Forgetting that the dilution factor changes both concentration and viability interpretation.'] },
    ],
  },
  {
    slug: 'ligation-ratio-example',
    title: 'Ligation Ratio Example for Insert and Vector Planning',
    summary: 'Worked example for choosing insert amount from vector mass, fragment length, and target molar ratio.',
    audience: 'Researchers setting up routine cloning reactions and trying to avoid mass-ratio mistakes.',
    toolHref: '/tools/ligation',
    workflowHref: '/workflows/cloning',
    sections: [
      { heading: 'Scenario', body: ['You know the vector mass and the insert/vector lengths and need a realistic ligation plan.', 'This example focuses on molar ratio logic, not only final volume.'] },
      { heading: 'Inputs to confirm', body: ['Vector length and insert length from the intended construct map.', 'Actual DNA mass available after cleanup or quantification.', 'Target molar ratio and whether an intermediate dilution is needed to avoid sub-microliter pipetting.'] },
      { heading: 'How the example helps', body: ['It gives researchers a concrete way to connect DNA length, DNA mass, and reaction planning.', 'It also pairs naturally with the cloning workflow page so the user sees where ligation fits in the overall sequence.'] },
      { heading: 'Common failure points', body: ['Using DNA mass ratio instead of molar ratio.', 'Entering the wrong fragment length after a construct revision.', 'Ignoring the practical pipetting limit for very concentrated stocks.'] },
    ],
  },
  {
    slug: 'ddct-interpretation-example',
    title: 'qPCR ddCt Interpretation Example',
    summary: 'Worked example for turning Ct values into dCt, ddCt, and fold-change with interpretation notes.',
    audience: 'Researchers using relative expression analysis and checking whether a result is interpretable.',
    toolHref: '/tools/qpcr-relative-quant',
    workflowHref: '/workflows/pcr-qpcr',
    sections: [
      { heading: 'Scenario', body: ['You have sample and control Ct values for target and reference genes.', 'The example shows the sequence from raw Ct to fold-change, including where interpretation can still go wrong.'] },
      { heading: 'Inputs to confirm', body: ['Target and reference Ct values for both sample and control.', 'Whether the reference gene is actually stable in the relevant biological context.', 'Whether replicate spread is acceptable before summarizing the result.'] },
      { heading: 'Why this page adds value', body: ['The calculator provides the answer quickly, but the example teaches when not to trust the answer.', 'That distinction is often what makes the page useful to a real lab rather than just to search crawlers.'] },
      { heading: 'Common failure points', body: ['Using an unstable reference gene.', 'Ignoring high Ct values near the assay detection limit.', 'Treating fold-change as meaningful before checking replicate consistency.'] },
    ],
  },
];

export function exampleBySlug(slug: string) {
  return exampleMetas.find((example) => example.slug === slug);
}
