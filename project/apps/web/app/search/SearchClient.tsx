"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';

type SearchKind = 'tool' | 'module';

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

export function SearchClient() {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') || '';
    setQuery(q);
  }, []);

  const allItems = useMemo<SearchItem[]>(() => {
    const tools = toolMetas.map((tool) => ({
      kind: 'tool' as const,
      title: locale === 'ko' ? tool.nameKo : tool.nameEn,
      summary: locale === 'ko' ? tool.shortKo : tool.shortEn,
      href: `/tools/${tool.slug}`,
      haystack: [tool.nameEn, tool.nameKo, tool.shortEn, tool.shortKo, tool.slug].join(' '),
    }));

    const moduleItem: SearchItem = {
      kind: 'module',
      title: 'LabOps AI',
      summary: locale === 'ko' ? 'OmniParse, VisionLab, ProtocolGuard, Inventory 통합 모듈' : 'Integrated OmniParse, VisionLab, ProtocolGuard, and Inventory module',
      href: '/labops-ai',
      haystack: 'labops ai omniparse visionlab protocolguard inventory parser blot colony barcode freezer',
    };

    return [moduleItem, ...tools];
  }, [locale]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return allItems;
    return allItems.filter((item) => normalize(item.haystack).includes(q));
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
    const sortByTitle = (a: SearchItem, b: SearchItem) => a.title.localeCompare(b.title, collator);
    return {
      modules: filtered.filter((item) => item.kind === 'module').sort(sortByTitle),
      tools: filtered.filter((item) => item.kind === 'tool').sort(sortByTitle),
    };
  }, [filtered, locale]);

  const hasAny = grouped.modules.length > 0 || grouped.tools.length > 0;

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
        <div className="mt-6">
          <section>
            <h2 className="text-lg font-semibold">Modules</h2>
            <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
              {grouped.modules.map((item) => (
                <li key={item.href} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link href={item.href} className="font-medium text-indigo-700 underline">{item.title}</Link>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">{t('search.tools')}</h2>
            <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
              {grouped.tools.map((item) => (
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
