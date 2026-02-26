'use client';

import type { Locale } from '../lib/types';

interface GuideBlock {
  intentEn: string;
  intentKo: string;
  reagentsEn: string[];
  reagentsKo: string[];
  workflowEn: string[];
  workflowKo: string[];
  rangesEn: string[];
  rangesKo: string[];
  cautionsEn: string[];
  cautionsKo: string[];
}

const GUIDE: Record<string, GuideBlock> = {
  'pcr-master-mix': {
    intentEn: 'Prepare a reproducible PCR/qPCR reaction that amplifies target DNA with high specificity.',
    intentKo: 'target DNA를 높은 specificity로 증폭할 수 있도록 재현성 있는 PCR/qPCR reaction을 준비합니다.',
    reagentsEn: ['Nuclease-free water', '10X buffer or 2X master mix', 'dNTP', 'Primer F/R', 'Polymerase', 'Template DNA'],
    reagentsKo: ['Nuclease-free water', '10X buffer 또는 2X master mix', 'dNTP', 'Primer F/R', 'Polymerase', 'Template DNA'],
    workflowEn: [
      'Keep reagents on ice and prepare master mix first.',
      'Add template DNA last, then aliquot to each tube/well.',
      'Include positive control and NTC in the same run.',
    ],
    workflowKo: ['reagent를 ice 위에 두고 master mix를 먼저 준비합니다.', 'Template DNA를 마지막에 넣고 각 tube/well로 분주합니다.', '같은 run에 positive control과 NTC를 포함합니다.'],
    rangesEn: ['Typical reaction volume: 10-50 uL', 'Primer final concentration: ~0.1-0.5 uM', 'Overage: 10-20%'],
    rangesKo: ['일반 reaction volume: 10-50 uL', 'Primer 최종 농도: 약 0.1-0.5 uM', 'Overage: 10-20%'],
    cautionsEn: ['Too much primer/probe can cause non-specific amplification and primer-dimer.', 'Repeated freeze-thaw of enzyme reduces activity.'],
    cautionsKo: ['Primer/probe 과량은 non-specific amplification과 primer-dimer를 유발할 수 있습니다.', 'enzyme의 반복 freeze-thaw는 활성 저하를 유발합니다.'],
  },
  'multi-stock-mix': {
    intentEn: 'Mix multiple stock solutions to reach target concentration for each component in one final mixture.',
    intentKo: '여러 stock solution을 혼합해 각 component의 target concentration을 하나의 final mixture에서 맞춥니다.',
    reagentsEn: ['Component stock solutions', 'Solvent (water or buffer)', 'Calibrated pipettes'],
    reagentsKo: ['각 component stock solution', 'Solvent (water 또는 buffer)', '보정된 pipette'],
    workflowEn: ['Calculate total target volume including overage first.', 'Calculate each component volume from stock/target ratio.', 'Add solvent last to exact final volume.'],
    workflowKo: ['먼저 overage가 포함된 total target volume을 계산합니다.', 'stock/target ratio로 각 component volume을 계산합니다.', '마지막에 solvent를 넣어 정확한 final volume을 맞춥니다.'],
    rangesEn: ['Prefer pipetting volume >= 1 uL', 'If volume is too small, prepare intermediate dilution stock.'],
    rangesKo: ['권장 pipetting volume >= 1 uL', 'volume이 너무 작으면 intermediate dilution stock을 만듭니다.'],
    cautionsEn: ['Adding solvent first can overflow final volume and distort concentration.', 'High solute fraction can change viscosity and reduce mixing quality.'],
    cautionsKo: ['solvent를 먼저 넣으면 final volume 초과로 농도가 왜곡될 수 있습니다.', 'solute 비율이 너무 높으면 점도 변화로 mixing quality가 떨어집니다.'],
  },
  'serial-dilution': {
    intentEn: 'Generate stepwise concentration series for standard curves, titration, or sensitivity testing.',
    intentKo: 'standard curve, titration, sensitivity test를 위해 단계별 농도 series를 만듭니다.',
    reagentsEn: ['Starting sample', 'Diluent (buffer or media)', 'Identical tubes/plates'],
    reagentsKo: ['시작 sample', 'Diluent (buffer 또는 media)', '동일한 tube/plate'],
    workflowEn: ['Dispense diluent to every tube first.', 'Transfer fixed volume from previous tube, then mix thoroughly.', 'Change tip each step to avoid carryover.'],
    workflowKo: ['모든 tube에 먼저 diluent를 분주합니다.', '이전 tube에서 고정 volume을 옮긴 뒤 충분히 혼합합니다.', 'carryover 방지를 위해 매 단계 tip을 교체합니다.'],
    rangesEn: ['Typical step dilution factor: 1:2 to 1:10', 'Use enough final volume for downstream assay replicate.'],
    rangesKo: ['일반 단계 희석배수: 1:2 ~ 1:10', '후속 assay 반복을 고려해 final volume을 충분히 확보합니다.'],
    cautionsEn: ['Poor mixing each step produces non-linear standard curves.', 'Tip reuse overestimates concentration in lower tubes.'],
    cautionsKo: ['각 단계 mixing 부족은 standard curve 비선형을 유발합니다.', 'tip 재사용은 낮은 농도 tube의 농도를 과대평가하게 만듭니다.'],
  },
  'copy-number': {
    intentEn: 'Convert nucleic-acid mass/concentration to molecule copy number for qPCR planning.',
    intentKo: 'qPCR planning을 위해 nucleic acid mass/concentration을 molecule copy number로 변환합니다.',
    reagentsEn: ['DNA/RNA concentration value', 'Sequence length (bp/nt)', 'Strand type (dsDNA/ssDNA/RNA)'],
    reagentsKo: ['DNA/RNA concentration 값', 'Sequence length (bp/nt)', 'strand type (dsDNA/ssDNA/RNA)'],
    workflowEn: ['Convert concentration to mass per reaction.', 'Convert mass to moles using molecular-weight constant.', 'Multiply by Avogadro number to get copy number.'],
    workflowKo: ['concentration을 reaction당 mass로 변환합니다.', 'molecular-weight constant로 mass를 moles로 변환합니다.', 'Avogadro number를 곱해 copy number를 계산합니다.'],
    rangesEn: ['Common qPCR standard range: about 1e1 to 1e9 copies/reaction'],
    rangesKo: ['일반 qPCR standard range: 약 1e1 ~ 1e9 copies/reaction'],
    cautionsEn: ['Using wrong strand constant gives large copy-number error.', 'Oligo sequence composition can deviate from average MW constant.'],
    cautionsKo: ['strand constant를 잘못 쓰면 copy number 오차가 크게 발생합니다.', 'oligo는 sequence composition에 따라 평균 MW constant와 차이가 날 수 있습니다.'],
  },
  ligation: {
    intentEn: 'Estimate insert amount for ligation based on vector amount and molar ratio.',
    intentKo: 'vector amount와 molar ratio를 기반으로 ligation에 필요한 insert amount를 계산합니다.',
    reagentsEn: ['Vector DNA', 'Insert DNA', 'Ligation buffer', 'Ligase'],
    reagentsKo: ['Vector DNA', 'Insert DNA', 'Ligation buffer', 'Ligase'],
    workflowEn: ['Use molar ratio (not mass ratio) to calculate insert amount.', 'Prepare ligation mix with fresh buffer and ligase.', 'Include vector-only control to estimate background.'],
    workflowKo: ['mass ratio가 아닌 molar ratio로 insert amount를 계산합니다.', 'fresh buffer와 ligase로 ligation mix를 준비합니다.', 'background 확인을 위해 vector-only control을 포함합니다.'],
    rangesEn: ['Common insert:vector ratio: 3:1 to 5:1'],
    rangesKo: ['일반 insert:vector ratio: 3:1 ~ 5:1'],
    cautionsEn: ['Incorrect length input directly breaks molar-ratio calculation.', 'High-salt DNA prep can inhibit ligase reaction.'],
    cautionsKo: ['length 입력 오류는 molar-ratio 계산을 직접 망가뜨립니다.', 'salt가 높은 DNA prep은 ligase 반응을 억제할 수 있습니다.'],
  },
  a260: {
    intentEn: 'Estimate nucleic-acid concentration and purity from UV absorbance.',
    intentKo: 'UV absorbance로 nucleic acid concentration과 purity를 추정합니다.',
    reagentsEn: ['Sample DNA/RNA', 'Matching blank buffer', 'UV spectrophotometer'],
    reagentsKo: ['DNA/RNA sample', '동일한 blank buffer', 'UV spectrophotometer'],
    workflowEn: ['Blank with the exact sample buffer.', 'Measure A260 and optional A280.', 'Convert absorbance to concentration using type-specific factor.'],
    workflowKo: ['sample와 동일한 buffer로 blank를 맞춥니다.', 'A260과 필요 시 A280을 측정합니다.', 'type별 factor로 absorbance를 concentration으로 변환합니다.'],
    rangesEn: ['Recommended absorbance window: A260 0.1-1.0', 'Typical purity ratio: DNA ~1.8, RNA ~2.0'],
    rangesKo: ['권장 absorbance 범위: A260 0.1-1.0', '일반 purity ratio: DNA 약 1.8, RNA 약 2.0'],
    cautionsEn: ['Salt/protein contaminants can inflate concentration estimate.', 'Very low A260 has poor precision.'],
    cautionsKo: ['salt/protein 오염은 concentration을 과대추정하게 만듭니다.', 'A260이 너무 낮으면 정밀도가 떨어집니다.'],
  },
  'cell-seeding': {
    intentEn: 'Prepare uniform cell distribution with target seeding density and volume.',
    intentKo: 'target seeding density와 volume에 맞춰 균일한 cell 분포를 준비합니다.',
    reagentsEn: ['Cell suspension', 'Culture media', 'Plate with known well area/volume'],
    reagentsKo: ['Cell suspension', 'Culture media', 'well area/volume이 확인된 plate'],
    workflowEn: ['Calculate required cells and suspension volume first.', 'Add overage for pipetting loss and dead volume.', 'Mix gently before each dispense.'],
    workflowKo: ['먼저 필요한 cell 수와 suspension volume을 계산합니다.', 'pipetting loss와 dead volume을 위해 overage를 포함합니다.', '각 분주 직전에 부드럽게 혼합합니다.'],
    rangesEn: ['Common seeding range: 1e4-1e5 cells/cm2 (cell-line dependent)', 'Overage: usually >=10%'],
    rangesKo: ['일반 seeding 범위: 1e4-1e5 cells/cm2 (cell-line 의존)', 'Overage: 보통 >=10%'],
    cautionsEn: ['Insufficient mixing causes center/edge bias in cell distribution.', 'Wrong well area causes systematic density error.'],
    cautionsKo: ['mixing 부족은 center/edge 분포 편향을 유발합니다.', 'well area 오입력은 density 전반에 체계적 오차를 만듭니다.'],
  },
  hemocytometer: {
    intentEn: 'Estimate viable cell concentration and viability before seeding or treatment.',
    intentKo: 'seeding 또는 treatment 전에 viable cell concentration과 viability를 추정합니다.',
    reagentsEn: ['Cell suspension', 'Trypan blue', 'Hemocytometer and microscope'],
    reagentsKo: ['Cell suspension', 'Trypan blue', 'Hemocytometer와 microscope'],
    workflowEn: ['Mix sample with trypan blue at fixed ratio.', 'Load chamber without overflow.', 'Count multiple squares for robust average.'],
    workflowKo: ['고정 비율로 sample과 trypan blue를 혼합합니다.', 'overflow 없이 chamber를 로딩합니다.', '안정적인 평균을 위해 여러 square를 카운트합니다.'],
    rangesEn: ['Recommended counting density: about 20-50 cells per large square'],
    rangesKo: ['권장 카운팅 밀도: large square 당 약 20-50 cells'],
    cautionsEn: ['Too few squares increases sampling noise.', 'Cell clumps overestimate viable concentration.'],
    cautionsKo: ['카운트 square가 너무 적으면 sampling noise가 증가합니다.', 'cell clump는 viable concentration을 과대평가하게 만듭니다.'],
  },
  'rcf-rpm': {
    intentEn: 'Convert centrifuge settings between RPM and RCF (x g) with rotor radius.',
    intentKo: 'rotor radius를 반영해 centrifuge 설정을 RPM과 RCF (x g) 사이에서 변환합니다.',
    reagentsEn: ['Rotor radius (cm)', 'Target RPM or target RCF'],
    reagentsKo: ['Rotor radius (cm)', 'target RPM 또는 target RCF'],
    workflowEn: ['Measure radius from rotor center to sample midpoint.', 'Convert using calculator and record both units in SOP.', 'Use RCF for protocol portability across instruments.'],
    workflowKo: ['rotor 중심에서 sample 중간점까지 radius를 측정합니다.', '계산기로 변환하고 SOP에 두 단위를 함께 기록합니다.', '장비 간 재현성을 위해 protocol은 RCF 기준으로 관리합니다.'],
    rangesEn: ['Cell pelleting often: 300-500 x g', 'DNA precipitation often: >=12000 x g'],
    rangesKo: ['cell pelleting 일반 범위: 300-500 x g', 'DNA precipitation 일반 범위: >=12000 x g'],
    cautionsEn: ['Same RPM on different rotors gives different RCF.', 'Wrong radius input can produce major force error.'],
    cautionsKo: ['다른 rotor에서 같은 RPM은 다른 RCF를 만듭니다.', 'radius 오입력은 실제 원심력에 큰 오차를 만듭니다.'],
  },
  reconstitution: {
    intentEn: 'Compute solvent volume to reconstitute powder into target concentration stock.',
    intentKo: 'powder를 target concentration stock으로 맞추기 위한 solvent volume을 계산합니다.',
    reagentsEn: ['Vial mass', 'Molecular weight', 'Target concentration', 'Solvent'],
    reagentsKo: ['vial mass', 'Molecular weight', 'target concentration', 'solvent'],
    workflowEn: ['Convert mass to moles first.', 'Back-calculate volume for target concentration.', 'Optionally compute final volume after dilution target.'],
    workflowKo: ['먼저 mass를 moles로 변환합니다.', 'target concentration 기준으로 필요한 volume을 역산합니다.', '필요 시 dilution 후 final volume을 추가 계산합니다.'],
    rangesEn: ['Avoid very small final volumes; practical pipetting is usually >=10 uL'],
    rangesKo: ['final volume이 너무 작지 않게 설정하세요. 실무 pipetting은 보통 >=10 uL 권장입니다.'],
    cautionsEn: ['Wrong MW unit breaks all downstream concentration values.', 'Stock too concentrated may precipitate depending on solubility.'],
    cautionsKo: ['MW 단위 오류는 이후 농도값 전체를 왜곡합니다.', 'stock 농도가 너무 높으면 solubility에 따라 침전될 수 있습니다.'],
  },
  'gel-loading': {
    intentEn: 'Calculate loading mix volume/mass that fits well capacity and dye condition.',
    intentKo: 'well capacity와 dye 조건을 만족하는 loading mix volume/mass를 계산합니다.',
    reagentsEn: ['DNA sample', 'Loading dye (e.g., 6X)', 'Agarose gel with known well volume'],
    reagentsKo: ['DNA sample', 'Loading dye (예: 6X)', 'well volume이 확인된 agarose gel'],
    workflowEn: ['Calculate required DNA sample volume from target mass.', 'Add water if needed to reach practical pre-dye volume.', 'Add dye to 1X final before loading.'],
    workflowKo: ['target mass에서 필요한 DNA sample volume을 계산합니다.', '필요 시 practical pre-dye volume까지 water를 보충합니다.', 'loading 전 dye를 1X 최종농도로 맞춥니다.'],
    rangesEn: ['Typical DNA per band: about 50-100 ng', 'Keep loading volume below about 70-80% of well capacity'],
    rangesKo: ['일반 band당 DNA 양: 약 50-100 ng', 'loading volume은 well capacity의 약 70-80% 이하 권장'],
    cautionsEn: ['Well overflow causes cross-lane contamination.', 'Excess DNA loading produces smeared bands.'],
    cautionsKo: ['well overflow는 lane 간 오염을 유발합니다.', 'DNA 과량 로딩은 smeared band를 유발합니다.'],
  },
  'qpcr-relative-quant': {
    intentEn: 'Compute relative expression change using dCt, ddCt, and fold-change.',
    intentKo: 'dCt, ddCt, fold-change 기반으로 relative expression 변화를 계산합니다.',
    reagentsEn: ['Ct target/reference for sample and control', 'Stable reference gene'],
    reagentsKo: ['sample/control의 target/reference Ct', '안정적인 reference gene'],
    workflowEn: ['Compute dCt for sample and control.', 'Compute ddCt = dCt(sample) - dCt(control).', 'Compute fold change as 2^(-ddCt).'],
    workflowKo: ['sample과 control의 dCt를 계산합니다.', 'ddCt = dCt(sample) - dCt(control)을 계산합니다.', 'fold change를 2^(-ddCt)로 계산합니다.'],
    rangesEn: ['Review replicate Ct spread before interpreting biological effect.'],
    rangesKo: ['생물학적 해석 전 replicate Ct 분산을 먼저 확인합니다.'],
    cautionsEn: ['Unstable reference gene can invert fold-change interpretation.', 'High Ct values may be near detection limit.'],
    cautionsKo: ['reference gene이 불안정하면 fold-change 해석이 왜곡됩니다.', 'Ct가 너무 높으면 detection limit 근처일 수 있습니다.'],
  },
  'cell-doubling-time': {
    intentEn: 'Estimate growth-rate constant and doubling time from two counts and elapsed time.',
    intentKo: '두 시점 cell count와 경과시간으로 growth-rate constant와 doubling time을 추정합니다.',
    reagentsEn: ['Start/end date-time', 'Initial/final cell counts'],
    reagentsKo: ['start/end date-time', 'initial/final cell count'],
    workflowEn: ['Use measurements from log-phase growth interval.', 'Compute growth rate with natural log.', 'Compute doubling time as ln(2)/k.'],
    workflowKo: ['log-phase 성장 구간의 측정값을 사용합니다.', 'natural log로 growth rate를 계산합니다.', 'doubling time = ln(2)/k로 계산합니다.'],
    rangesEn: ['Ensure end time is later and final count is higher than initial for meaningful doubling.'],
    rangesKo: ['의미 있는 doubling 계산을 위해 end time이 더 늦고 final count가 더 커야 합니다.'],
    cautionsEn: ['Including lag/confluent phase distorts doubling-time estimate.', 'Date-time typo can create extreme artifacts.'],
    cautionsKo: ['lag/confluent phase를 포함하면 doubling-time이 왜곡됩니다.', 'date-time 오입력은 극단적 계산 오류를 만들 수 있습니다.'],
  },
  'cloning-helper': {
    intentEn: 'Approximate conversion between DNA length and protein molecular weight for cloning planning.',
    intentKo: 'cloning planning을 위해 DNA length와 protein molecular weight 간 근사 변환을 수행합니다.',
    reagentsEn: ['DNA length (bp) or target protein size (kDa)'],
    reagentsKo: ['DNA length (bp) 또는 target protein size (kDa)'],
    workflowEn: ['Convert bp to amino-acid count (bp/3).', 'Estimate MW using average aa mass (~110 Da).', 'Use result as planning estimate, not exact observed band.'],
    workflowKo: ['bp/3으로 amino-acid count를 계산합니다.', '평균 aa mass (~110 Da)로 MW를 추정합니다.', '결과는 planning용 근사치로 사용하고 observed band의 절대값으로 해석하지 않습니다.'],
    rangesEn: ['Useful for quick design sanity check before cloning expression tests.'],
    rangesKo: ['cloning/expression test 전 빠른 design sanity check에 유용합니다.'],
    cautionsEn: ['Tags, signal peptides, and PTMs shift observed MW.', 'Stop codon/readthrough assumptions can change expected size.'],
    cautionsKo: ['tag, signal peptide, PTM은 observed MW를 변화시킵니다.', 'stop codon/readthrough 가정에 따라 예상 크기가 달라질 수 있습니다.'],
  },
  'acid-dilution': {
    intentEn: 'Convert concentrated acid percentage/density to stock molarity and dilution volume.',
    intentKo: 'concentrated acid의 percentage/density를 stock molarity와 dilution volume으로 변환합니다.',
    reagentsEn: ['Acid percentage (%)', 'Density (g/mL)', 'Molecular weight', 'Target molarity and final volume'],
    reagentsKo: ['acid percentage (%)', 'density (g/mL)', 'molecular weight', 'target molarity와 final volume'],
    workflowEn: ['Calculate stock molarity from percentage and density.', 'Compute required acid volume by C1V1=C2V2 logic.', 'Add acid into water slowly with cooling.'],
    workflowKo: ['percentage와 density로 stock molarity를 계산합니다.', 'C1V1=C2V2 로직으로 필요한 acid volume을 계산합니다.', '반드시 water에 acid를 천천히 넣고 냉각합니다.'],
    rangesEn: ['Work in fume hood with PPE and secondary containment.'],
    rangesKo: ['fume hood에서 PPE와 2차 containment를 사용합니다.'],
    cautionsEn: ['Acid volume above final volume means target is physically impossible.', 'Reverse addition (water into acid) can cause violent heat release.'],
    cautionsKo: ['required acid volume이 final volume보다 크면 목표 조건이 물리적으로 불가능합니다.', 'water를 acid에 넣는 역순 혼합은 급격한 발열을 유발할 수 있습니다.'],
  },
  'transformation-efficiency': {
    intentEn: 'Estimate competent-cell quality from CFU/ug DNA and log efficiency.',
    intentKo: 'CFU/ug DNA와 log efficiency로 competent cell quality를 추정합니다.',
    reagentsEn: ['Total DNA used', 'Transformation total volume', 'Plated volume', 'Colony count'],
    reagentsKo: ['total DNA used', 'transformation total volume', 'plated volume', 'colony count'],
    workflowEn: ['Compute DNA amount actually plated.', 'Compute efficiency = colony count / plated DNA.', 'Log-transform for easy benchmark comparison.'],
    workflowKo: ['실제로 plated된 DNA 양을 계산합니다.', 'efficiency = colony count / plated DNA를 계산합니다.', 'benchmark 비교를 위해 log 변환 값을 함께 확인합니다.'],
    rangesEn: ['High-quality competent cells are often around 1e8 CFU/ug or above (protocol dependent).'],
    rangesKo: ['고효율 competent cell은 보통 1e8 CFU/ug 이상이 목표입니다 (protocol 의존).'],
    cautionsEn: ['Mismatch between plated fraction and colony plate invalidates efficiency.', 'Contaminated control plate can fake high background colony counts.'],
    cautionsKo: ['plated fraction 계산과 실제 plate 조건이 다르면 효율 계산이 무효가 됩니다.', 'control plate 오염은 background colony를 과대평가하게 만듭니다.'],
  },
};

