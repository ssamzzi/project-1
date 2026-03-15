"use client";

import Link from 'next/link';
import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function AboutPage() {
  const { t, locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title="About BioLT">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>
            {isKo
              ? 'BioLT는 분자생물학과 세포생물학 실험에서 자주 필요한 계산, 해설, 워크플로 정리를 제공하는 실험 보조 사이트입니다.'
              : 'BioLT is a lab support site that publishes calculators, explanatory guides, and workflow references for molecular and cell biology work.'}
          </p>
          <p>
            {isKo
              ? '사이트의 목적은 실험 전에 필요한 값을 빠르게 검토하고, 계산식의 가정과 주의점을 함께 보여 주는 것입니다.'
              : 'The goal is to help users review setup values quickly while also documenting assumptions, common mistakes, and practical caveats.'}
          </p>
          <p>
            {isKo
              ? '계산 결과는 교육 및 준비 보조용이며, 최종 실험 조건은 반드시 실험실 SOP, 키트 매뉴얼, 장비 제약, 지도자 검토로 확정해야 합니다.'
              : 'Outputs are intended for educational support and experiment preparation. Final conditions must be confirmed with local SOPs, kit manuals, instrument limits, and supervisor review.'}
          </p>
          <div>
            <p className="font-semibold text-slate-900">{isKo ? '운영 및 문의' : 'Operator and contact'}</p>
            <p>
              {isKo ? '문의 이메일' : 'Contact email'}:{' '}
              <a href={t('about.placeholder')} className="underline">
                kkgh6721255@naver.com
              </a>
            </p>
            <p>
              Instagram:{' '}
              <a href={t('about.instagramUrl')} target="_blank" rel="noreferrer" className="underline">
                {t('about.instagramLabel')}
              </a>
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{isKo ? '정책 문서' : 'Policy pages'}</p>
            <p>
              <Link href="/privacy" className="underline">
                {isKo ? '개인정보처리방침' : 'Privacy Policy'}
              </Link>{' '}
              /{' '}
              <Link href="/terms" className="underline">
                {isKo ? '이용약관' : 'Terms'}
              </Link>{' '}
              /{' '}
              <Link href="/editorial" className="underline">
                {isKo ? '편집 정책' : 'Editorial Policy'}
              </Link>
            </p>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
