"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../lib/context/LocaleContext';
import { guideMetas } from '../../lib/data/guides';
import { toolMetas } from '../../lib/data/tools';
import { workflowMetas } from '../../lib/data/workflows';

type SearchKind = 'tool' | 'module' | 'guide' | 'workflow';

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

    const guides = guideMetas.map((guide) => ({
      kind: 'guide' as const,
      title: guide.titleEn,
      summary: guide.shortEn,
      href: `/guides/${guide.slug}`,
      haystack: [guide.titleEn, guide.titleKo, guide.shortEn, guide.shortKo, guide.slug].join(' '),
    }));

    const workflows = workflowMetas.map((workflow) => ({
      kind: 'workflow' as const,
      title: workflow.titleEn,
      summary: workflow.shortEn,
      href: `/workflows/${workflow.slug}`,
      haystack: [workflow.titleEn, workflow.titleKo, workflow.shortEn, workflow.shortKo, workflow.slug, workflow.tools.join(' ')].join(' '),
    }));

    const moduleItem: SearchItem = {
      kind: 'module',
      title: 'LabOps AI',
      summary: locale === 'ko' ? 'AI 분석 모듈과 실무 도우미' : 'Integrated AI analysis and lab utility modules',
      href: '/labops-ai',
      haystack: 'labops ai omniparse visionlab protocolguard inventory parser blot colony barcode freezer',
    };

    return [moduleItem, ...tools, ...guides, ...workflows];
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
      guides: filtered.filter((item) => item.kind === 'guide').sort(sortByTitle),
      workflows: filtered.filter((item) => item.kind === 'workflow').sort(sortByTitle),
    };
  }, [filtered, locale]);

  const hasAny = grouped.modules.length > 0 || grouped.tools.length > 0 || grouped.guides.length > 0 || grouped.workflows.length > 0;

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
        <div className="mt-6 space-y-6">
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
          <section>
            <h2 className="text-lg font-semibold">Guides</h2>
            <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
              {grouped.guides.map((item) => (
                <li key={item.href} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link href={item.href} className="font-medium text-indigo-700 underline">{item.title}</Link>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Workflows</h2>
            <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
              {grouped.workflows.map((item) => (
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
