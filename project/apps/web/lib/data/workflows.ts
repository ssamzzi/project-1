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
];

export function workflowBySlug(slug: string): WorkflowMeta | undefined {
  return workflowMetas.find((w) => w.slug === slug);
}
