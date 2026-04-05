export interface GuideMeta {
  id: string;
  slug: string;
  titleEn: string;
  titleKo: string;
  shortEn: string;
  shortKo: string;
}

export const guideMetas: GuideMeta[] = [
  {
    id: 'primer-tm',
    slug: 'primer-tm',
    titleEn: 'Primer Tm Curation',
    titleKo: 'Primer Tm Curation',
    shortEn: 'How to evaluate and compare Tm estimates',
    shortKo: 'How to evaluate and compare Tm estimates',
  },
  {
    id: 'statistical-test-chooser',
    slug: 'statistical-test-chooser',
    titleEn: 'Statistical Test Chooser',
    titleKo: 'Statistical Test Chooser',
    shortEn: 'Simple decision tree and links',
    shortKo: 'Simple decision tree and links',
  },
  {
    id: 'buffer-ph-pka',
    slug: 'buffer-ph-pka',
    titleEn: 'Buffer pH / pKa',
    titleKo: 'Buffer pH / pKa',
    shortEn: 'Why buffer compatibility matters',
    shortKo: 'Why buffer compatibility matters',
  },
  {
    id: 'osmolarity',
    slug: 'osmolarity',
    titleEn: 'Osmolarity Curation',
    titleKo: 'Osmolarity Curation',
    shortEn: 'Practical checklist for media prep',
    shortKo: 'Practical checklist for media prep',
  },
  {
    id: 'a260-purity-ratios',
    slug: 'a260-purity-ratios',
    titleEn: 'A260 Purity Ratios in Practice',
    titleKo: 'A260 Purity Ratios in Practice',
    shortEn: 'How to read A260/280 and A260/230 before using a sample',
    shortKo: 'How to read A260/280 and A260/230 before using a sample',
  },
  {
    id: 'ligation-molar-ratio-planning',
    slug: 'ligation-molar-ratio-planning',
    titleEn: 'Ligation Molar Ratio Planning',
    titleKo: 'Ligation Molar Ratio Planning',
    shortEn: 'Choose insert and vector amounts without falling back to mass ratio shortcuts',
    shortKo: 'Choose insert and vector amounts without falling back to mass ratio shortcuts',
  },
  {
    id: 'qpcr-ddct-interpretation',
    slug: 'qpcr-ddct-interpretation',
    titleEn: 'qPCR ddCt Interpretation',
    titleKo: 'qPCR ddCt Interpretation',
    shortEn: 'Know when fold change is meaningful and when the upstream data are too weak',
    shortKo: 'Know when fold change is meaningful and when the upstream data are too weak',
  },
  {
    id: 'cell-seeding-density-planning',
    slug: 'cell-seeding-density-planning',
    titleEn: 'Cell Seeding Density Planning',
    titleKo: 'Cell Seeding Density Planning',
    shortEn: 'Translate target confluence and assay timing into a practical seeding plan',
    shortKo: 'Translate target confluence and assay timing into a practical seeding plan',
  },
  {
    id: 'hemocytometer-counting-quality',
    slug: 'hemocytometer-counting-quality',
    titleEn: 'Hemocytometer Counting Quality Checks',
    titleKo: 'Hemocytometer Counting Quality Checks',
    shortEn: 'Reduce counting noise, clump bias, and dilution mistakes in manual counts',
    shortKo: 'Reduce counting noise, clump bias, and dilution mistakes in manual counts',
  },
  {
    id: 'centrifuge-rcf-vs-rpm',
    slug: 'centrifuge-rcf-vs-rpm',
    titleEn: 'RCF vs RPM for Centrifuge Protocols',
    titleKo: 'RCF vs RPM for Centrifuge Protocols',
    shortEn: 'Match published spin conditions to your own rotor instead of copying RPM blindly',
    shortKo: 'Match published spin conditions to your own rotor instead of copying RPM blindly',
  },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return guideMetas.find((g) => g.slug === slug);
}
