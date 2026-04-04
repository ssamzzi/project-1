'use client';

import type { Locale } from '../lib/types';

interface GuideBlock {
  intent: string;
  reagents: string[];
  workflow: string[];
  ranges: string[];
  cautions: string[];
}

const GUIDE: Record<string, GuideBlock> = {
  'pcr-master-mix': {
    intent: 'Prepare a reproducible PCR or qPCR reaction with balanced reagent composition and appropriate controls.',
    reagents: ['Nuclease-free water', 'Buffer or 2X master mix', 'dNTP', 'Forward and reverse primers', 'Polymerase', 'Template DNA'],
    workflow: ['Keep reagents cold and prepare the master mix first.', 'Add template last and distribute equal volumes to each well or tube.', 'Include a positive control and a no-template control in the same run.'],
    ranges: ['Typical reaction volume: 10 to 50 uL', 'Primer final concentration: about 0.1 to 0.5 uM', 'Overage for master mix: 10 to 20%'],
    cautions: ['Too much primer can increase non-specific amplification.', 'Repeated freeze-thaw cycles reduce enzyme performance.'],
  },
  'serial-dilution': {
    intent: 'Create a stepwise concentration series for standard curves, titration, or sensitivity testing.',
    reagents: ['Starting sample', 'Diluent such as buffer or media', 'Matched tubes or plates'],
    workflow: ['Dispense diluent first.', 'Transfer a fixed volume from the previous tube and mix thoroughly.', 'Change tips between steps to avoid carryover.'],
    ranges: ['Common dilution factor per step: 1:2 to 1:10', 'Prepare enough final volume for replicate assays.'],
    cautions: ['Poor mixing can distort a standard curve.', 'Tip reuse can contaminate lower concentration steps.'],
  },
  'copy-number': {
    intent: 'Convert nucleic-acid mass or concentration into molecule copy number for qPCR planning.',
    reagents: ['DNA or RNA concentration', 'Sequence length', 'Strand type information'],
    workflow: ['Convert concentration to mass per reaction.', 'Convert mass to moles with the appropriate constant.', 'Multiply by Avogadro number to estimate copy count.'],
    ranges: ['Common qPCR standard range: about 1e1 to 1e9 copies per reaction'],
    cautions: ['Using the wrong strand constant creates major copy-number error.', 'Oligo composition can deviate from average molecular-weight assumptions.'],
  },
  ligation: {
    intent: 'Estimate insert amount for a ligation using vector mass and a target molar ratio.',
    reagents: ['Vector DNA', 'Insert DNA', 'Ligation buffer', 'Ligase'],
    workflow: ['Use molar ratio rather than mass ratio.', 'Prepare the ligation mix with fresh buffer and ligase.', 'Include a vector-only control to estimate background.'],
    ranges: ['Common insert to vector ratio: 3:1 to 5:1'],
    cautions: ['Incorrect fragment length breaks the molar-ratio calculation.', 'High-salt DNA preparations can inhibit ligase activity.'],
  },
  a260: {
    intent: 'Estimate nucleic-acid concentration and purity from UV absorbance.',
    reagents: ['DNA or RNA sample', 'Matching blank buffer', 'UV spectrophotometer'],
    workflow: ['Blank with the exact sample buffer.', 'Measure A260 and optional A280.', 'Convert absorbance to concentration with the correct factor.'],
    ranges: ['Recommended absorbance window: A260 about 0.1 to 1.0', 'Typical purity ratio: DNA about 1.8, RNA about 2.0'],
    cautions: ['Salt and protein contamination can inflate concentration estimates.', 'Very low absorbance values reduce precision.'],
  },
  'cell-seeding': {
    intent: 'Prepare a uniform cell suspension that matches the target seeding density and final volume.',
    reagents: ['Cell suspension', 'Culture media', 'Plate with known growth area or target volume'],
    workflow: ['Calculate required cells and suspension volume first.', 'Add overage for pipetting loss and dead volume.', 'Mix gently before each dispense.'],
    ranges: ['Common seeding range: 1e4 to 1e5 cells per cm2 depending on the cell line', 'Overage is often at least 10%'],
    cautions: ['Insufficient mixing causes center and edge bias.', 'Incorrect plate area produces systematic density error.'],
  },
  hemocytometer: {
    intent: 'Estimate viable cell concentration and viability before seeding or treatment.',
    reagents: ['Cell suspension', 'Trypan blue', 'Hemocytometer and microscope'],
    workflow: ['Mix the sample with trypan blue at a fixed ratio.', 'Load the chamber without overflow.', 'Count multiple squares for a stable average.'],
    ranges: ['A practical counting density is often 20 to 50 cells per large square'],
    cautions: ['Too few counted squares increase sampling noise.', 'Cell clumps can overestimate viable concentration.'],
  },
  'rcf-rpm': {
    intent: 'Convert centrifuge settings between RPM and RCF using rotor radius.',
    reagents: ['Rotor radius', 'Target RPM or target RCF'],
    workflow: ['Measure radius from the rotor center to the sample midpoint.', 'Convert using the calculator and record both units.', 'Prefer RCF when sharing protocols across instruments.'],
    ranges: ['Cell pelleting often uses about 300 to 500 x g', 'DNA precipitation often uses 12000 x g or above'],
    cautions: ['The same RPM on different rotors gives different RCF.', 'Wrong radius input can create large force errors.'],
  },
  reconstitution: {
    intent: 'Compute solvent volume needed to reconstitute a powder to a target concentration.',
    reagents: ['Powder mass', 'Molecular weight', 'Target concentration', 'Solvent'],
    workflow: ['Convert mass to moles first.', 'Back-calculate the volume for the target concentration.', 'Optionally plan a later dilution step if pipetting would be impractical.'],
    ranges: ['Avoid extremely small final volumes whenever possible.'],
    cautions: ['Wrong molecular-weight units break all downstream calculations.', 'Some concentrated stocks may precipitate depending on solubility.'],
  },
  'gel-loading': {
    intent: 'Calculate the loading volume and mix composition that fit well capacity and dye conditions.',
    reagents: ['DNA sample', 'Loading dye', 'Agarose gel with known well capacity'],
    workflow: ['Calculate required DNA volume from target mass.', 'Adjust pre-dye volume if needed.', 'Bring the dye to the final desired concentration before loading.'],
    ranges: ['Keep loading volume comfortably below total well capacity.', 'Typical DNA target per band is often around 50 to 100 ng.'],
    cautions: ['Well overflow causes cross-lane contamination.', 'Excess DNA can smear bands.'],
  },
  'qpcr-relative-quant': {
    intent: 'Compute relative expression change using dCt, ddCt, and fold-change logic.',
    reagents: ['Target and reference Ct values for sample and control', 'A stable reference gene'],
    workflow: ['Calculate dCt for sample and control.', 'Calculate ddCt from the difference between those dCt values.', 'Convert ddCt to fold change.'],
    ranges: ['Review replicate spread before interpreting biological effect.'],
    cautions: ['An unstable reference gene can invalidate interpretation.', 'Very high Ct values may be close to the assay limit.'],
  },
  'cell-doubling-time': {
    intent: 'Estimate growth rate and doubling time from cell counts and elapsed time.',
    reagents: ['Initial and final cell counts', 'Start and end times'],
    workflow: ['Use measurements from a log-phase growth interval.', 'Calculate growth rate with a natural-log model.', 'Convert that growth rate to doubling time.'],
    ranges: ['Use counts that clearly reflect growth rather than lag or over-confluent phases.'],
    cautions: ['Including lag or confluent phases distorts doubling-time estimates.', 'Date or time entry errors can create extreme artifacts.'],
  },
  'cloning-helper': {
    intent: 'Approximate the relationship between DNA length and protein size during cloning design.',
    reagents: ['DNA length or target protein size'],
    workflow: ['Convert base pairs to amino-acid count.', 'Estimate molecular weight using an average amino-acid mass.', 'Treat the result as a planning estimate rather than an exact observed band size.'],
    ranges: ['Best used for rough design sanity checks before expression testing.'],
    cautions: ['Tags, signal peptides, and post-translational modifications shift apparent molecular weight.', 'Stop codon assumptions can change expected size.'],
  },
  'acid-dilution': {
    intent: 'Convert concentrated acid percentage and density into stock molarity and working dilution volume.',
    reagents: ['Acid percentage', 'Density', 'Molecular weight', 'Target molarity and final volume'],
    workflow: ['Calculate stock molarity from percentage and density.', 'Use dilution logic to compute the required acid volume.', 'Always add acid to water slowly with appropriate cooling and PPE.'],
    ranges: ['Work in a fume hood with PPE and secondary containment.'],
    cautions: ['If required acid volume exceeds final volume, the target is impossible.', 'Adding water into acid can cause violent heat release.'],
  },
  'transformation-efficiency': {
    intent: 'Estimate competent-cell quality from CFU per microgram DNA and log efficiency.',
    reagents: ['DNA amount', 'Transformation volume', 'Plated volume', 'Colony count'],
    workflow: ['Calculate how much DNA was actually plated.', 'Compute efficiency from colony count and plated DNA.', 'Use the log value for easier benchmark comparison.'],
    ranges: ['High-quality competent cells are often around 1e8 CFU per microgram or above, depending on protocol.'],
    cautions: ['Mismatch between plated fraction and colony plate invalidates the result.', 'Contaminated controls can fake high background colony counts.'],
  },
};

