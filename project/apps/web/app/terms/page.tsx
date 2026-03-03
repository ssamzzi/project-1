"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function TermsPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '이용약관' : 'Terms of Use'}>
        <div className="space-y-3 text-sm leading-6 text-slate-700">
          <p>
            {isKo
              ? 'BioLT 계산 결과는 교육/보조 목적이며 의료, 임상, 안전결정의 단독 근거로 사용할 수 없습니다.'
              : 'BioLT outputs are educational support only and must not be used as the sole basis for clinical, medical, or safety-critical decisions.'}
          </p>
          <p>
            {isKo
              ? '사용자는 실험실 SOP, 지도자 검토, 제조사 매뉴얼을 최종 기준으로 사용해야 합니다.'
              : 'Users must validate all final conditions against lab SOPs, supervisor review, and manufacturer documentation.'}
          </p>
          <p>
            {isKo
              ? '자동화 분석/AI 결과는 오차가 있을 수 있으며, 입력 데이터 품질에 따라 결과가 달라질 수 있습니다.'
              : 'AI and automated analyses may be imperfect and are sensitive to input quality.'}
          </p>
          <p>
            {isKo
              ? '사이트 운영자는 서비스 중단/오류로 인한 간접적 손해에 대해 책임을 지지 않습니다.'
              : 'The operator is not liable for indirect damages from service interruption or computational errors.'}
          </p>
          <p className="text-xs text-slate-500">
            {isKo ? '최종 업데이트: 2026-03-03' : 'Last updated: 2026-03-03'}
          </p>
        </div>
      </SectionCard>
    </section>
  );
}
