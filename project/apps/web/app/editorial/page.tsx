"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function EditorialPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '콘텐츠 원칙 및 산출 근거' : 'Editorial Policy and Methodology'}>
        <div className="space-y-3 text-sm leading-6 text-slate-700">
          <p>
            {isKo
              ? 'BioLT는 실험 계산을 빠르게 검증하기 위한 도구형 콘텐츠를 제공합니다. 각 도구는 입력값, 계산식, 가정, 경고 조건을 함께 표시합니다.'
              : 'BioLT publishes tool-based content for practical experiment planning. Each tool documents inputs, formulas, assumptions, and warning conditions.'}
          </p>
          <p>
            <strong>{isKo ? '콘텐츠 작성 원칙' : 'Content principles'}:</strong>{' '}
            {isKo
              ? '중복/자동생성 페이지를 만들지 않고, 사용자에게 직접 도움이 되는 계산 근거와 사용 맥락을 제공합니다.'
              : 'No auto-generated thin pages; each page must provide direct utility with computational rationale and practical context.'}
          </p>
          <p>
            <strong>{isKo ? '검증 방식' : 'Validation'}:</strong>{' '}
            {isKo
              ? '일반 분자/세포생물학 표준식 기반으로 구현하며, 실제 적용 전 SOP 재검증을 권장합니다.'
              : 'Calculations are implemented from common molecular/cell biology formulas and should be verified with local SOPs before execution.'}
          </p>
          <p>
            <strong>{isKo ? '정정 정책' : 'Correction policy'}:</strong>{' '}
            {isKo
              ? '오류 제보가 접수되면 우선 수정하고 변경 이력을 반영합니다.'
              : 'Reported inaccuracies are prioritized for correction and reflected in updates.'}
          </p>
          <p>
            <strong>{isKo ? '문의' : 'Contact'}:</strong>{' '}
            <a className="underline" href="mailto:kkgh6721255@naver.com">
              kkgh6721255@naver.com
            </a>
          </p>
        </div>
      </SectionCard>
    </section>
  );
}
