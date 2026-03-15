"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function EditorialPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '편집 정책 및 방법론' : 'Editorial Policy and Methodology'}>
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>
            {isKo
              ? 'BioLT는 단순 자동 생성 페이지를 늘리는 대신, 실제 실험 준비에 도움이 되는 계산 근거와 사용 맥락을 함께 설명하는 것을 목표로 합니다.'
              : 'BioLT aims to publish pages with practical value, not auto-generated thin pages. Each page should explain why a calculation matters and how it should be used.'}
          </p>
          <p>
            <strong>{isKo ? '콘텐츠 원칙' : 'Content principles'}:</strong>{' '}
            {isKo
              ? '계산식, 입력값, 가정, 경고 조건, 실수하기 쉬운 포인트, 관련 워크플로를 가능한 한 함께 제시합니다.'
              : 'Where possible, pages document formulas, inputs, assumptions, warning conditions, common mistakes, and related workflows.'}
          </p>
          <p>
            <strong>{isKo ? '검토 방식' : 'Review process'}:</strong>{' '}
            {isKo
              ? '콘텐츠는 일반적인 분자생물학 및 세포생물학 실험 관행을 바탕으로 작성되며, 실제 적용 전에는 현장 SOP 검증이 권장됩니다.'
              : 'Content is written from common molecular and cell biology practices, but real-world application should always be checked against local SOPs.'}
          </p>
          <p>
            <strong>{isKo ? '수정 정책' : 'Correction policy'}:</strong>{' '}
            {isKo
              ? '오류 제보나 업데이트 필요 사항이 있으면 우선 검토 후 반영합니다.'
              : 'Reported errors or unclear explanations are reviewed and corrected when needed.'}
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
