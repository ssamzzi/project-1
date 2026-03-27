"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale } from '../lib/context/LocaleContext';
import { exampleMetas } from '../lib/data/examples';
import { guideMetas } from '../lib/data/guides';
import { toolMetas } from '../lib/data/tools';
import { workflowMetas } from '../lib/data/workflows';

export default function HomePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedTools = [...toolMetas].sort((a, b) => (locale === 'ko' ? a.nameKo : a.nameEn).localeCompare(locale === 'ko' ? b.nameKo : b.nameEn, collator));
  const topTools = sortedTools.slice(0, 9);
  const featuredExamples = exampleMetas.slice(0, 3);
  const featuredGuides = guideMetas.slice(0, 3);
  const featuredWorkflows = workflowMetas.slice(0, 3);
  const contactHref = t('about.placeholder');
  const contactEmail = contactHref.replace(/^mailto:/, '');

  const valueCards =
    locale === 'ko'
      ? [
          { title: '실전 계산', body: 'PCR, qPCR, 세포 시딩, 희석, 클로닝처럼 실제 실험 준비에서 반복되는 계산에 집중합니다.' },
          { title: '예제 중심', body: '공식만 나열하지 않고 실제 실험 상황을 기준으로 worked example과 워크플로를 함께 제공합니다.' },
          { title: '검증 지향', body: '가정, 경고, 자주 틀리는 지점, 정책 페이지를 함께 공개해 결과를 다시 확인하기 쉽게 했습니다.' },
        ]
      : [
          { title: 'Bench-ready calculations', body: 'Focused on PCR, qPCR, cell seeding, dilution, and cloning tasks that recur in real wet-lab work.' },
          { title: 'Worked examples', body: 'Each core area is paired with worked examples and workflows instead of relying on calculators alone.' },
          { title: 'Validation-first', body: 'Assumptions, warnings, error-prone steps, and policy pages are all exposed for review.' },
        ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-8 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {locale === 'ko' ? '연구자 실전 계산 허브' : 'Bench Calculation Hub'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t('home.title')}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
            {locale === 'ko'
              ? 'BioLT는 연구자가 실제로 반복해서 찾는 계산, worked example, 워크플로를 모아 실험 준비를 돕습니다.'
              : 'BioLT combines practical calculators, worked examples, and workflow notes that researchers can reuse during experiment preparation.'}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            {locale === 'ko'
              ? '단순 계산기 목록이 아니라 실험 전 검토와 재현성 확보를 위한 참고 사이트를 목표로 합니다.'
              : 'The goal is not a generic calculator list, but a reusable reference site for pre-bench checks and reproducibility.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-700">
            <p>
              {locale === 'ko' ? '제작자' : 'Creator'}:{' '}
              <a href={t('about.instagramUrl')} target="_blank" rel="noreferrer" className="font-medium underline">
                @biossom_._
              </a>
            </p>
            <p>
              {locale === 'ko' ? '문의' : 'Contact'}:{' '}
              <a href={contactHref} className="font-medium underline">
                {contactEmail}
              </a>
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tools" className="rounded-md bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm">
              {t('home.cta.tools')}
            </Link>
            <Link href="/examples" className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm">
              {locale === 'ko' ? '예제 보기' : 'Worked examples'}
            </Link>
            <Link href="/search" className="rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm">
              {t('nav.search')}
            </Link>
          </div>
          <form
            className="mt-5 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const q = searchQuery.trim();
              router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
            }}
          >
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('search.placeholder')}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm md:max-w-lg"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              {t('nav.search')}
            </button>
          </form>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {locale === 'ko' ? '핵심 가치' : 'Core Value'}
          </p>
          <ul className="mt-3 space-y-3">
            {valueCards.map((item) => (
              <li key={item.title} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '가장 많이 찾는 계산' : 'Most useful calculators'}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {topTools.slice(0, 3).map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
              <p className="text-sm font-semibold text-slate-900">{locale === 'ko' ? tool.nameKo : tool.nameEn}</p>
              <p className="mt-1 text-sm text-slate-600">{locale === 'ko' ? tool.shortKo : tool.shortEn}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
          {locale === 'ko' ? '신규 워크플로 도구' : 'New Workflow Tool'}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-slate-900">Genome Metadata Cleaner</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {locale === 'ko'
                ? 'CSV, TSV, XLSX, FASTA 헤더를 업로드해 메타데이터 문제를 먼저 분석하고, 필드별 정규화 전략을 고른 뒤 diff와 변경 로그까지 검토할 수 있습니다.'
                : 'Upload CSV, TSV, XLSX, or FASTA headers to analyze metadata issues first, choose normalization per field, preview diffs, and export a cleaned file with an audit log.'}
            </p>
          </div>
          <Link href="/genome-metadata-cleaner" className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white">
            {locale === 'ko' ? '클리너 열기' : 'Open cleaner'}
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">{locale === 'ko' ? '핵심 도구 라이브러리' : 'Core tool library'}</h2>
            <Link href="/tools" className="text-xs text-indigo-700 underline">
              {t('global.open')}
            </Link>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
            {topTools.map((tool) => (
              <li key={tool.id} className="rounded-lg border border-slate-100 p-3">
                <Link href={`/tools/${tool.slug}`} className="font-medium text-indigo-700 underline">
                  {locale === 'ko' ? tool.nameKo : tool.nameEn}
                </Link>
                <p className="mt-1 text-slate-600">{locale === 'ko' ? tool.shortKo : tool.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '실전 예제' : 'Worked examples'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {locale === 'ko'
              ? '실제 연구 상황을 기준으로 계산 결과를 어떻게 해석하고 적용하는지 보여줍니다.'
              : 'Shows how a researcher would interpret and apply calculator outputs in realistic lab situations.'}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {featuredExamples.map((example) => (
              <li key={example.slug} className="rounded-lg border border-slate-100 p-3">
                <Link href={`/examples/${example.slug}`} className="font-medium text-indigo-700 underline">
                  {example.title}
                </Link>
                <p className="mt-1 text-slate-600">{example.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '설명형 가이드' : 'Guides with context'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {locale === 'ko'
              ? '가이드는 계산식만이 아니라 해석 한계, 흔한 실수, 선택 기준까지 설명합니다.'
              : 'Guides explain context, interpretation limits, common mistakes, and method choice.'}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {featuredGuides.map((guide) => (
              <li key={guide.id} className="rounded-lg border border-slate-100 p-3">
                <Link href={`/guides/${guide.slug}`} className="font-medium text-indigo-700 underline">
                  {locale === 'ko' ? guide.titleKo : guide.titleEn}
                </Link>
                <p className="mt-1 text-slate-600">{locale === 'ko' ? guide.shortKo : guide.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '실험 워크플로' : 'Workflows for experiments'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {locale === 'ko'
              ? '워크플로는 여러 도구를 하나의 실험 흐름으로 연결해 준비 순서와 검증 포인트를 보여줍니다.'
              : 'Workflows connect several tools into one experimental sequence and expose validation checkpoints.'}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {featuredWorkflows.map((workflow) => (
              <li key={workflow.id} className="rounded-lg border border-slate-100 p-3">
                <Link href={`/workflows/${workflow.slug}`} className="font-medium text-indigo-700 underline">
                  {locale === 'ko' ? workflow.titleKo : workflow.titleEn}
                </Link>
                <p className="mt-1 text-slate-600">{locale === 'ko' ? workflow.shortKo : workflow.shortEn}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
