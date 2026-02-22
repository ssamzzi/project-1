"use client";
import Link from 'next/link';
import { guideMetas } from '../../lib/data/guides';
import { useLocale } from '../../lib/context/LocaleContext';

export default function GuidesPage() {
  const { locale, t } = useLocale();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{t('guides.title')}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guideMetas.map((g) => {
          const title = locale === 'ko' ? g.titleKo : g.titleEn;
          const short = locale === 'ko' ? g.shortKo : g.shortEn;
          return (
            <article key={g.slug} className="rounded-lg border bg-white p-4">
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm text-slate-700">{short}</p>
              <Link href={`/guides/${g.slug}`} className="mt-3 inline-block text-sm text-indigo-700 underline">
                {t('global.open')}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
