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
    shortKo: 'Tm 산정 방식 비교와 해석',
  },
  {
    id: 'statistical-test-chooser',
    slug: 'statistical-test-chooser',
    titleEn: 'Statistical Test Chooser',
    titleKo: '통계검정 선택 가이드',
    shortEn: 'Simple decision tree and links',
    shortKo: '실험결과에 맞는 통계검정 선택',
  },
  {
    id: 'buffer-ph-pka',
    slug: 'buffer-ph-pka',
    titleEn: 'Buffer pH / pKa',
    titleKo: '완충액 pH와 pKa',
    shortEn: 'Why buffer compatibility matters',
    shortKo: '버퍼 선택에서 pH/pKa의 의미',
  },
  {
    id: 'osmolarity',
    slug: 'osmolarity',
    titleEn: 'Osmolarity Curation',
    titleKo: '삼투압 조정',
    shortEn: 'Practical checklist for media prep',
    shortKo: '배지 준비 체크리스트',
  },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return guideMetas.find((g) => g.slug === slug);
}
