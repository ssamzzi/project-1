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
      {
        heading: 'Scenario',
        body: [
          'You need eight sample reactions plus one positive control and one no-template control at 25 uL each.',
          'The purpose of this example is to show how overage and control planning should be done before reagents are thawed.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Reaction count: 10 total wells.',
          'Add 10 to 15 percent overage to reduce pipetting error during master mix preparation.',
          'Confirm whether primer concentration and polymerase conditions match the kit insert.',
        ],
      },
      {
        heading: 'How a researcher would use the result',
        body: [
          'Use the calculator output to prepare one shared master mix, then aliquot identical volumes into each tube or plate well.',
          'Record the final reagent table in the bench notebook so the same setup can be repeated later without recalculating.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Forgetting to include controls in the total reaction count.',
          'Using the correct total volume but forgetting that stock concentrations may differ from kit defaults.',
          'Adding template before the master mix is fully balanced.',
        ],
      },
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
      {
        heading: 'Scenario',
        body: [
          'You have a concentrated stock and need six 10-fold dilution steps for a standard curve.',
          'The example focuses on maintaining consistent transfer volumes and enough final material for replicates.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Define the target dilution factor and the transfer volume used at every step.',
          'Make sure each tube has enough final volume for replicates and repeat testing.',
          'Label the tubes in order before starting the transfer sequence.',
        ],
      },
      {
        heading: 'Why this is valuable',
        body: [
          'Researchers often know the dilution factor conceptually but still make avoidable bench errors when planning total volume.',
          'This page turns a generic dilution calculator into a repeatable standard-curve setup reference.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Reusing tips and accidentally contaminating lower concentration tubes.',
          'Mixing too weakly after transfer.',
          'Running out of final volume because replicate planning was not included at the start.',
        ],
      },
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
      {
        heading: 'Scenario',
        body: [
          'You counted cells after harvest and need to seed a 6-well plate at a consistent density.',
          'The value of the example is not only the final number, but also the sequence: count, confirm viability, calculate, then dispense.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Initial concentration from a recent count or hemocytometer result.',
          'Target cells per well or target cells per cm squared depending on the assay design.',
          'Final volume per well and an overage factor for dead volume.',
        ],
      },
      {
        heading: 'How to use the output',
        body: [
          'Prepare one mixed suspension instead of recalculating per well.',
          'Mix again immediately before each dispense to reduce settling bias.',
          'Record the final seeded density along with passage number and any notable morphology changes.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using a cell count collected too early and allowing the suspension to settle before plating.',
          'Forgetting that different plate formats have different growth areas.',
          'Treating viability and total cell count as interchangeable.',
        ],
      },
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
      {
        heading: 'Scenario',
        body: [
          'You mixed a harvested cell suspension with trypan blue and counted several squares in a hemocytometer.',
          'This example shows how to translate those counts into viable cells per mL and percent viability.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Counted squares and dilution factor.',
          'Separate live and dead counts rather than using one combined number.',
          'Use enough squares to reduce sampling noise.',
        ],
      },
      {
        heading: 'Why this matters',
        body: [
          'Manual counting is still common in small labs and during troubleshooting.',
          'A worked example helps newer users catch unit and dilution mistakes that often survive into the actual seeding step.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using too few squares for a stable average.',
          'Counting clumps as single cells or vice versa.',
          'Forgetting that the dilution factor changes both concentration and viability interpretation.',
        ],
      },
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
      {
        heading: 'Scenario',
        body: [
          'You know the vector mass and the insert/vector lengths and need a realistic ligation plan.',
          'This example focuses on molar ratio logic, not only final volume.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Vector length and insert length from the intended construct map.',
          'Actual DNA mass available after cleanup or quantification.',
          'Target molar ratio and whether an intermediate dilution is needed to avoid sub-microliter pipetting.',
        ],
      },
      {
        heading: 'How the example helps',
        body: [
          'It gives researchers a concrete way to connect DNA length, DNA mass, and reaction planning.',
          'It also pairs naturally with the cloning workflow page so the user sees where ligation fits in the overall sequence.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using DNA mass ratio instead of molar ratio.',
          'Entering the wrong fragment length after a construct revision.',
          'Ignoring the practical pipetting limit for very concentrated stocks.',
        ],
      },
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
      {
        heading: 'Scenario',
        body: [
          'You have sample and control Ct values for target and reference genes.',
          'The example shows the sequence from raw Ct to fold-change, including where interpretation can still go wrong.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Target and reference Ct values for both sample and control.',
          'Whether the reference gene is actually stable in the relevant biological context.',
          'Whether replicate spread is acceptable before summarizing the result.',
        ],
      },
      {
        heading: 'Why this page adds value',
        body: [
          'The calculator provides the answer quickly, but the example teaches when not to trust the answer.',
          'That distinction is often what makes the page useful to a real lab rather than just to search crawlers.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using an unstable reference gene.',
          'Ignoring high Ct values near the assay detection limit.',
          'Treating fold-change as meaningful before checking replicate consistency.',
        ],
      },
    ],
  },
  {
    slug: 'a260-purity-check-example',
    title: 'A260 Purity Check Example Before PCR',
    summary: 'Worked example for deciding whether a nucleic acid prep is clean enough for downstream use or needs cleanup first.',
    audience: 'Researchers checking whether a DNA or RNA prep is ready for PCR, cloning, or qPCR.',
    toolHref: '/tools/a260',
    workflowHref: '/workflows/dna-quant-to-pcr',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'You measured a sample on a spectrophotometer and have concentration, A260/280, and A260/230 values.',
          'The example focuses on the bench decision that follows the readout: proceed, dilute, or clean up.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Use the correct blank solution rather than water by default.',
          'Record whether the sample is genomic DNA, plasmid DNA, or RNA because interpretation differs slightly.',
          'Check whether the final concentration is high enough after any cleanup step you may need.',
        ],
      },
      {
        heading: 'How a researcher would use the result',
        body: [
          'Treat purity ratios as context, not as a pass-fail number detached from the downstream assay.',
          'If the sample is borderline, pair the concentration result with the actual sensitivity of the next step rather than repeating cleanup automatically.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using a good concentration value to ignore poor purity.',
          'Treating every low ratio as the same contamination problem.',
          'Skipping a quick reassessment after dilution or cleanup.',
        ],
      },
    ],
  },
  {
    slug: 'copy-number-standard-prep-example',
    title: 'Copy Number Example for qPCR Standard Preparation',
    summary: 'Worked example for converting DNA mass into copies and preparing a standard series with enough volume for replicates.',
    audience: 'Researchers building plasmid or amplicon standards for qPCR or assay sensitivity checks.',
    toolHref: '/tools/copy-number',
    workflowHref: '/workflows/qpcr-standard-curve-prep',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'You have a quantified DNA standard and need copy number estimates before planning a dilution series.',
          'This example shows how the copy calculation and the dilution plan should be documented together.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Template length must match the actual standard molecule.',
          'Use the measured concentration from the same batch you will dilute, not an older value from a prior prep.',
          'Decide how many replicate wells and reruns the standard series must support.',
        ],
      },
      {
        heading: 'How a researcher would use the result',
        body: [
          'First convert the measured mass concentration to copies per unit volume, then design the dilution series backward from the target copy range.',
          'Keep one note line with the molecule length, calculation date, and target copy range so the standard can be defended later.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Using the wrong fragment length after cloning or linearization changes.',
          'Planning the dilution steps without checking whether the starting concentration can realistically support them.',
          'Running the series too close to the lower detection limit without replicate protection.',
        ],
      },
    ],
  },
  {
    slug: 'transformation-efficiency-example',
    title: 'Transformation Efficiency Example After Cloning',
    summary: 'Worked example for calculating CFU per microgram and interpreting whether a low-colony outcome reflects competent cells, ligation, or plating dilution.',
    audience: 'Researchers reviewing a transformation result after ligation or control plasmid transformation.',
    toolHref: '/tools/transformation-efficiency',
    workflowHref: '/workflows/ligation-to-transformation',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'You plated transformed cells and counted colonies from one or more dilutions.',
          'The goal is to connect the colony count to the actual DNA input and recovery volume rather than reporting a vague success or failure.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'DNA mass added to the competent cells.',
          'Final recovery volume, plated fraction, and any dilution before plating.',
          'Whether the plate came from a ligation product or a positive-control plasmid.',
        ],
      },
      {
        heading: 'How a researcher would use the result',
        body: [
          'Use the calculated efficiency to separate a weak ligation from a weak competent-cell batch.',
          'Compare the ligation outcome to a control transformation rather than diagnosing from one number alone.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Forgetting to scale for the plated fraction.',
          'Reporting colony count without the DNA input basis.',
          'Comparing ligation and control plates that did not use comparable recovery and plating conditions.',
        ],
      },
    ],
  },
  {
    slug: 'rcf-rpm-conversion-example',
    title: 'RCF to RPM Conversion Example for a New Rotor',
    summary: 'Worked example for converting a published spin force into the RPM needed on a centrifuge with a different rotor radius.',
    audience: 'Researchers adapting a protocol from a paper, kit, or another lab onto their own centrifuge.',
    toolHref: '/tools/rcf-rpm',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'A paper reports spin conditions in RCF, but your centrifuge display is RPM and your rotor radius is different.',
          'This example shows how to adapt the condition without copying a number that belongs to another machine.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Target RCF from the protocol.',
          'Actual rotor radius for your rotor, not a generic manufacturer estimate from a different model.',
          'Whether the protocol is sensitive to under-spinning or overheating.',
        ],
      },
      {
        heading: 'Why this matters',
        body: [
          'Published RPM values are not transferable across different rotors.',
          'A worked example makes the protocol adaptation step explicit and gives the page more practical value than a formula alone.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Copying RPM from a paper that used another rotor.',
          'Using the wrong measurement point for rotor radius.',
          'Ignoring whether a long spin at higher RPM could heat the sample.',
        ],
      },
    ],
  },
  {
    slug: 'pipetting-overage-planning-example',
    title: 'Pipetting Overage Planning Example',
    summary: 'Worked example for deciding how much extra master mix to prepare when small dead volumes and repeat dispensing are expected.',
    audience: 'Researchers preparing PCR, qPCR, enzyme reactions, or plate-based assays with repeated dispensing.',
    toolHref: '/tools/pcr-master-mix',
    workflowHref: '/workflows/experiment-review-cycle',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'You need enough reaction mix for 24 wells, but the exact calculated volume leaves no margin for tip retention, tube dead volume, or small transfer losses.',
          'The example shows how to choose overage as a practical bench decision rather than a random percentage.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Number of reactions and final volume per reaction.',
          'Whether the mix will be dispensed from a tube, strip, or reservoir.',
          'Whether the limiting reagent can tolerate extra prepared volume.',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'Calculate the exact required total, then add a defined overage such as 10 percent or one extra reaction depending on scale.',
          'Record the overage rule so the next person understands why the prepared volume is larger than the mathematical minimum.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Preparing exactly the required volume and running short in the final wells.',
          'Adding too much overage when an expensive enzyme or rare sample is limiting.',
          'Changing overage between plates without recording the reason.',
        ],
      },
    ],
  },
  {
    slug: 'rna-no-rt-control-example',
    title: 'No-RT Control Example for RNA qPCR',
    summary: 'Worked example for using no-RT controls to distinguish true cDNA signal from genomic DNA carryover.',
    audience: 'Researchers preparing expression analysis from RNA samples.',
    toolHref: '/tools/qpcr-relative-quant',
    workflowHref: '/workflows/rna-to-qpcr',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'A qPCR target amplifies in both the reverse-transcribed sample and the no-RT control.',
          'The example focuses on deciding whether the signal can still be interpreted or whether sample preparation must be reviewed first.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Ct values for RT-positive and no-RT reactions.',
          'Primer design context, especially whether primers span exon junctions when applicable.',
          'Whether DNase treatment or genomic DNA removal was performed.',
        ],
      },
      {
        heading: 'How a researcher would use the result',
        body: [
          'Compare no-RT signal to the true sample signal before calculating fold change.',
          'If the no-RT control is close to the sample Ct, interpret expression cautiously and review RNA cleanup or primer design.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Ignoring no-RT amplification because the sample Ct looks strong.',
          'Using a reference gene without checking genomic DNA sensitivity.',
          'Treating DNase treatment as guaranteed rather than verified.',
        ],
      },
    ],
  },
  {
    slug: 'gel-smear-troubleshooting-example',
    title: 'Gel Smear Troubleshooting Example',
    summary: 'Worked example for interpreting a smeared gel lane before deciding whether PCR, sample quality, or electrophoresis conditions are responsible.',
    audience: 'Researchers troubleshooting endpoint PCR, cleanup products, or extracted nucleic acids.',
    toolHref: '/tools/gel-loading',
    workflowHref: '/workflows/gel-check-to-cleanup',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'The expected band is weak and the sample lane shows broad smearing.',
          'The goal is to avoid blaming PCR immediately when loading amount, salt, degraded template, or voltage may explain the pattern.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'DNA amount loaded per lane.',
          'Gel percentage and running voltage.',
          'Whether the ladder and controls separated normally.',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'First confirm whether the gel system behaved normally using the ladder and controls.',
          'If only one sample smears, review sample quality and loading amount before changing the entire PCR program.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Overloading a lane and interpreting the smear as template degradation.',
          'Using the wrong gel percentage for the expected size range.',
          'Running too hot and distorting bands across the gel.',
        ],
      },
    ],
  },
  {
    slug: 'cell-viability-plating-decision-example',
    title: 'Cell Viability Plating Decision Example',
    summary: 'Worked example for deciding whether to seed, recount, or recover cells when viability is lower than expected.',
    audience: 'Researchers preparing treatment plates or routine culture passages after manual counting.',
    toolHref: '/tools/hemocytometer',
    workflowHref: '/workflows/cell-treatment-plate-plan',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'A harvested culture has enough total cells but lower viability than usual.',
          'The example shows how to decide whether the count can still support plating or whether the culture condition should be reviewed first.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Live and dead counts rather than total count alone.',
          'Time between harvest, staining, counting, and plating.',
          'Whether the untreated culture morphology already looked stressed.',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'Use viable cell concentration for seeding calculations, not total cells.',
          'If viability is unexpectedly low, consider whether the experiment should be delayed, repeated, or documented as a compromised setup.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Seeding by total cell count after viability drops.',
          'Ignoring clumps that distort live/dead counts.',
          'Treating stressed cells as comparable to a healthy control culture.',
        ],
      },
    ],
  },
  {
    slug: 'buffer-working-stock-example',
    title: 'Buffer Working Stock Preparation Example',
    summary: 'Worked example for preparing a working stock while preserving concentration, labeling, and storage records.',
    audience: 'Researchers preparing buffers, supplements, additives, or routine working stocks.',
    toolHref: '/tools/reconstitution',
    workflowHref: '/workflows/buffer-media-prep',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'You need to prepare a lower-concentration working stock from a concentrated reagent.',
          'The example focuses on making the result usable later by recording source, dilution factor, solvent, and storage conditions.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Source stock concentration and solvent.',
          'Target working concentration and final volume.',
          'Storage temperature, light sensitivity, and expiration or review date.',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'Calculate the source volume and diluent volume, then prepare enough for expected use without creating an oversized aging stock.',
          'Label the tube with concentration and date, and record the calculation assumptions in the preparation log.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Preparing a correct dilution but failing to label the solvent or concentration.',
          'Using an old working stock without checking storage history.',
          'Forgetting that some additives are unstable after thawing or dilution.',
        ],
      },
    ],
  },
  {
    slug: 'plate-layout-edge-effect-example',
    title: 'Plate Layout Example for Edge Effects',
    summary: 'Worked example for arranging samples and controls so plate position does not masquerade as biology.',
    audience: 'Researchers planning cell assays, qPCR plates, or plate-reader experiments.',
    toolHref: '/tools/cell-seeding',
    workflowHref: '/workflows/cell-treatment-plate-plan',
    sections: [
      {
        heading: 'Scenario',
        body: [
          'A plate-based assay shows stronger signal in wells near one side of the plate.',
          'This example shows how layout planning can reduce the chance that location effects are mistaken for treatment effects.',
        ],
      },
      {
        heading: 'Inputs to confirm',
        body: [
          'Number of conditions, controls, and replicates.',
          'Whether outer wells are known to behave differently for this assay.',
          'Whether sample order can be balanced across plate regions.',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'Place controls deliberately and distribute conditions rather than grouping every replicate in one region.',
          'Keep a clear plate map so later analysis can identify whether a pattern follows biology or position.',
        ],
      },
      {
        heading: 'Common failure points',
        body: [
          'Putting all controls in one corner.',
          'Using unclear abbreviations that become ambiguous during analysis.',
          'Ignoring empty or edge wells when comparing conditions.',
        ],
      },
    ],
  },
];

export function exampleBySlug(slug: string) {
  return exampleMetas.find((example) => example.slug === slug);
}
