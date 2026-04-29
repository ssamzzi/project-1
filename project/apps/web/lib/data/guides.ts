export interface GuideMeta {
  id: string;
  slug: string;
  titleEn: string;
  titleKo: string;
  shortEn: string;
  shortKo: string;
}

export const guideMetas: GuideMeta[] = [
  { id: 'primer-tm', slug: 'primer-tm', titleEn: 'Primer Tm Curation', titleKo: 'Primer Tm 정리', shortEn: 'How to evaluate and compare Tm estimates', shortKo: 'Tm 추정값을 비교하고 해석하는 방법' },
  { id: 'statistical-test-chooser', slug: 'statistical-test-chooser', titleEn: 'Statistical Test Chooser', titleKo: '통계 검정 선택 가이드', shortEn: 'Simple decision tree and links', shortKo: '실험 설계에 맞는 통계 검정을 고르는 기본 기준' },
  { id: 'buffer-ph-pka', slug: 'buffer-ph-pka', titleEn: 'Buffer pH / pKa', titleKo: 'Buffer pH와 pKa', shortEn: 'Why buffer compatibility matters', shortKo: 'buffer compatibility가 중요한 이유' },
  { id: 'osmolarity', slug: 'osmolarity', titleEn: 'Osmolarity Curation', titleKo: 'Osmolarity 정리', shortEn: 'Practical checklist for media prep', shortKo: 'media와 buffer 준비 전 osmolarity를 점검하는 방법' },
  { id: 'a260-purity-ratios', slug: 'a260-purity-ratios', titleEn: 'A260 Purity Ratios in Practice', titleKo: 'A260 purity ratio 실전 해석', shortEn: 'How to read A260/280 and A260/230 before using a sample', shortKo: 'sample 사용 전 A260/280과 A260/230을 해석하는 방법' },
  { id: 'ligation-molar-ratio-planning', slug: 'ligation-molar-ratio-planning', titleEn: 'Ligation Molar Ratio Planning', titleKo: 'Ligation molar ratio 계획', shortEn: 'Choose insert and vector amounts without falling back to mass ratio shortcuts', shortKo: 'mass ratio shortcut 대신 insert와 vector 양을 정하는 방법' },
  { id: 'qpcr-ddct-interpretation', slug: 'qpcr-ddct-interpretation', titleEn: 'qPCR ddCt Interpretation', titleKo: 'qPCR ddCt 해석', shortEn: 'Know when fold change is meaningful and when the upstream data are too weak', shortKo: 'fold change를 믿어도 되는 조건과 조심해야 할 조건' },
  { id: 'cell-seeding-density-planning', slug: 'cell-seeding-density-planning', titleEn: 'Cell Seeding Density Planning', titleKo: 'Cell seeding density 계획', shortEn: 'Translate target confluence and assay timing into a practical seeding plan', shortKo: 'target confluence와 assay timing을 seeding plan으로 바꾸는 방법' },
  { id: 'hemocytometer-counting-quality', slug: 'hemocytometer-counting-quality', titleEn: 'Hemocytometer Counting Quality Checks', titleKo: 'Hemocytometer counting quality check', shortEn: 'Reduce counting noise, clump bias, and dilution mistakes in manual counts', shortKo: 'manual count에서 noise, clump bias, dilution error를 줄이는 방법' },
  { id: 'centrifuge-rcf-vs-rpm', slug: 'centrifuge-rcf-vs-rpm', titleEn: 'RCF vs RPM for Centrifuge Protocols', titleKo: 'Centrifuge protocol의 RCF와 RPM', shortEn: 'Match published spin conditions to your own rotor instead of copying RPM blindly', shortKo: 'published RPM을 그대로 복사하지 않고 자기 rotor에 맞추는 방법' },
  { id: 'pcr-contamination-control', slug: 'pcr-contamination-control', titleEn: 'PCR Contamination Control', titleKo: 'PCR contamination control', shortEn: 'How to separate setup, template, controls, and interpretation when contamination is suspected', shortKo: 'contamination이 의심될 때 setup, template, control, 해석을 분리하는 방법' },
  { id: 'qpcr-control-design', slug: 'qpcr-control-design', titleEn: 'qPCR Control Design', titleKo: 'qPCR control design', shortEn: 'NTC, no-RT, reference genes, and replicate design before interpreting Ct values', shortKo: 'Ct 해석 전 NTC, no-RT, reference gene, replicate를 설계하는 방법' },
  { id: 'primer-design-checklist', slug: 'primer-design-checklist', titleEn: 'Primer Design Checklist', titleKo: 'Primer design checklist', shortEn: 'A practical review list for specificity, length, GC balance, dimers, and amplicon context', shortKo: 'specificity, length, GC balance, dimer, amplicon context를 점검하는 목록' },
  { id: 'dna-sample-storage-handling', slug: 'dna-sample-storage-handling', titleEn: 'DNA Sample Storage and Handling', titleKo: 'DNA sample 보관과 취급', shortEn: 'Storage, freeze-thaw, labeling, and documentation practices for nucleic acid samples', shortKo: '핵산 sample의 storage, freeze-thaw, labeling, documentation 기준' },
  { id: 'rna-handling-quality', slug: 'rna-handling-quality', titleEn: 'RNA Handling Quality Guide', titleKo: 'RNA handling quality guide', shortEn: 'RNase control, degradation signs, storage choices, and downstream interpretation', shortKo: 'RNase control, degradation sign, storage, downstream 해석 기준' },
  { id: 'gel-electrophoresis-troubleshooting', slug: 'gel-electrophoresis-troubleshooting', titleEn: 'Gel Electrophoresis Troubleshooting', titleKo: 'Gel electrophoresis troubleshooting', shortEn: 'Band shape, smearing, ladder choice, loading mass, and voltage decisions', shortKo: 'band shape, smear, ladder, loading amount, voltage를 점검하는 방법' },
  { id: 'pipetting-error-reduction', slug: 'pipetting-error-reduction', titleEn: 'Reducing Pipetting Error', titleKo: 'Pipetting error 줄이기', shortEn: 'Small-volume planning, dead volume, pre-wetting, and repeatability habits', shortKo: 'small volume, dead volume, pre-wetting, repeatability habit 정리' },
  { id: 'serial-dilution-error-propagation', slug: 'serial-dilution-error-propagation', titleEn: 'Serial Dilution Error Propagation', titleKo: 'Serial dilution error propagation', shortEn: 'Why small transfer mistakes compound across a dilution series', shortKo: '작은 transfer error가 dilution series 전체로 커지는 이유' },
  { id: 'cell-viability-interpretation', slug: 'cell-viability-interpretation', titleEn: 'Cell Viability Interpretation', titleKo: 'Cell viability 해석', shortEn: 'How to interpret viability with counting quality, treatment context, and assay timing', shortKo: 'count quality, treatment context, assay timing과 함께 viability를 해석하는 방법' },
  { id: 'aseptic-technique-basics', slug: 'aseptic-technique-basics', titleEn: 'Aseptic Technique Basics', titleKo: '무균 조작 기본', shortEn: 'Practical contamination prevention habits for cell culture and routine bench work', shortKo: 'cell culture와 routine bench work에서 contamination을 줄이는 기본 습관' },
  { id: 'media-buffer-prep-records', slug: 'media-buffer-prep-records', titleEn: 'Media and Buffer Preparation Records', titleKo: 'Media와 buffer preparation 기록', shortEn: 'What to record when preparing media, buffers, supplements, and working stocks', shortKo: 'media, buffer, supplement, working stock 준비 시 기록할 항목' },
  { id: 'experiment-notebook-standards', slug: 'experiment-notebook-standards', titleEn: 'Experiment Notebook Standards', titleKo: '실험노트 기록 기준', shortEn: 'How to record assumptions, calculations, deviations, and interpretation in a reusable way', shortKo: '가정, 계산, deviation, interpretation을 재사용 가능하게 기록하는 방법' },
  { id: 'replicate-planning', slug: 'replicate-planning', titleEn: 'Replicate Planning for Bench Experiments', titleKo: '반복수 계획', shortEn: 'Technical replicates, biological replicates, controls, and volume planning in one place', shortKo: 'technical replicate, biological replicate, control, volume planning을 함께 보는 방법' },
  { id: 'plate-layout-planning', slug: 'plate-layout-planning', titleEn: 'Plate Layout Planning', titleKo: 'Plate layout 계획', shortEn: 'Reduce edge effects, labeling mistakes, and control confusion before plating', shortKo: 'edge effect, labeling mistake, control confusion을 줄이는 plate 설계' },
  { id: 'troubleshooting-mindset', slug: 'troubleshooting-mindset', titleEn: 'Troubleshooting Mindset for Lab Work', titleKo: '실험 troubleshooting 사고법', shortEn: 'A structured way to separate sample, reagent, instrument, and operator causes', shortKo: 'sample, reagent, instrument, operator 원인을 분리해 보는 구조' },
  { id: 'lab-calculation-documentation', slug: 'lab-calculation-documentation', titleEn: 'Documenting Lab Calculations', titleKo: '실험 계산 기록법', shortEn: 'How to make calculation outputs reviewable, repeatable, and useful after the experiment', shortKo: '계산 결과를 검토 가능하고 반복 가능하게 남기는 방법' },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return guideMetas.find((g) => g.slug === slug);
}
