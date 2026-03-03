"use client";

import { SectionCard } from '../../components/SectionCard';
import { useLocale } from '../../lib/context/LocaleContext';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <SectionCard title={isKo ? '개인정보처리방침' : 'Privacy Policy'}>
        <div className="space-y-3 text-sm leading-6 text-slate-700">
          <p>
            {isKo
              ? 'BioLT는 계정 등록 없이 사용 가능한 실험 보조 사이트입니다. 다만 서비스 품질 개선과 광고 제공을 위해 일부 브라우저 데이터가 수집될 수 있습니다.'
              : 'BioLT is a no-account lab support site. Some browser data may be processed for analytics and advertising operations.'}
          </p>
          <p>
            <strong>{isKo ? '수집/처리 항목' : 'Data processed'}:</strong>{' '}
            {isKo
              ? '접속 로그(기기/브라우저/국가), 페이지 조회, 클릭 이벤트, 광고 관련 쿠키/식별자(가능한 경우).'
              : 'Device/browser metadata, page views, click events, and ad-related cookies/identifiers when enabled.'}
          </p>
          <p>
            <strong>{isKo ? '사용 목적' : 'Purpose'}:</strong>{' '}
            {isKo
              ? '트래픽 분석, 오류 개선, 서비스 운영 안정화, 광고 정책 준수.'
              : 'Traffic analytics, reliability improvements, debugging, and ad policy compliance.'}
          </p>
          <p>
            <strong>{isKo ? '제3자 서비스' : 'Third-party services'}:</strong>{' '}
            Google Analytics, Microsoft Clarity, Google AdSense.
          </p>
          <p>
            <strong>{isKo ? '문의' : 'Contact'}:</strong>{' '}
            <a className="underline" href="mailto:kkgh6721255@naver.com">
              kkgh6721255@naver.com
            </a>
          </p>
          <p className="text-xs text-slate-500">
            {isKo ? '최종 업데이트: 2026-03-03' : 'Last updated: 2026-03-03'}
          </p>
        </div>
      </SectionCard>
    </section>
  );
}
