export interface ToolMeta {
  id: string;
  slug: string;
  nameEn: string;
  nameKo: string;
  shortEn: string;
  shortKo: string;
}

export const toolMetas: ToolMeta[] = [
  { id: 'pcr-master-mix', slug: 'pcr-master-mix', nameEn: 'PCR/qPCR Master Mix', nameKo: 'PCR/qPCR 마스터믹스', shortEn: 'Reaction planning and component balancing', shortKo: '반응 조성과 성분 균형 계산' },
  { id: 'multi-stock-mix', slug: 'multi-stock-mix', nameEn: 'Multi-Stock Mixing', nameKo: '다중 스톡 혼합', shortEn: 'Mixing many components accurately', shortKo: '여러 성분을 정확하게 혼합' },
  { id: 'serial-dilution', slug: 'serial-dilution', nameEn: 'Serial Dilution Planner', nameKo: '연속 희석 플래너', shortEn: 'Step-wise dilution steps', shortKo: '단계별 희석 계획 수립' },
  { id: 'copy-number', slug: 'copy-number', nameEn: 'DNA/RNA Copy Number', nameKo: 'DNA/RNA copy number', shortEn: 'Convert mass to copies and dilution plan', shortKo: '질량을 copy number와 희석 계획으로 변환' },
  { id: 'ligation', slug: 'ligation', nameEn: 'Ligation Setup', nameKo: '라이게이션 세팅', shortEn: 'Insert:vector molar ratio helper', shortKo: 'insert:vector 몰 비율 계산' },
  { id: 'a260', slug: 'a260', nameEn: 'A260 Quantitation', nameKo: 'A260 정량', shortEn: 'UV absorbance conversion', shortKo: 'UV 흡광도 기반 농도 변환' },
  { id: 'cell-seeding', slug: 'cell-seeding', nameEn: 'Cell Seeding', nameKo: '세포 시딩', shortEn: 'Cell/well and cell/cm짼 planning', shortKo: 'well 또는 면적 기준 세포 수 계산' },
  { id: 'hemocytometer', slug: 'hemocytometer', nameEn: 'Hemocytometer', nameKo: '헤모사이토미터', shortEn: 'Counts to viable cells and viability', shortKo: '카운트를 생존 세포 수와 생존율로 변환' },
  { id: 'rcf-rpm', slug: 'rcf-rpm', nameEn: 'RCF / RPM Calculator', nameKo: 'RCF / RPM 계산기', shortEn: 'Convert centrifuge force and speed', shortKo: '원심력과 RPM 변환' },
  { id: 'reconstitution', slug: 'reconstitution', nameEn: 'Reconstitution Helper', nameKo: '재구성 도우미', shortEn: 'Dissolve mass to target concentration', shortKo: '질량 기준 시약을 목표 농도로 맞추기' },
  { id: 'gel-loading', slug: 'gel-loading', nameEn: 'Gel Loading Calculator', nameKo: '젤 로딩 계산기', shortEn: 'Volume needed for target DNA mass', shortKo: '목표 DNA 질량에 맞는 로딩 부피 계산' },
  { id: 'qpcr-relative-quant', slug: 'qpcr-relative-quant', nameEn: 'qPCR Relative Quantification (ddCt)', nameKo: 'qPCR 상대 정량 (ddCt)', shortEn: 'Compute ddCt and fold change', shortKo: 'ddCt와 발현 변화량 계산' },
  { id: 'cell-doubling-time', slug: 'cell-doubling-time', nameEn: 'Cell Doubling Time', nameKo: '세포 doubling time', shortEn: 'Growth rate and doubling time from counts', shortKo: '세포 수로 성장률과 doubling time 계산' },
  { id: 'transformation-efficiency', slug: 'transformation-efficiency', nameEn: 'Bacterial Transformation Efficiency', nameKo: '박테리아 형질전환 효율', shortEn: 'Calculate CFU/ug and log efficiency', shortKo: 'CFU/ug와 로그 효율 계산' },
];

export const relatedToolMap: Record<string, string[]> = {
  'pcr-master-mix': ['cell-seeding', 'multi-stock-mix', 'serial-dilution'],
  'multi-stock-mix': ['pcr-master-mix', 'cell-seeding'],
  'serial-dilution': ['cell-seeding', 'a260', 'copy-number'],
  'copy-number': ['a260', 'ligation', 'pcr-master-mix'],
  'ligation': ['pcr-master-mix', 'multi-stock-mix', 'copy-number'],
  'a260': ['copy-number', 'cell-seeding'],
  'cell-seeding': ['serial-dilution', 'hemocytometer', 'cell-doubling-time'],
  'hemocytometer': ['cell-seeding', 'serial-dilution', 'cell-doubling-time'],
  'rcf-rpm': ['cell-seeding', 'a260'],
  'reconstitution': ['multi-stock-mix', 'copy-number'],
  'gel-loading': ['copy-number', 'cell-seeding'],
  'qpcr-relative-quant': ['a260', 'copy-number', 'pcr-master-mix'],
  'cell-doubling-time': ['cell-seeding', 'hemocytometer'],
  'transformation-efficiency': ['ligation', 'cell-seeding'],
};

export function labelFor(locale: 'en' | 'ko', tool: ToolMeta) {
  return locale === 'ko' ? tool.nameKo : tool.nameEn;
}
