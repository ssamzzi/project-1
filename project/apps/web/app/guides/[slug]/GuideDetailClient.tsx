"use client";

import Link from 'next/link';
import { MarkdownArticle } from '../../../components/MarkdownArticle';
import { useLocale } from '../../../lib/context/LocaleContext';
import type { GuideMeta } from '../../../lib/data/guides';

export function GuideDetailClient({ guide, markdown }: { guide: GuideMeta; markdown: string }) {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const title = isKo ? guide.titleKo : guide.titleEn;
  const summary = isKo ? guide.shortKo : guide.shortEn;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '가이드' : 'Guide'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/guides" className="font-medium text-sky-700 underline">
            {isKo ? '모든 가이드' : 'All guides'}
          </Link>
          <Link href="/tools" className="font-medium text-sky-700 underline">
            {isKo ? '실험 계산기' : 'Lab calculators'}
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <MarkdownArticle title={title} markdown={markdown} />
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '이 페이지가 있는 이유' : 'Why this page exists'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {isKo
                ? '애드센스와 검색 심사는 독립적인 가치가 있는 페이지를 봅니다. 이 가이드는 단순히 도구로 이동시키는 페이지가 아니라 설명과 판단 기준을 제공하기 위해 작성되었습니다.'
                : 'AdSense and Search reviewers both look for pages with original value. This guide is intended to provide explanation, not just a route to a tool.'}
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '적용 전 확인' : 'Before applying the advice'}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>{isKo ? '실험실 SOP와 kit manual을 확인하세요.' : 'Check your lab SOP and kit manual.'}</li>
              <li>{isKo ? '단위, 희석 가정, control을 기록하세요.' : 'Record units, dilution assumptions, and controls.'}</li>
              <li>{isKo ? '샘플 품질이나 장비 조건이 바뀌면 계산을 다시 확인하세요.' : 'Repeat calculations when sample quality or instrument conditions change.'}</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
