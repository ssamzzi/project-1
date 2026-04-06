"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '개인정보처리방침' : 'Privacy Policy'}>
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>
            {isKo
              ? 'BioLT는 회원 가입 없이 사용할 수 있지만 서비스 운영, 트래픽 분석, 광고 운영을 위해 일부 브라우저 데이터가 처리될 수 있습니다.'
              : 'BioLT can be used without account registration, but some browser data may be processed for service operations, analytics, and advertising.'}
          </p>
          <p>
            <strong>{isKo ? '처리될 수 있는 데이터' : 'Data that may be processed'}:</strong>{' '}
            {isKo
              ? '기기 및 브라우저 정보, 방문 페이지, 클릭 이벤트, 광고 관련 식별자와 쿠키, 오류 분석용 로그'
              : 'Device and browser metadata, page visits, click events, advertising identifiers and cookies, and logs used for reliability analysis.'}
          </p>
          <p>
            <strong>{isKo ? '이용 목적' : 'Purpose'}:</strong>{' '}
            {isKo
              ? '서비스 품질 개선, 문제 분석, 방문 통계 확인, 광고 제공 및 정책 준수'
              : 'Service quality improvement, debugging, traffic measurement, ad serving, and policy compliance.'}
          </p>
          <p>
            <strong>{isKo ? '제3자 서비스' : 'Third-party services'}:</strong> Google Analytics, Microsoft Clarity, Google AdSense.
          </p>
          <p>
            <strong>{isKo ? '문의' : 'Contact'}:</strong>{' '}
            <a className="underline" href="mailto:kkgh6721255@naver.com">
              kkgh6721255@naver.com
            </a>
          </p>
          <p className="text-xs text-slate-500">{isKo ? '최종 업데이트: 2026-04-04' : 'Last updated: 2026-04-04'}</p>
        </div>
      </SectionCard>
    </section>
  );
}
