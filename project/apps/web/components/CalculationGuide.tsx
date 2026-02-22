'use client';

import type { Locale } from '../lib/types';

const GUIDE: Record<string, { en: string; ko: string }> = {
  'pcr-master-mix': {
    en: 'PCR master mix: Use positive controls and NTC in the same batch. Keep ice-time short and protect enzymes from repeated freeze-thaw.',
    ko: 'PCR Master mix: 양성대조군/음성대조군을 같은 배치에 넣고, 효소의 동결해동 횟수를 최소화하세요.',
  },
  'multi-stock-mix': {
    en: 'Mix compounds with smallest volume first into intermediate stock when possible, then scale.',
    ko: '소량 성분은 중간 희석액을 만들고 병합해 최종 볼륨을 맞추는 방식이 정확도 향상에 유리합니다.',
  },
  'serial-dilution': {
    en: 'After each transfer, mix by repetitive pipetting and note actual transfer volumes used.',
    ko: '각 단계마다 전달 후 충분히 혼합하고 실제 전달 부피를 기록해 오차 추적에 사용하세요.',
  },
  'copy-number': {
    en: 'Copy-number calculations are concentration estimates; avoid using only one decimal place for downstream dilution planning.',
    ko: '복사수 계산은 추정치입니다. 최종 희석 단계에서는 유효숫자와 작업 오차를 함께 기록하세요.',
  },
  'ligation': {
    en: 'Ratios are a starting point; adjust empirically depending on insert size and insert quality.',
    ko: 'Insert:vector 몰비는 출발점입니다. insert 질량/삽입 품질에 따라 비율을 조정하세요.',
  },
  a260: {
    en: 'Spectrophotometry estimates may overstate due to contaminants such as salts and proteins.',
    ko: 'A260은 오염물 영향으로 편차가 큽니다. 필요 시 형광기반 정량을 병행하세요.',
  },
  'cell-seeding': {
    en: 'If uniformity is critical, pre-dilute and verify per-well volumes by test run.',
    ko: '균일한 분포가 중요하면 시험 배치로 실제 분주량 분산도를 먼저 확인하세요.',
  },
  hemocytometer: {
    en: 'Count at least 4–8 squares for stable variance and always treat clumps as a warning condition.',
    ko: '분산 안정화를 위해 최소 4~8개 square를 카운트하고, clump는 즉시 기록하세요.',
  },
  'qpcr-relative-quant': {
    en: 'Use a stable reference gene and compare technical replicates before interpreting fold-change.',
    ko: '안정적인 reference gene을 사용하고 기술 반복 간 편차를 먼저 확인한 뒤 해석하세요.',
  },
  'cell-doubling-time': {
    en: 'Select only the log-phase interval; confluent culture windows can distort doubling-time estimates.',
    ko: '로그 성장 구간만 선택하세요. confluent 구간을 포함하면 배가시간이 왜곡됩니다.',
  },
  'cloning-helper': {
    en: 'Length-to-mass conversion is approximate; tags, linkers, and PTMs shift observed protein size.',
    ko: '길이-분자량 변환은 근사치입니다. tag/linker/PTM에 따라 실제 밴드 크기가 달라집니다.',
  },
  'acid-dilution': {
    en: 'Always add acid to water slowly with cooling and proper PPE; never reverse the order.',
    ko: '반드시 산을 물에 천천히 넣고 보호장비를 착용하세요. 역순 혼합은 위험합니다.',
  },
  'transformation-efficiency': {
    en: 'Use plated fraction and dilution factor consistently; mismatch here is the most common source of error.',
    ko: '도말 분율과 희석배수를 일관되게 적용하세요. 이 부분의 불일치가 가장 흔한 오류입니다.',
  },
};

export function CalculationGuide({ id, locale }: { id: string; locale: Locale }) {
  const label = locale === 'ko' ? '실무 노트' : 'Quick note';
  const guide = GUIDE[id];
  if (!guide) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 text-slate-700">{locale === 'ko' ? guide.ko : guide.en}</p>
    </section>
  );
}
