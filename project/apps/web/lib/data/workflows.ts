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
  { id: 'cell-culture', slug: 'cell-culture', titleEn: 'Cell culture routine', titleKo: '세포 배양 루틴', shortEn: 'Seeding, counting, and media handling checklist', shortKo: '시딩, 카운팅, 배지 처리 체크리스트', tools: ['cell-seeding', 'hemocytometer'] },
  { id: 'pcr-qpcr', slug: 'pcr-qpcr', titleEn: 'PCR and qPCR setup', titleKo: 'PCR/qPCR 세팅', shortEn: 'Master mix balance and control planning', shortKo: '마스터믹스 구성과 대조군 계획', tools: ['pcr-master-mix', 'copy-number'] },
  { id: 'cloning', slug: 'cloning', titleEn: 'Molecular cloning', titleKo: '분자 클로닝', shortEn: 'Ligation molar ratio and dilution checks', shortKo: '삽입체와 벡터 몰비, 희석 점검', tools: ['ligation', 'multi-stock-mix'] },
];

export function workflowBySlug(slug: string): WorkflowMeta | undefined {
  return workflowMetas.find((w) => w.slug === slug);
}
