"use client";

import Link from 'next/link';
import { useLocale } from '../../lib/context/LocaleContext';
import { exampleMetas } from '../../lib/data/examples';
import { getExampleText } from '../../lib/data/exampleTranslations';

export default function ExamplesPage() {
  const { locale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '실전 예제' : 'Worked Examples'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isKo ? '일반 계산기가 아니라 실제 실험 세팅을 보여주는 예제' : 'Real experiment setups, not just generic calculators'}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          {isKo
            ? '이 예제들은 연구자가 PCR 계획, 세포 시딩, 클로닝, qPCR 해석 과정에서 BioLT를 실제로 어떻게 사용할 수 있는지 보여 줍니다. 각 페이지는 독립적인 참고 자료로 읽을 수 있게 구성되어 있습니다.'
            : 'These worked examples show how a researcher would actually use BioLT during PCR planning, cell seeding, cloning, and qPCR interpretation. Each page is meant to stand on its own as reference content.'}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {exampleMetas.map((example) => {
          const text = getExampleText(locale, example);
          return (
            <article key={example.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{text.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{text.summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{isKo ? '추천 대상' : 'Best for'}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text.audience}</p>
              <Link href={`/examples/${example.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
                {isKo ? '예제 열기' : 'Open example'}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
