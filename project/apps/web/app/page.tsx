"use client";
import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';
import { toolMetas } from '../lib/data/tools';
import { SectionCard } from '../components/SectionCard';

export default function HomePage() {
  const { t, locale } = useLocale();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Life Science Lab Tools</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t('home.title')}</h1>
        <p className="max-w-3xl text-xl leading-relaxed text-slate-700">{t('home.subtitle')}</p>
        <p className="max-w-3xl text-slate-700">{t('home.description')}</p>
        <p className="text-lg font-medium text-slate-900">{t('home.cta.title')}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/tools" className="rounded-md bg-indigo-600 px-6 py-4 text-lg font-semibold text-white">
          {t('home.cta.tools')}
        </Link>
        <Link
          href="/workflows"
          className="rounded-md bg-slate-900 px-6 py-4 text-lg font-semibold text-white"
        >
          {t('home.cta.workflows')}
        </Link>
        <Link href="/guides" className="rounded-md border border-slate-900 px-6 py-4 text-lg font-semibold">
          {t('home.cta.guides')}
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {toolMetas.map((tool) => (
          <SectionCard key={tool.id} title={locale === 'ko' ? tool.nameKo : tool.nameEn}>
            <p className="text-sm text-slate-600">{locale === 'ko' ? tool.shortKo : tool.shortEn}</p>
            <Link className="mt-2 inline-block text-sm text-indigo-700 underline" href={`/tools/${tool.slug}`}>
              Open
            </Link>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}
