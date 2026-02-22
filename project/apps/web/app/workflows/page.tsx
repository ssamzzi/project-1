"use client";

import Link from 'next/link';
import { workflowMetas } from '../../lib/data/workflows';
import { useLocale } from '../../lib/context/LocaleContext';

export default function WorkflowsPage() {
  const { locale, t } = useLocale();
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedWorkflows = [...workflowMetas].sort((a, b) => (locale === 'ko' ? a.titleKo : a.titleEn).localeCompare(locale === 'ko' ? b.titleKo : b.titleEn, collator));
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{t('workflows.title')}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedWorkflows.map((w) => {
          const title = locale === 'ko' ? w.titleKo : w.titleEn;
          const short = locale === 'ko' ? w.shortKo : w.shortEn;
          return (
            <article key={w.slug} className="rounded-lg border bg-white p-4">
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm text-slate-700">{short}</p>
              <Link href={`/workflows/${w.slug}`} className="mt-3 inline-block text-sm text-indigo-700 underline">
                {t('global.open')}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
