"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';
import { workflowMetas } from '../../lib/data/workflows';
import { guideMetas } from '../../lib/data/guides';

type SearchKind = 'tool' | 'workflow' | 'reference';

interface SearchItem {
  kind: SearchKind;
  title: string;
  summary: string;
  href: string;
  haystack: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export default function SearchPage() {
  const { locale, t } = useLocale();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);

  const allItems = useMemo<SearchItem[]>(() => {
    const tools = toolMetas.map((tool) => ({
      kind: 'tool' as const,
      title: locale === 'ko' ? tool.nameKo : tool.nameEn,
      summary: locale === 'ko' ? tool.shortKo : tool.shortEn,
      href: `/tools/${tool.slug}`,
      haystack: [tool.nameEn, tool.nameKo, tool.shortEn, tool.shortKo, tool.slug].join(' '),
    }));

    const workflows = workflowMetas.map((workflow) => ({
      kind: 'workflow' as const,
      title: locale === 'ko' ? workflow.titleKo : workflow.titleEn,
      summary: locale === 'ko' ? workflow.shortKo : workflow.shortEn,
      href: `/workflows/${workflow.slug}`,
      haystack: [workflow.titleEn, workflow.titleKo, workflow.shortEn, workflow.shortKo, workflow.slug].join(' '),
    }));

    const references = guideMetas.map((guide) => ({
      kind: 'reference' as const,
      title: locale === 'ko' ? guide.titleKo : guide.titleEn,
      summary: locale === 'ko' ? guide.shortKo : guide.shortEn,
      href: `/guides/${guide.slug}`,
      haystack: [guide.titleEn, guide.titleKo, guide.shortEn, guide.shortKo, guide.slug].join(' '),
    }));

    return [...tools, ...workflows, ...references];
  }, [locale]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return allItems;
    return allItems.filter((item) => normalize(item.haystack).includes(q));
  }, [allItems, query]);

  const grouped = useMemo(() => {
    return {
      tools: filtered.filter((item) => item.kind === 'tool'),
      workflows: filtered.filter((item) => item.kind === 'workflow'),
      references: filtered.filter((item) => item.kind === 'reference'),
    };
  }, [filtered]);

  const hasAny = grouped.tools.length + grouped.workflows.length + grouped.references.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{t('search.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('search.help')}</p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('search.placeholder')}
        className="mt-4 h-11 w-full rounded-lg border border-slate-300 bg-white px-3"
      />

      {!hasAny ? <p className="mt-6 text-sm text-slate-600">{t('search.empty')}</p> : null}

      {hasAny ? (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <section>
            <h2 className="text-lg font-semibold">{t('search.tools')}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {grouped.tools.map((item) => (
                <li key={item.href} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link href={item.href} className="font-medium text-indigo-700 underline">{item.title}</Link>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t('search.workflows')}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {grouped.workflows.map((item) => (
                <li key={item.href} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link href={item.href} className="font-medium text-indigo-700 underline">{item.title}</Link>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{t('search.references')}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {grouped.references.map((item) => (
                <li key={item.href} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link href={item.href} className="font-medium text-indigo-700 underline">{item.title}</Link>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </section>
  );
}
