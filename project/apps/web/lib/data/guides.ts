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
    titleKo: 'Primer Tm 정리',
    shortEn: 'How to evaluate and compare Tm estimates',
    shortKo: 'Tm 추정값을 비교하고 해석하는 방법',
  },
  {
    id: 'statistical-test-chooser',
    slug: 'statistical-test-chooser',
    titleEn: 'Statistical Test Chooser',
    titleKo: '통계 검정 선택 가이드',
    shortEn: 'Simple decision tree and links',
    shortKo: '간단한 의사결정 트리와 참고 링크',
  },
  {
    id: 'buffer-ph-pka',
    slug: 'buffer-ph-pka',
    titleEn: 'Buffer pH / pKa',
    titleKo: 'Buffer pH / pKa',
    shortEn: 'Why buffer compatibility matters',
    shortKo: 'buffer 적합성이 중요한 이유',
  },
  {
    id: 'osmolarity',
    slug: 'osmolarity',
    titleEn: 'Osmolarity Curation',
    titleKo: 'Osmolarity 정리',
    shortEn: 'Practical checklist for media prep',
    shortKo: '배지 준비를 위한 실전 체크리스트',
  },
  {
    id: 'a260-purity-ratios',
    slug: 'a260-purity-ratios',
    titleEn: 'A260 Purity Ratios in Practice',
    titleKo: 'A260 순도 비율 실전 해석',
    shortEn: 'How to read A260/280 and A260/230 before using a sample',
    shortKo: '샘플 사용 전 A260/280과 A260/230을 읽는 방법',
  },
  {
    id: 'ligation-molar-ratio-planning',
    slug: 'ligation-molar-ratio-planning',
    titleEn: 'Ligation Molar Ratio Planning',
    titleKo: 'Ligation 몰 비율 계획',
    shortEn: 'Choose insert and vector amounts without falling back to mass ratio shortcuts',
    shortKo: '질량 비율에만 의존하지 않고 insert와 vector 양을 정하는 방법',
  },
  {
    id: 'qpcr-ddct-interpretation',
    slug: 'qpcr-ddct-interpretation',
    titleEn: 'qPCR ddCt Interpretation',
    titleKo: 'qPCR ddCt 해석',
    shortEn: 'Know when fold change is meaningful and when the upstream data are too weak',
    shortKo: 'fold change가 의미 있는 경우와 원데이터가 약한 경우를 구분하는 법',
  },
  {
    id: 'cell-seeding-density-planning',
    slug: 'cell-seeding-density-planning',
    titleEn: 'Cell Seeding Density Planning',
    titleKo: '세포 시딩 밀도 계획',
    shortEn: 'Translate target confluence and assay timing into a practical seeding plan',
    shortKo: '목표 confluence와 assay 시점을 실제 시딩 계획으로 바꾸는 방법',
  },
  {
    id: 'hemocytometer-counting-quality',
    slug: 'hemocytometer-counting-quality',
    titleEn: 'Hemocytometer Counting Quality Checks',
    titleKo: '헤모사이토미터 계수 품질 점검',
    shortEn: 'Reduce counting noise, clump bias, and dilution mistakes in manual counts',
    shortKo: '수동 계수에서 노이즈, clump 편향, 희석 실수를 줄이는 방법',
  },
  {
    id: 'centrifuge-rcf-vs-rpm',
    slug: 'centrifuge-rcf-vs-rpm',
    titleEn: 'RCF vs RPM for Centrifuge Protocols',
    titleKo: '원심분리 프로토콜의 RCF vs RPM',
    shortEn: 'Match published spin conditions to your own rotor instead of copying RPM blindly',
    shortKo: 'RPM만 복사하지 않고 내 로터에 맞춰 조건을 맞추는 방법',
  },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return guideMetas.find((g) => g.slug === slug);
}
