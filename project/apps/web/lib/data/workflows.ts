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
    titleKo: 'Cell culture routine',
    shortEn: 'Seeding, counting, and media handling checklist',
    shortKo: 'Seeding, counting, and media handling checklist',
    tools: ['cell-seeding', 'hemocytometer'],
  },
  {
    id: 'pcr-qpcr',
    slug: 'pcr-qpcr',
    titleEn: 'PCR and qPCR setup',
    titleKo: 'PCR and qPCR setup',
    shortEn: 'Master mix balance and control planning',
    shortKo: 'Master mix balance and control planning',
    tools: ['pcr-master-mix', 'copy-number'],
  },
  {
    id: 'cloning',
    slug: 'cloning',
    titleEn: 'Molecular cloning',
    titleKo: 'Molecular cloning',
    shortEn: 'Ligation molar ratio and dilution checks',
    shortKo: 'Ligation molar ratio and dilution checks',
    tools: ['ligation', 'multi-stock-mix'],
  },
  {
    id: 'dna-quant-to-pcr',
    slug: 'dna-quant-to-pcr',
    titleEn: 'DNA quantification to PCR setup',
    titleKo: 'DNA quantification to PCR setup',
    shortEn: 'Move from concentration check to dilution planning and final PCR mix assembly',
    shortKo: 'Move from concentration check to dilution planning and final PCR mix assembly',
    tools: ['a260', 'serial-dilution', 'pcr-master-mix'],
  },
  {
    id: 'qpcr-standard-curve-prep',
    slug: 'qpcr-standard-curve-prep',
    titleEn: 'qPCR standard curve preparation',
    titleKo: 'qPCR standard curve preparation',
    shortEn: 'Build a standard series, document copy number assumptions, and protect replicate volume',
    shortKo: 'Build a standard series, document copy number assumptions, and protect replicate volume',
    tools: ['copy-number', 'serial-dilution', 'pcr-master-mix'],
  },
  {
    id: 'ligation-to-transformation',
    slug: 'ligation-to-transformation',
    titleEn: 'Ligation to transformation sequence',
    titleKo: 'Ligation to transformation sequence',
    shortEn: 'Connect ligation setup to transformation plating and final efficiency review',
    shortKo: 'Connect ligation setup to transformation plating and final efficiency review',
    tools: ['ligation', 'multi-stock-mix', 'transformation-efficiency'],
  },
  {
    id: 'manual-count-to-plating',
    slug: 'manual-count-to-plating',
    titleEn: 'Manual count to plating plan',
    titleKo: 'Manual count to plating plan',
    shortEn: 'Use hemocytometer data to prepare a mixed suspension and seed plates consistently',
    shortKo: 'Use hemocytometer data to prepare a mixed suspension and seed plates consistently',
    tools: ['hemocytometer', 'cell-seeding', 'cell-doubling-time'],
  },
];

export function workflowBySlug(slug: string): WorkflowMeta | undefined {
  return workflowMetas.find((w) => w.slug === slug);
}
