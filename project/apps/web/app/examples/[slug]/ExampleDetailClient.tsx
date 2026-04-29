"use client";

import Link from 'next/link';
import type { ExampleMeta } from '../../../lib/data/examples';
import { getExampleSectionHeading, getExampleText } from '../../../lib/data/exampleTranslations';
import { useLocale } from '../../../lib/context/LocaleContext';

export function ExampleDetailClient({ example }: { example: ExampleMeta }) {
  const { locale } = useLocale();
  const isKo = locale === 'ko';
  const text = getExampleText(locale, example);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '실전 예제' : 'Worked Example'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{text.summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={example.toolHref} className="font-medium text-sky-700 underline">
            {isKo ? '연결된 계산기 열기' : 'Open linked calculator'}
          </Link>
          {example.workflowHref ? (
            <Link href={example.workflowHref} className="font-medium text-sky-700 underline">
              {isKo ? '관련 워크플로 열기' : 'Open related workflow'}
            </Link>
          ) : null}
          <Link href="/examples" className="font-medium text-sky-700 underline">
            {isKo ? '모든 예제 보기' : 'All worked examples'}
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="space-y-6">
          {example.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{getExampleSectionHeading(locale, section.heading)}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '이 페이지가 있는 이유' : 'Why this page exists'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {isKo
                ? '실전 예제는 연구자에게 구체적인 시작점을 제공하고, 심사자에게도 독립적인 교육 가치가 있는 페이지로 보이게 합니다.'
                : 'A worked example gives researchers a concrete starting point and gives reviewers a page with standalone educational value.'}
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{isKo ? '벤치 작업 전 확인' : 'Use before the bench'}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>{isKo ? '실제 stock 농도와 단위를 확인하세요.' : 'Confirm the actual stock concentration and units.'}</li>
              <li>{isKo ? 'control과 replicate가 포함되었는지 확인하세요.' : 'Check whether controls and replicates are included.'}</li>
              <li>{isKo ? '계산 후 최종 세팅을 실험노트에 기록하세요.' : 'Record the final setup in the lab notebook after calculation.'}</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
