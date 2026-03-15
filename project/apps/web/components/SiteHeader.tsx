'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdmin } from '../lib/context/AdminContext';
import { useLocale } from '../lib/context/LocaleContext';

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { isAdmin, logout } = useAdmin();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const nextLocale = locale === 'en' ? 'ko' : 'en';
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem('biolt-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    root.setAttribute('data-theme', initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.setAttribute('data-theme', nextTheme);
    window.localStorage.setItem('biolt-theme', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-slate-900">
          BioLT
        </Link>
        <nav>
          <ul className="flex flex-wrap items-center gap-3 text-sm">
            <li>
              <Link href="/tools">{t('nav.tools')}</Link>
            </li>
            <li>
              <Link href="/guides">Guides</Link>
            </li>
            <li>
              <Link href="/workflows">Workflows</Link>
            </li>
            <li>
              <Link href="/labops-ai">LabOps AI</Link>
            </li>
            <li>
              <Link href="/about">{t('nav.about')}</Link>
            </li>
            <li>
              <Link href="/search">{t('nav.search')}</Link>
            </li>
            <li>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-2 py-1"
                onClick={() => setLocale(nextLocale)}
              >
                {t('nav.language')}: {locale.toUpperCase()} / {nextLocale.toUpperCase()}
              </button>
            </li>
            <li>
              <button type="button" className="rounded-md border border-slate-300 bg-white px-2 py-1" onClick={toggleTheme}>
                {t('nav.theme')}: {theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')}
              </button>
            </li>
            {isAdmin ? (
              <li>
                <div className="flex items-center gap-1">
                  <Link href="/admin" className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                    Admin Panel
                  </Link>
                  <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-xs" onClick={logout}>
                    {t('admin.logout')}
                  </button>
                </div>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}
