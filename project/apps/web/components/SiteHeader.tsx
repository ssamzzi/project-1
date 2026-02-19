'use client';

import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();

  const nextLocale = locale === 'en' ? 'ko' : 'en';

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          BioLT
        </Link>
        <nav>
          <ul className="flex flex-wrap items-center gap-3 text-sm">
            <li>
              <Link href="/tools">{t('nav.tools')}</Link>
            </li>
            <li>
              <Link href="/workflows">{t('nav.workflows')}</Link>
            </li>
            <li>
              <Link href="/guides">{t('nav.guides')}</Link>
            </li>
            <li>
              <Link href="/about">{t('nav.about')}</Link>
            </li>
            <li>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1"
                onClick={() => setLocale(nextLocale)}
              >
                {t('nav.language')}: {locale.toUpperCase()} / {nextLocale.toUpperCase()}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
