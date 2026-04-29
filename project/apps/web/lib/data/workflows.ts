export interface WorkflowMeta {
  id: string;
  slug: string;
  titleEn: string;
  titleKo: string;
  shortEn: string;
  shortKo: string;
  tools: string[];
}

export const workflowMetas: WorkflowMeta[] = [
  { id: 'cell-culture', slug: 'cell-culture', titleEn: 'Cell culture routine', titleKo: 'Cell culture routine', shortEn: 'Seeding, counting, and media handling checklist', shortKo: 'seeding, counting, media handling을 연결한 체크리스트', tools: ['cell-seeding', 'hemocytometer'] },
  { id: 'pcr-qpcr', slug: 'pcr-qpcr', titleEn: 'PCR and qPCR setup', titleKo: 'PCR과 qPCR setup', shortEn: 'Master mix balance and control planning', shortKo: 'master mix balance와 control planning 흐름', tools: ['pcr-master-mix', 'copy-number'] },
  { id: 'cloning', slug: 'cloning', titleEn: 'Molecular cloning', titleKo: 'Molecular cloning workflow', shortEn: 'Ligation molar ratio and dilution checks', shortKo: 'ligation molar ratio와 dilution check를 연결한 흐름', tools: ['ligation', 'multi-stock-mix'] },
  { id: 'dna-quant-to-pcr', slug: 'dna-quant-to-pcr', titleEn: 'DNA quantification to PCR setup', titleKo: 'DNA 정량에서 PCR setup까지', shortEn: 'Move from concentration check to dilution planning and final PCR mix assembly', shortKo: 'concentration check에서 dilution planning과 PCR mix assembly까지 연결', tools: ['a260', 'serial-dilution', 'pcr-master-mix'] },
  { id: 'qpcr-standard-curve-prep', slug: 'qpcr-standard-curve-prep', titleEn: 'qPCR standard curve preparation', titleKo: 'qPCR standard curve 준비', shortEn: 'Build a standard series, document copy number assumptions, and protect replicate volume', shortKo: 'standard series, copy number assumption, replicate volume을 함께 관리', tools: ['copy-number', 'serial-dilution', 'pcr-master-mix'] },
  { id: 'ligation-to-transformation', slug: 'ligation-to-transformation', titleEn: 'Ligation to transformation sequence', titleKo: 'Ligation에서 transformation까지', shortEn: 'Connect ligation setup to transformation plating and final efficiency review', shortKo: 'ligation setup, transformation plating, final efficiency review 연결', tools: ['ligation', 'multi-stock-mix', 'transformation-efficiency'] },
  { id: 'manual-count-to-plating', slug: 'manual-count-to-plating', titleEn: 'Manual count to plating plan', titleKo: 'Manual count에서 plating plan까지', shortEn: 'Use hemocytometer data to prepare a mixed suspension and seed plates consistently', shortKo: 'hemocytometer data로 mixed suspension을 준비하고 일관되게 plating', tools: ['hemocytometer', 'cell-seeding', 'cell-doubling-time'] },
  { id: 'rna-to-qpcr', slug: 'rna-to-qpcr', titleEn: 'RNA handling to qPCR interpretation', titleKo: 'RNA handling에서 qPCR 해석까지', shortEn: 'Connect RNA quality, reverse transcription, controls, and final Ct interpretation', shortKo: 'RNA quality, reverse transcription, control, Ct interpretation 연결', tools: ['qpcr-relative-quant', 'pcr-master-mix'] },
  { id: 'gel-check-to-cleanup', slug: 'gel-check-to-cleanup', titleEn: 'Gel check to cleanup decision', titleKo: 'Gel 확인에서 cleanup 결정까지', shortEn: 'Use gel behavior to decide whether to proceed, repeat, excise, or clean up', shortKo: 'gel 결과로 proceed, repeat, excise, cleanup 여부를 판단', tools: ['gel-loading', 'a260'] },
  { id: 'cell-treatment-plate-plan', slug: 'cell-treatment-plate-plan', titleEn: 'Cell treatment plate planning', titleKo: 'Cell treatment plate planning', shortEn: 'Plan seeding, treatment timing, controls, viability checks, and plate layout together', shortKo: 'seeding, treatment timing, control, viability, plate layout을 함께 계획', tools: ['cell-seeding', 'hemocytometer', 'cell-doubling-time'] },
  { id: 'buffer-media-prep', slug: 'buffer-media-prep', titleEn: 'Buffer and media preparation workflow', titleKo: 'Buffer와 media preparation workflow', shortEn: 'Plan pH, osmolarity, supplements, labeling, and storage records before use', shortKo: 'pH, osmolarity, supplement, labeling, storage record를 사용 전 계획', tools: ['reconstitution', 'multi-stock-mix'] },
  { id: 'experiment-review-cycle', slug: 'experiment-review-cycle', titleEn: 'Experiment review and troubleshooting cycle', titleKo: '실험 검토와 troubleshooting cycle', shortEn: 'Turn calculations, controls, observations, and deviations into a reusable review loop', shortKo: 'calculation, control, observation, deviation을 재사용 가능한 review loop로 정리', tools: ['pcr-master-mix', 'serial-dilution', 'cell-seeding'] },
];

export function workflowBySlug(slug: string): WorkflowMeta | undefined {
  return workflowMetas.find((w) => w.slug === slug);
}
