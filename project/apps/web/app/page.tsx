"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale } from '../lib/context/LocaleContext';
import { toolMetas } from '../lib/data/tools';

export default function HomePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedTools = [...toolMetas].sort((a, b) => (locale === 'ko' ? a.nameKo : a.nameEn).localeCompare(locale === 'ko' ? b.nameKo : b.nameEn, collator));
  const topTools = sortedTools.slice(0, 12);
  const quickStartTitle = locale === 'ko' ? '빠른 시작' : 'Quick Start';
  const contactHref = t('about.placeholder');
  const contactEmail = contactHref.replace(/^mailto:/, '');
  const creatorLabel = locale === 'ko' ? '제작자' : 'Creator';
  const contactLabel = locale === 'ko' ? '문의' : 'Contact';

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Bio Lab</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t('home.title')}</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">{t('home.subtitle')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-700">
          <p>
            {creatorLabel}:{' '}
            <a href={t('about.instagramUrl')} target="_blank" rel="noreferrer" className="font-medium underline">
              @biossom_._
            </a>
          </p>
          <p>
            {contactLabel}:{' '}
            <a href={contactHref} className="font-medium underline">
              {contactEmail}
            </a>
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/tools"
            className="rounded-md bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm"
          >
            {t('home.cta.tools')}
          </Link>
          <Link
            href="/search"
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm"
          >
            {t('nav.search')}
          </Link>
          <Link
            href="/labops-ai"
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm"
          >
            LabOps AI
          </Link>
        </div>
        <form
          className="mt-5 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const q = searchQuery.trim();
            router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
          }}
        >
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm md:max-w-lg"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            {t('nav.search')}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">{quickStartTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link href="/tools/pcr-master-mix" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">PCR/qPCR</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? 'Master Mix, Copy Number, Serial Dilution 확인' : 'Master mix, copy number, dilution checks'}
            </p>
          </Link>
          <Link href="/tools/cell-seeding" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">Cell Seeding</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? 'Cell 농도와 plate volume 빠른 계산' : 'Fast setup for cell density and plate volume'}
            </p>
          </Link>
          <Link href="/tools/ligation" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">Ligation</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? 'Vector/Insert molar ratio 계산' : 'Vector/insert molar ratio setup'}
            </p>
          </Link>
          <Link href="/labops-ai" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">LabOps AI</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? 'OmniParse, VisionLab, ProtocolGuard, Inventory 통합 모듈' : 'Integrated OmniParse, VisionLab, ProtocolGuard, and Inventory modules'}
            </p>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">{t('home.tools')}</h2>
            <Link href="/tools" className="text-xs text-indigo-700 underline">{t('global.open')}</Link>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
            {topTools.map((tool) => (
              <li key={tool.id} className="rounded-lg border border-slate-100 p-3">
                <Link href={`/tools/${tool.slug}`} className="font-medium text-indigo-700 underline">
                  {locale === 'ko' ? tool.nameKo : tool.nameEn}
                </Link>
                <p className="mt-1 text-slate-600">{locale === 'ko' ? tool.shortKo : tool.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
