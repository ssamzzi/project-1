"use client";
import Link from 'next/link';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';
import { SectionCard } from '../../components/SectionCard';

export default function ToolsPage() {
  const { t, locale } = useLocale();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{t('tools.title')}</h1>
      <p className="mt-2 text-slate-600">{t('tools.description')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {toolMetas.map((tool) => {
          const title = locale === 'ko' ? tool.nameKo : tool.nameEn;
          const desc = locale === 'ko' ? tool.shortKo : tool.shortEn;
          return (
            <SectionCard key={tool.id} title={title}>
              <p className="text-sm text-slate-600">{desc}</p>
              <Link className="mt-3 inline-block text-sm text-indigo-700 underline" href={`/tools/${tool.slug}`}>
                {t('global.open')}
              </Link>
            </SectionCard>
          );
        })}
      </div>
    </section>
  );
}
