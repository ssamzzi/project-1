'use client';

import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';

export function SiteFooter() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>{year} BioLT. {locale === 'ko' ? '실험 계산, 검증 예제, 해설 콘텐츠를 제공합니다.' : 'Practical lab calculators, worked examples, and reference content.'}</p>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/tools">{locale === 'ko' ? '도구' : 'Tools'}</Link>
          <Link href="/examples">{locale === 'ko' ? '예제' : 'Examples'}</Link>
          <Link href="/guides">{locale === 'ko' ? '가이드' : 'Guides'}</Link>
          <Link href="/workflows">{locale === 'ko' ? '워크플로' : 'Workflows'}</Link>
          <Link href="/about">{t('nav.about')}</Link>
          <Link href="/privacy">{locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</Link>
          <Link href="/terms">{locale === 'ko' ? '이용약관' : 'Terms'}</Link>
          <Link href="/editorial">{locale === 'ko' ? '편집 정책' : 'Editorial Policy'}</Link>
          <a href={t('about.placeholder')}>{locale === 'ko' ? '문의' : 'Contact'}</a>
        </nav>
      </div>
    </footer>
  );
}
