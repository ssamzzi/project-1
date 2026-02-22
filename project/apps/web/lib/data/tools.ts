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
    nameKo: 'Multi-Stock Mixing',
    shortEn: 'Mixing many components accurately',
    shortKo: '여러 시약을 동시에 혼합',
  },
  {
    id: 'serial-dilution',
    slug: 'serial-dilution',
    nameEn: 'Serial Dilution Planner',
    nameKo: 'Serial Dilution Planner',
    shortEn: 'Step-wise dilution steps',
    shortKo: '단계별 연속 dilution',
  },
  {
    id: 'copy-number',
    slug: 'copy-number',
    nameEn: 'DNA/RNA Copy Number',
    nameKo: 'DNA/RNA Copy Number',
    shortEn: 'Convert mass to copies and dilution plan',
    shortKo: '질량을 Copy Number로 변환',
  },
  {
    id: 'ligation',
    slug: 'ligation',
    nameEn: 'Ligation Setup',
    nameKo: 'Ligation Setup',
    shortEn: 'Insert:vector molar ratio helper',
    shortKo: 'Insert:vector molar ratio 계산',
  },
  {
    id: 'a260',
    slug: 'a260',
    nameEn: 'A260 Quantitation',
    nameKo: 'A260 Quantitation',
    shortEn: 'UV absorbance conversion',
    shortKo: 'UV absorbance 농도 변환',
  },
  {
    id: 'cell-seeding',
    slug: 'cell-seeding',
    nameEn: 'Cell Seeding',
    nameKo: 'Cell Seeding',
    shortEn: 'Cell/well and cell/cm² planning',
    shortKo: '세포 밀도 기준 부피 계산',
  },
  {
    id: 'hemocytometer',
    slug: 'hemocytometer',
    nameEn: 'Hemocytometer',
    nameKo: 'Hemocytometer',
    shortEn: 'Counts to viable cells and viability',
    shortKo: '세포 수와 viability 계산',
  },
  {
    id: 'rcf-rpm',
    slug: 'rcf-rpm',
    nameEn: 'RCF / RPM Calculator',
    nameKo: 'RCF ↔ RPM 계산기',
    shortEn: 'Convert centrifuge force and speed',
    shortKo: 'centrifugal force와 RPM 변환',
  },
  {
    id: 'reconstitution',
    slug: 'reconstitution',
    nameEn: 'Reconstitution Helper',
    nameKo: 'Reconstitution Helper',
    shortEn: 'Dissolve mass to target concentration',
    shortKo: '질량 기반 농도 맞춤 dilution',
  },
  {
    id: 'gel-loading',
    slug: 'gel-loading',
    nameEn: 'Gel Loading Calculator',
    nameKo: 'Gel Loading Calculator',
    shortEn: 'Volume needed for target DNA mass',
    shortKo: '겔에 적재할 부피 계산',
  },
  {
    id: 'qpcr-relative-quant',
    slug: 'qpcr-relative-quant',
    nameEn: 'qPCR Relative Quantification (ddCt)',
    nameKo: 'qPCR 상대 정량 (ddCt)',
    shortEn: 'Compute ddCt and fold change',
    shortKo: 'ddCt 및 발현 변화량 계산',
  },
  {
    id: 'cell-doubling-time',
    slug: 'cell-doubling-time',
    nameEn: 'Cell Doubling Time',
    nameKo: 'Cell Doubling Time',
    shortEn: 'Growth rate and doubling time from counts',
    shortKo: '세포 수로 성장률/배가 시간 계산',
  },
  {
    id: 'cloning-helper',
    slug: 'cloning-helper',
    nameEn: 'Protein <-> DNA Length Converter',
    nameKo: '단백질 <-> DNA 길이 변환',
    shortEn: 'Convert bp and kDa estimates',
    shortKo: 'bp와 kDa 상호 환산',
  },
  {
    id: 'acid-dilution',
    slug: 'acid-dilution',
    nameEn: 'Acid/Base Molarity from % Solution',
    nameKo: '% Solution Molarity Converter',
    shortEn: 'Convert % solution to molarity and dilution volume',
    shortKo: '%와 density 기반 molarity 및 dilution volume 계산',
  },
  {
    id: 'transformation-efficiency',
    slug: 'transformation-efficiency',
    nameEn: 'Bacterial Transformation Efficiency',
    nameKo: 'Transformation Efficiency',
    shortEn: 'Calculate CFU/ug and log efficiency',
    shortKo: 'CFU/ug 및 로그 효율 계산',
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
  'qpcr-relative-quant': ['a260', 'copy-number'],
  'cell-doubling-time': ['cell-seeding', 'hemocytometer'],
  'cloning-helper': ['ligation', 'copy-number'],
  'acid-dilution': ['reconstitution', 'multi-stock-mix'],
  'transformation-efficiency': ['cell-seeding', 'hemocytometer'],
};

export function labelFor(locale: 'en' | 'ko', tool: ToolMeta) {
  return locale === 'ko' ? tool.nameKo : tool.nameEn;
}
