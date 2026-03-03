'use client';

import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';

export function SiteFooter() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} BioLT. {locale === 'ko' ? '실험 보조 계산/분석 웹 도구' : 'Practical calculation and analysis tools for bio labs.'}
        </p>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/about">{t('nav.about')}</Link>
          <Link href="/privacy">{locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</Link>
          <Link href="/terms">{locale === 'ko' ? '이용약관' : 'Terms'}</Link>
          <Link href="/editorial">{locale === 'ko' ? '콘텐츠 원칙' : 'Editorial Policy'}</Link>
          <a href={t('about.placeholder')}>{locale === 'ko' ? '문의' : 'Contact'}</a>
        </nav>
      </div>
    </footer>
  );
}
