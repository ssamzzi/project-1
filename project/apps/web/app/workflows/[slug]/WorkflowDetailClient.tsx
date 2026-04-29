"use client";

import Link from 'next/link';
import { MarkdownArticle } from '../../../components/MarkdownArticle';
import { useLocale } from '../../../lib/context/LocaleContext';
import { toolMetas } from '../../../lib/data/tools';
import { workflowMarkdownKo } from '../../../lib/data/workflowContentKo';
import type { WorkflowMeta } from '../../../lib/data/workflows';

export function WorkflowDetailClient({ workflow, markdown }: { workflow: WorkflowMeta; markdown: string }) {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const title = isKo ? workflow.titleKo : workflow.titleEn;
  const summary = isKo ? workflow.shortKo : workflow.shortEn;
  const localizedMarkdown = isKo ? workflowMarkdownKo[workflow.slug] || markdown : markdown;
  const linkedTools = workflow.tools.reduce<(typeof toolMetas)[number][]>((items, toolId) => {
    const tool = toolMetas.find((entry) => entry.id === toolId);
    if (tool) {
      items.push(tool);
    }
    return items;
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '워크플로' : 'Workflow'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{summary}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <MarkdownArticle title={title} markdown={localizedMarkdown} />
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '사용할 도구' : 'Use these tools'}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {linkedTools.map((tool) => (
                <li key={tool.id}>
                  <Link href={`/tools/${tool.slug}`} className="font-medium text-sky-700 underline">
                    {isKo ? tool.nameKo : tool.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '운영 메모' : 'Operational note'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {isKo
                ? '워크플로 페이지는 계산을 전체 준비 순서와 연결해, 독자가 목적, 단계, 검증 지점을 함께 이해하도록 돕기 위해 만들어졌습니다.'
                : 'The purpose of these workflow pages is to connect calculations to a full experimental sequence, which helps readers understand intent, sequencing, and validation checks.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/workflows" className="font-medium text-sky-700 underline">
                {isKo ? '모든 워크플로' : 'All workflows'}
              </Link>
              <Link href="/tools" className="font-medium text-sky-700 underline">
                {isKo ? '도구 라이브러리' : 'Tool library'}
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
