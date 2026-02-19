export interface ToolMeta {
  id: string;
  slug: string;
  nameEn: string;
  nameKo: string;
  shortEn: string;
  shortKo: string;
}

export const toolMetas: ToolMeta[] = [
  {
    id: 'pcr-master-mix',
    slug: 'pcr-master-mix',
    nameEn: 'PCR/qPCR Master Mix',
    nameKo: 'PCR/qPCR Master Mix',
    shortEn: 'Reaction planning and component balancing',
    shortKo: '반응 조성 계산 및 보정',
  },
  {
    id: 'multi-stock-mix',
    slug: 'multi-stock-mix',
    nameEn: 'Multi-Stock Mixing',
    nameKo: '멀티 스톡 혼합',
    shortEn: 'Mixing many components accurately',
    shortKo: '여러 시약을 동시에 혼합',
  },
  {
    id: 'serial-dilution',
    slug: 'serial-dilution',
    nameEn: 'Serial Dilution Planner',
    nameKo: '연속 희석 플래너',
    shortEn: 'Step-wise dilution steps',
    shortKo: '단계별 연속 희석',
  },
  {
    id: 'copy-number',
    slug: 'copy-number',
    nameEn: 'DNA/RNA Copy Number',
    nameKo: 'DNA/RNA 복사 수',
    shortEn: 'Convert mass to copies and dilution plan',
    shortKo: '질량을 복사 수로 변환',
  },
  {
    id: 'ligation',
    slug: 'ligation',
    nameEn: 'Ligation Setup',
    nameKo: '리가제이션 조성',
    shortEn: 'Insert:vector molar ratio helper',
    shortKo: 'Insert:vector 몰비 계산',
  },
  {
    id: 'a260',
    slug: 'a260',
    nameEn: 'A260 Quantitation',
    nameKo: 'A260 농도 계산',
    shortEn: 'UV absorbance conversion',
    shortKo: 'UV 흡광도 농도 변환',
  },
  {
    id: 'cell-seeding',
    slug: 'cell-seeding',
    nameEn: 'Cell Seeding',
    nameKo: '세포 시딩',
    shortEn: 'Cell/well and cell/cm² planning',
    shortKo: '세포 밀도 기준 부피 계산',
  },
  {
    id: 'hemocytometer',
    slug: 'hemocytometer',
    nameEn: 'Hemocytometer',
    nameKo: '헴사이트토미터',
    shortEn: 'Counts to viable cells and viability',
    shortKo: '세포 수와 생존율 계산',
  },
  {
    id: 'rcf-rpm',
    slug: 'rcf-rpm',
    nameEn: 'RCF / RPM Calculator',
    nameKo: 'RCF ↔ RPM 계산기',
    shortEn: 'Convert centrifuge force and speed',
    shortKo: '원심력과 회전수 변환',
  },
  {
    id: 'reconstitution',
    slug: 'reconstitution',
    nameEn: 'Reconstitution Helper',
    nameKo: '리컨스티튜션 도우미',
    shortEn: 'Dissolve mass to target concentration',
    shortKo: '질량 기반 농도 맞춤 희석',
  },
  {
    id: 'gel-loading',
    slug: 'gel-loading',
    nameEn: 'Gel Loading Calculator',
    nameKo: '겔 로딩 계산기',
    shortEn: 'Volume needed for target DNA mass',
    shortKo: '겔에 적재할 부피 계산',
  },
];

export const relatedToolMap: Record<string, string[]> = {
  'pcr-master-mix': ['cell-seeding', 'multi-stock-mix', 'serial-dilution'],
  'multi-stock-mix': ['pcr-master-mix', 'cell-seeding'],
  'serial-dilution': ['cell-seeding', 'a260', 'copy-number'],
  'copy-number': ['a260', 'ligation', 'pcr-master-mix'],
  'ligation': ['pcr-master-mix', 'multi-stock-mix', 'copy-number'],
  'a260': ['copy-number', 'cell-seeding'],
  'cell-seeding': ['serial-dilution', 'hemocytometer'],
  'hemocytometer': ['cell-seeding', 'serial-dilution'],
  'rcf-rpm': ['cell-seeding', 'a260'],
  'reconstitution': ['multi-stock-mix', 'copy-number'],
  'gel-loading': ['copy-number', 'cell-seeding'],
};

export function labelFor(locale: 'en' | 'ko', tool: ToolMeta) {
  return locale === 'ko' ? tool.nameKo : tool.nameEn;
}