export function CalculationGuide({ id, locale }: { id: string; locale: Locale }) {
  const labels =
    locale === 'ko'
      ? {
          title: '실험 가이드',
          intent: '실험 의도',
          reagents: '시약 및 준비물',
          workflow: '실험 순서',
          ranges: '권장 범위',
          cautions: '주의점',
          glossary: '용어 설명',
          details: '가이드 상세 보기',
        }
      : {
          title: 'Experiment Guide',
          intent: 'Intent',
          reagents: 'Reagents',
          workflow: 'Workflow',
          ranges: 'Recommended range',
          cautions: 'Cautions',
          glossary: 'Glossary',
          details: 'Show guide details',
        };

  const guide = GUIDE[id];
  if (!guide) return null;

  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-sm">
      <p className="text-slate-600">{labels.title}</p>
      <p className="mt-1 text-slate-800">
        <span className="font-semibold">{labels.intent}: </span>
        {guide.intent}
      </p>
      <details className="mt-2 rounded border border-slate-200 bg-white p-2">
        <summary className="cursor-pointer font-semibold">{labels.details}</summary>
        <div className="mt-2 space-y-2 text-slate-800">
          <p className="font-semibold">{labels.reagents}</p>
          <ul className="list-disc pl-5">
            {guide.reagents.map((line) => (
              <li key={`${id}-reagent-${line}`}>{line}</li>
            ))}
          </ul>
          <p className="font-semibold">{labels.workflow}</p>
          <ul className="list-disc pl-5">
            {guide.workflow.map((line) => (
              <li key={`${id}-workflow-${line}`}>{line}</li>
            ))}
          </ul>
          <p className="font-semibold">{labels.ranges}</p>
          <ul className="list-disc pl-5">
            {guide.ranges.map((line) => (
              <li key={`${id}-range-${line}`}>{line}</li>
            ))}
          </ul>
          <p className="font-semibold">{labels.cautions}</p>
          <ul className="list-disc pl-5">
            {guide.cautions.map((line) => (
              <li key={`${id}-caution-${line}`}>{line}</li>
            ))}
          </ul>
        </div>
      </details>
      <div className="mt-2">
        <details className="rounded border border-slate-200 bg-white p-2">
          <summary className="cursor-pointer font-semibold">{labels.glossary}</summary>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
            <li>
              <span className="font-semibold">Overage:</span>{' '}
              {locale === 'ko' ? 'pipetting 오차를 흡수하기 위한 추가 부피 또는 비율' : 'extra volume or ratio to absorb pipetting error'}
            </li>
            <li>
              <span className="font-semibold">Molar ratio:</span>{' '}
              {locale === 'ko' ? '질량비가 아니라 분자 수 기준의 비율' : 'molecule-count based ratio rather than mass ratio'}
            </li>
            <li>
              <span className="font-semibold">Control:</span>{' '}
              {locale === 'ko' ? '실험 조건의 정상 여부를 비교하기 위한 기준 반응' : 'reference reaction used to validate run quality and contamination status'}
            </li>
            <li>
              <span className="font-semibold">Fold change:</span>{' '}
              {locale === 'ko' ? '기준 조건 대비 상대 변화 배수' : 'relative change multiple versus a control condition'}
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
