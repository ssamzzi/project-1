import type { ValidationMessage } from '../lib/types';

interface ValidationDetail {
  riskEn: string;
  riskKo: string;
  fixEn: string;
  fixKo: string;
}

const DETAIL_BY_CODE: Record<string, ValidationDetail> = {
  'water-negative': {
    riskEn: 'Total reagent volume exceeds the reaction volume. Concentrations become invalid and amplification can fail.',
    riskKo: '총 reagent volume이 reaction volume을 초과해 농도 계산이 무효가 되고 amplification 실패가 발생할 수 있습니다.',
    fixEn: 'Reduce component volumes or increase reaction volume before running.',
    fixKo: 'run 전에 component volume을 줄이거나 reaction volume을 늘리세요.',
  },
  'primer-high': {
    riskEn: 'High primer concentration increases non-specific bands and primer-dimer.',
    riskKo: 'primer 농도 과다는 non-specific band와 primer-dimer를 증가시킵니다.',
    fixEn: 'Lower primer concentration and re-optimize annealing temperature.',
    fixKo: 'primer 농도를 낮추고 annealing temperature를 재최적화하세요.',
  },
  'volume-over': {
    riskEn: 'Component sum exceeds final volume, so target concentrations are not achievable.',
    riskKo: 'component 합이 final volume을 초과해 target concentration을 달성할 수 없습니다.',
    fixEn: 'Lower target concentration or increase final volume.',
    fixKo: 'target concentration을 낮추거나 final volume을 늘리세요.',
  },
  'well-over': {
    riskEn: 'Loading volume exceeds well capacity and can spill into adjacent lanes.',
    riskKo: 'loading volume이 well capacity를 넘어 adjacent lane 오염이 생길 수 있습니다.',
    fixEn: 'Lower loading volume or use larger well comb.',
    fixKo: 'loading volume을 줄이거나 larger well comb를 사용하세요.',
  },
  'acid-over': {
    riskEn: 'Required acid volume is greater than final volume, which is physically impossible.',
    riskKo: 'required acid volume이 final volume보다 커 물리적으로 불가능한 조건입니다.',
    fixEn: 'Lower target molarity or increase final volume.',
    fixKo: 'target molarity를 낮추거나 final volume을 늘리세요.',
  },
  'well-capacity': {
    riskEn: 'Requested seeding volume exceeds well capacity and may overflow.',
    riskKo: '요청된 seeding volume이 well capacity를 초과해 overflow가 생길 수 있습니다.',
    fixEn: 'Reduce per-well volume or use a larger plate format.',
    fixKo: 'well당 volume을 줄이거나 larger plate format을 사용하세요.',
  },
  'ct-high': {
    riskEn: 'Ct too high may be near detection limit, so fold-change becomes unstable.',
    riskKo: 'Ct가 너무 높으면 detection limit 근처일 수 있어 fold-change 해석이 불안정합니다.',
    fixEn: 'Increase template quality/amount and confirm with technical replicates.',
    fixKo: 'template quality/amount를 개선하고 technical replicate로 재확인하세요.',
  },
};

function detailFor(message: ValidationMessage): ValidationDetail | null {
  if (DETAIL_BY_CODE[message.code]) return DETAIL_BY_CODE[message.code];
  if (message.code.includes('invalid') || message.severity === 'critical') {
    return {
      riskEn: 'Core input is invalid, so the calculation output is unreliable.',
      riskKo: '핵심 입력값이 유효하지 않아 계산 결과를 신뢰할 수 없습니다.',
      fixEn: 'Correct the invalid input first, then re-check the result.',
      fixKo: '유효하지 않은 입력값을 먼저 수정한 뒤 결과를 다시 확인하세요.',
    };
  }
  if (message.severity === 'warn') {
    return {
      riskEn: 'Current settings may still run, but result quality or reproducibility can decrease.',
      riskKo: '현재 설정으로 실행은 가능하지만 결과 품질/재현성이 저하될 수 있습니다.',
      fixEn: 'Adjust values toward recommended range before experiment.',
      fixKo: '실험 전에 값을 권장 범위로 조정하세요.',
    };
  }
  return null;
}

export function ValidationBanner({
  messages,
  locale = 'en',
}: {
  messages: ValidationMessage[];
  locale?: 'en' | 'ko';
}) {
  if (!messages.length) return null;
  const critical = messages.filter((m) => m.severity === 'critical');
  const warn = messages.filter((m) => m.severity === 'warn');
  const info = messages.filter((m) => m.severity === 'info');

  const labels =
    locale === 'ko'
      ? { blocking: '중요 경고', warning: '주의', note: '참고', risk: '예상되는 문제', fix: '권장 수정' }
      : { blocking: 'Blocking issues', warning: 'Warnings', note: 'Notes', risk: 'Risk', fix: 'Recommended fix' };

  const renderItem = (m: ValidationMessage) => {
    const detail = detailFor(m);
    return (
      <li key={m.code} className="space-y-1">
        <p>{m.message}</p>
        {detail ? (
          <>
            <p className="text-xs">
              {labels.risk}: {locale === 'ko' ? detail.riskKo : detail.riskEn}
            </p>
            <p className="text-xs">
              {labels.fix}: {locale === 'ko' ? detail.fixKo : detail.fixEn}
            </p>
          </>
        ) : null}
      </li>
    );
  };

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      {critical.length > 0 ? (
        <section className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-900">
          <p className="text-sm font-medium">{labels.blocking}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {critical.map((m) => renderItem(m))}
          </ul>
        </section>
      ) : null}
      {warn.length > 0 ? (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <p className="text-sm font-medium">{labels.warning}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {warn.map((m) => renderItem(m))}
          </ul>
        </section>
      ) : null}
      {info.length > 0 ? (
        <section className="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sky-900">
          <p className="text-sm font-medium">{labels.note}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {info.map((m) => renderItem(m))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
