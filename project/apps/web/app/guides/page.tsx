"use client";

import Link from 'next/link';
import { useLocale } from '../../lib/context/LocaleContext';
import { guideMetas } from '../../lib/data/guides';

export default function GuidesPage() {
  const { locale } = useLocale();
  const guideCount = guideMetas.length;
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '참고 가이드' : 'Reference Guides'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isKo ? '실험 계산 뒤의 원리와 판단 기준을 설명하는 가이드' : 'Bench guides that explain the numbers behind each experiment'}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          {isKo
            ? '이 페이지들은 계산기만으로는 부족한 맥락을 보강합니다. 언제 어떤 방법을 써야 하는지, 자주 하는 해석 실수는 무엇인지, 결과를 믿기 전에 무엇을 확인해야 하는지 정리합니다.'
            : 'These pages add context that a calculator alone cannot provide: when to use a method, common interpretation mistakes, practical caveats, and what to check before you trust the output.'}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isKo
            ? `현재 가이드 라이브러리에는 assay 계획, 해석, 문제 해결, 실험 전 점검을 다루는 원문 참고 페이지 ${guideCount}개가 있습니다.`
            : `The guide library currently includes ${guideCount} original reference pages focused on assay planning, interpretation, troubleshooting, and pre-bench checks.`}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {guideMetas.map((guide) => (
          <article key={guide.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{isKo ? guide.titleKo : guide.titleEn}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{isKo ? guide.shortKo : guide.shortEn}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {isKo
                ? '각 가이드는 세팅 실수를 줄이고, 예외 상황을 짚고, 연결된 도구를 실제 실험 흐름에서 더 쉽게 쓰도록 돕기 위해 작성되었습니다.'
                : 'Each guide is written to reduce setup mistakes, highlight edge cases, and make the linked tools easier to use in a real lab workflow.'}
            </p>
            <Link href={`/guides/${guide.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
              {isKo ? '가이드 열기' : 'Open guide'}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
