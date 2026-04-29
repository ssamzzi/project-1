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
  {
    id: 'cell-culture',
    slug: 'cell-culture',
    titleEn: 'Cell culture routine',
    titleKo: '세포 배양 루틴',
    shortEn: 'Seeding, counting, and media handling checklist',
    shortKo: '시딩, 계수, 배지 처리 체크리스트',
    tools: ['cell-seeding', 'hemocytometer'],
  },
  {
    id: 'pcr-qpcr',
    slug: 'pcr-qpcr',
    titleEn: 'PCR and qPCR setup',
    titleKo: 'PCR 및 qPCR 세팅',
    shortEn: 'Master mix balance and control planning',
    shortKo: 'master mix 균형과 대조군 계획',
    tools: ['pcr-master-mix', 'copy-number'],
  },
  {
    id: 'cloning',
    slug: 'cloning',
    titleEn: 'Molecular cloning',
    titleKo: '분자 클로닝',
    shortEn: 'Ligation molar ratio and dilution checks',
    shortKo: 'ligation 몰 비율과 희석 점검',
    tools: ['ligation', 'multi-stock-mix'],
  },
  {
    id: 'dna-quant-to-pcr',
    slug: 'dna-quant-to-pcr',
    titleEn: 'DNA quantification to PCR setup',
    titleKo: 'DNA 정량에서 PCR 세팅까지',
    shortEn: 'Move from concentration check to dilution planning and final PCR mix assembly',
    shortKo: '농도 확인부터 희석 계획과 최종 PCR mix 조립까지 연결',
    tools: ['a260', 'serial-dilution', 'pcr-master-mix'],
  },
  {
    id: 'qpcr-standard-curve-prep',
    slug: 'qpcr-standard-curve-prep',
    titleEn: 'qPCR standard curve preparation',
    titleKo: 'qPCR standard curve 준비',
    shortEn: 'Build a standard series, document copy number assumptions, and protect replicate volume',
    shortKo: '표준 시리즈를 만들고 copy number 가정과 replicate 부피를 관리',
    tools: ['copy-number', 'serial-dilution', 'pcr-master-mix'],
  },
  {
    id: 'ligation-to-transformation',
    slug: 'ligation-to-transformation',
    titleEn: 'Ligation to transformation sequence',
    titleKo: 'Ligation에서 transformation까지',
    shortEn: 'Connect ligation setup to transformation plating and final efficiency review',
    shortKo: 'ligation 세팅부터 plating과 최종 효율 검토까지 연결',
    tools: ['ligation', 'multi-stock-mix', 'transformation-efficiency'],
  },
  {
    id: 'manual-count-to-plating',
    slug: 'manual-count-to-plating',
    titleEn: 'Manual count to plating plan',
    titleKo: '수동 계수에서 plating 계획까지',
    shortEn: 'Use hemocytometer data to prepare a mixed suspension and seed plates consistently',
    shortKo: 'hemocytometer 데이터를 기반으로 suspension을 만들고 plate에 일관되게 시딩',
    tools: ['hemocytometer', 'cell-seeding', 'cell-doubling-time'],
  },
  {
    id: 'rna-to-qpcr',
    slug: 'rna-to-qpcr',
    titleEn: 'RNA handling to qPCR interpretation',
    titleKo: 'RNA 취급에서 qPCR 해석까지',
    shortEn: 'Connect RNA quality, reverse transcription, controls, and final Ct interpretation',
    shortKo: 'RNA 품질, reverse transcription, control, Ct 해석을 연결',
    tools: ['qpcr-relative-quant', 'pcr-master-mix'],
  },
  {
    id: 'gel-check-to-cleanup',
    slug: 'gel-check-to-cleanup',
    titleEn: 'Gel check to cleanup decision',
    titleKo: 'Gel 확인에서 cleanup 결정까지',
    shortEn: 'Use gel behavior to decide whether to proceed, repeat, excise, or clean up',
    shortKo: 'gel 결과로 진행, 반복, excision, cleanup 여부를 판단',
    tools: ['gel-loading', 'a260'],
  },
  {
    id: 'cell-treatment-plate-plan',
    slug: 'cell-treatment-plate-plan',
    titleEn: 'Cell treatment plate planning',
    titleKo: '세포 처리 plate 계획',
    shortEn: 'Plan seeding, treatment timing, controls, viability checks, and plate layout together',
    shortKo: '시딩, 처리 시점, control, 생존율, plate layout을 함께 계획',
    tools: ['cell-seeding', 'hemocytometer', 'cell-doubling-time'],
  },
  {
    id: 'buffer-media-prep',
    slug: 'buffer-media-prep',
    titleEn: 'Buffer and media preparation workflow',
    titleKo: 'Buffer와 배지 제조 워크플로',
    shortEn: 'Plan pH, osmolarity, supplements, labeling, and storage records before use',
    shortKo: 'pH, osmolarity, supplement, 라벨링, 보관 기록을 사용 전 계획',
    tools: ['reconstitution', 'multi-stock-mix'],
  },
  {
    id: 'experiment-review-cycle',
    slug: 'experiment-review-cycle',
    titleEn: 'Experiment review and troubleshooting cycle',
    titleKo: '실험 검토와 문제 해결 사이클',
    shortEn: 'Turn calculations, controls, observations, and deviations into a reusable review loop',
    shortKo: '계산, control, 관찰, 변경점을 재사용 가능한 검토 루프로 정리',
    tools: ['pcr-master-mix', 'serial-dilution', 'cell-seeding'],
  },
];

export function workflowBySlug(slug: string): WorkflowMeta | undefined {
  return workflowMetas.find((w) => w.slug === slug);
}
