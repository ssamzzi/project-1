export interface GuideMeta {
  id: string;
  slug: string;
  titleEn: string;
  titleKo: string;
  shortEn: string;
  shortKo: string;
}

export const guideMetas: GuideMeta[] = [
  { id: 'primer-tm', slug: 'primer-tm', titleEn: 'Primer Tm Curation', titleKo: 'Primer Tm 정리', shortEn: 'How to evaluate and compare Tm estimates', shortKo: 'Tm 추정 방식을 비교하고 해석하는 방법' },
  { id: 'statistical-test-chooser', slug: 'statistical-test-chooser', titleEn: 'Statistical Test Chooser', titleKo: '통계 검정 선택 가이드', shortEn: 'Simple decision tree and links', shortKo: '실험 결과에 맞는 통계 검정 선택' },
  { id: 'buffer-ph-pka', slug: 'buffer-ph-pka', titleEn: 'Buffer pH / pKa', titleKo: '버퍼 pH / pKa', shortEn: 'Why buffer compatibility matters', shortKo: '버퍼 선택에서 pH/pKa가 중요한 이유' },
  { id: 'osmolarity', slug: 'osmolarity', titleEn: 'Osmolarity Curation', titleKo: '삼투압 정리', shortEn: 'Practical checklist for media prep', shortKo: '배지 준비 실무 체크리스트' },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return guideMetas.find((g) => g.slug === slug);
}
