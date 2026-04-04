"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function TermsPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '이용약관' : 'Terms of Use'}>
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>
            {isKo
              ? 'BioLT의 계산 결과와 설명은 교육 및 실험 준비 보조 목적입니다. 의료, 임상, 안전 결정의 유일한 근거로 사용해서는 안 됩니다.'
              : 'BioLT calculations and explanations are for educational support and experiment preparation. They must not be used as the sole basis for medical, clinical, or safety-critical decisions.'}
          </p>
          <p>
            {isKo
              ? '사용자는 최종 판단 전에 실험실 SOP, 제조사 문서, 장비 요구사항, 지도자 검토를 반드시 확인해야 합니다.'
              : 'Users are responsible for confirming final conditions against local SOPs, manufacturer documentation, instrument requirements, and supervisor review.'}
          </p>
          <p>
            {isKo
              ? '자동 계산 및 AI 기반 분석은 입력 정확도와 가정에 따라 달라질 수 있으며, 운영자는 간접 손해에 대한 책임을 지지 않습니다.'
              : 'Automated calculations and AI-assisted analysis depend on input quality and assumptions, and the operator is not liable for indirect damages resulting from their use.'}
          </p>
          <p className="text-xs text-slate-500">{isKo ? '최종 업데이트: 2026-04-04' : 'Last updated: 2026-04-04'}</p>
        </div>
      </SectionCard>
    </section>
  );
}
