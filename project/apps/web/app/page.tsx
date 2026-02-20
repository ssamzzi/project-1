"use client";
import Link from 'next/link';
import { useLocale } from '../lib/context/LocaleContext';
import { toolMetas } from '../lib/data/tools';
import { workflowMetas } from '../lib/data/workflows';
import { guideMetas } from '../lib/data/guides';

export default function HomePage() {
  const { t, locale } = useLocale();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Life Science Lab Tools</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t('home.title')}</h1>
        <p className="max-w-3xl text-xl leading-relaxed text-slate-700">{t('home.subtitle')}</p>
        <p className="max-w-3xl text-slate-700">{t('home.description')}</p>
        <p className="text-xl font-medium text-slate-900">{t('home.cta.title')}</p>
        <p className="text-sm text-slate-700">{t('home.sectionIntro')}</p>
        <p className="text-sm text-slate-700">
          {t('global.description.tools') || 'Tools: calculators and practical parameter checks.'}
        </p>
        <p className="text-sm text-slate-700">
          {t('global.description.workflows') || 'Workflows: checklist-style protocols to run experiments in order.'}
        </p>
        <p className="text-sm text-slate-700">
          {t('global.description.guides') || 'Guides: short reference notes for decision making.'}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/tools"
          className="rounded-md bg-indigo-600 px-8 py-5 text-xl font-semibold text-white"
        >
          {t('home.cta.tools')}
        </Link>
        <Link
          href="/workflows"
          className="rounded-md bg-slate-900 px-8 py-5 text-xl font-semibold text-white"
        >
          {t('home.cta.workflows')}
        </Link>
        <Link href="/guides" className="rounded-md border border-slate-900 px-8 py-5 text-xl font-semibold">
          {t('home.cta.guides')}
        </Link>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">{t('home.tools')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {toolMetas.map((tool) => (
              <li key={tool.id} className="list-disc pl-4">
                <Link href={`/tools/${tool.slug}`} className="text-indigo-700 underline">
                  {locale === 'ko' ? tool.nameKo : tool.nameEn}
                </Link>
                <p className="text-slate-600">{locale === 'ko' ? tool.shortKo : tool.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">{t('home.workflows')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {workflowMetas.map((workflow) => (
              <li key={workflow.id} className="list-disc pl-4">
                <Link href={`/workflows/${workflow.slug}`} className="text-indigo-700 underline">
                  {locale === 'ko' ? workflow.titleKo : workflow.titleEn}
                </Link>
                <p className="text-slate-600">{locale === 'ko' ? workflow.shortKo : workflow.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">{t('home.guides')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {guideMetas.map((guide) => (
              <li key={guide.id} className="list-disc pl-4">
                <Link href={`/guides/${guide.slug}`} className="text-indigo-700 underline">
                  {locale === 'ko' ? guide.titleKo : guide.titleEn}
                </Link>
                <p className="text-slate-600">{locale === 'ko' ? guide.shortKo : guide.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
