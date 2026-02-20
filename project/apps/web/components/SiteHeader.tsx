'use client';

import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';
import { useAdmin } from '../lib/context/AdminContext';
import { FormEvent, useState } from 'react';

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const nextLocale = locale === 'en' ? 'ko' : 'en';

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(password);
    if (ok) {
      setPassword('');
      setAdminError('');
    } else {
      setAdminError(t('admin.badPassword') || 'Wrong password');
    }
  };

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
            <li>
              {isAdmin ? (
                <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-xs" onClick={logout}>
                  {t('admin.logout')}
                </button>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex items-center gap-1">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                    type="password"
                    placeholder={t('admin.loginPlaceholder')}
                    className="w-20 rounded border border-slate-300 px-1.5 py-1 text-xs"
                  />
                  <button className="rounded bg-slate-900 px-2 py-1 text-xs text-white" type="submit">
                    {t('admin.login')}
                  </button>
                  {adminError ? <span className="text-xs text-rose-600">{adminError}</span> : null}
                </form>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