export function CalculationGuide({ id, locale }: { id: string; locale: Locale }) {
  const labels =
    locale === 'ko'
      ? {
          title: '실험 가이드',
          intent: '실험 의도',
          reagents: '용액/시약',
          workflow: '실험 순서',
          ranges: '권장 범위',
          cautions: '주의할 점',
          glossary: '용어 도움말',
        }
      : {
          title: 'Experiment Guide',
          intent: 'Intent',
          reagents: 'Reagents',
          workflow: 'Workflow',
          ranges: 'Recommended range',
          cautions: 'Cautions',
          glossary: 'Glossary',
        };
  const guide = GUIDE[id];
  if (!guide) return null;

  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-sm">
      <p className="text-slate-600">{labels.title}</p>
      <div className="mt-2 space-y-2 text-slate-800">
        <p>
          <span className="font-semibold">{labels.intent}: </span>
          {locale === 'ko' ? guide.intentKo : guide.intentEn}
        </p>
        <p className="font-semibold">{labels.reagents}</p>
        <ul className="list-disc pl-5">
          {(locale === 'ko' ? guide.reagentsKo : guide.reagentsEn).map((line) => (
            <li key={`${id}-reagent-${line}`}>{line}</li>
          ))}
        </ul>
        <p className="font-semibold">{labels.workflow}</p>
        <ul className="list-disc pl-5">
          {(locale === 'ko' ? guide.workflowKo : guide.workflowEn).map((line) => (
            <li key={`${id}-workflow-${line}`}>{line}</li>
          ))}
        </ul>
        <p className="font-semibold">{labels.ranges}</p>
        <ul className="list-disc pl-5">
          {(locale === 'ko' ? guide.rangesKo : guide.rangesEn).map((line) => (
            <li key={`${id}-range-${line}`}>{line}</li>
          ))}
        </ul>
        <p className="font-semibold">{labels.cautions}</p>
        <ul className="list-disc pl-5">
          {(locale === 'ko' ? guide.cautionsKo : guide.cautionsEn).map((line) => (
            <li key={`${id}-caution-${line}`}>{line}</li>
          ))}
        </ul>
        <details className="rounded border border-slate-200 bg-white p-2">
          <summary className="cursor-pointer font-semibold">{labels.glossary}</summary>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
            <li>
              <span className="font-semibold">Overage:</span>{' '}
              {locale === 'ko' ? 'pipetting 오차를 보정하기 위한 여유 부피/비율' : 'extra volume/ratio to absorb pipetting error'}
            </li>
            <li>
              <span className="font-semibold">Molar ratio:</span>{' '}
              {locale === 'ko' ? '분자 수 기준 비율(질량비와 다름)' : 'molecule-count based ratio (different from mass ratio)'}
            </li>
            <li>
              <span className="font-semibold">Control:</span>{' '}
              {locale === 'ko' ? '실험 조건의 정상/오염 여부를 판별하는 기준 반응' : 'reference reaction to validate run quality and contamination status'}
            </li>
            <li>
              <span className="font-semibold">Fold change:</span>{' '}
              {locale === 'ko' ? '기준군 대비 상대 변화 배수' : 'relative change multiple versus control condition'}
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
