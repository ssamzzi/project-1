"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale } from '../lib/context/LocaleContext';
import { guideMetas } from '../lib/data/guides';
import { toolMetas } from '../lib/data/tools';
import { workflowMetas } from '../lib/data/workflows';

export default function HomePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedTools = [...toolMetas].sort((a, b) => (locale === 'ko' ? a.nameKo : a.nameEn).localeCompare(locale === 'ko' ? b.nameKo : b.nameEn, collator));
  const topTools = sortedTools.slice(0, 12);
  const featuredGuides = guideMetas.slice(0, 3);
  const featuredWorkflows = workflowMetas.slice(0, 3);
  const contactHref = t('about.placeholder');
  const contactEmail = contactHref.replace(/^mailto:/, '');

  const valueCards =
    locale === 'ko'
      ? [
          { title: '실용 계산', body: '희석, 농도, 세포수, 클로닝 세팅처럼 실험 전에 자주 확인하는 값을 빠르게 계산합니다.' },
          { title: '설명형 콘텐츠', body: '가이드와 워크플로 페이지에서 계산의 맥락과 실수 포인트를 함께 설명합니다.' },
          { title: '정책 공개', body: 'About, Privacy, Terms, Editorial 페이지를 통해 운영 기준과 문의 방법을 공개합니다.' },
        ]
      : [
          { title: 'Practical calculations', body: 'Quick checks for dilution, concentration, cell counts, and cloning setup.' },
          { title: 'Explanatory content', body: 'Guide and workflow pages add context, caveats, and interpretation notes.' },
          { title: 'Policy transparency', body: 'About, Privacy, Terms, and Editorial pages are visible from every page.' },
        ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-8 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {locale === 'ko' ? '실험 준비 워크스페이스' : 'Lab Prep Workspace'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t('home.title')}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
            {locale === 'ko'
              ? '계산기, 가이드, 워크플로를 한곳에 모아 실험 준비와 검증을 돕습니다.'
              : 'Access calculators, guides, and workflow references from one streamlined interface.'}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t('home.subtitle')}</p>
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
            <Link href="/guides" className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm">
              {locale === 'ko' ? '가이드' : 'Guides'}
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
            {locale === 'ko' ? '사이트 가치' : 'Site Value'}
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
        <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '빠른 시작' : 'Quick Start'}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link href="/tools/pcr-master-mix" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">PCR/qPCR</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? '마스터 믹스, 카피 넘버, 희석 계획' : 'Master mix, copy number, and dilution planning'}
            </p>
          </Link>
          <Link href="/tools/cell-seeding" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">Cell Seeding</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? '세포 밀도, plate 면적, 배양 부피 설정' : 'Cell density, plate area, and volume setup'}
            </p>
          </Link>
          <Link href="/workflows/cell-culture" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
            <p className="text-sm font-semibold text-slate-900">{locale === 'ko' ? '워크플로' : 'Workflow'}</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === 'ko' ? '카운팅, 시딩, 일상 배양 흐름을 한 번에 정리' : 'Connect counting, seeding, and daily handling into one flow'}
            </p>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">{t('home.tools')}</h2>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '설명형 가이드' : 'Guides with original context'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {locale === 'ko'
              ? '가이드 페이지는 계산기만으로 부족한 가정, 실수 포인트, 해석 한계를 설명합니다.'
              : 'Standalone guide pages explain assumptions, common mistakes, and interpretation limits so the site offers value beyond raw calculators.'}
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
          <Link href="/guides" className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
            {locale === 'ko' ? '가이드 전체 보기' : 'Browse all guides'}
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '실험 워크플로' : 'Workflow pages for real lab tasks'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {locale === 'ko'
              ? '워크플로 페이지는 여러 도구를 하나의 실험 흐름으로 연결해 준비 순서와 검증 포인트를 보여 줍니다.'
              : 'Workflow pages connect multiple tools into experiment sequences so readers can see preparation order, controls, and validation checkpoints in one place.'}
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
          <Link href="/workflows" className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
            {locale === 'ko' ? '워크플로 전체 보기' : 'Browse all workflows'}
          </Link>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? 'BioLT 사용 원칙' : 'How BioLT is intended to be used'}</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            {locale === 'ko' ? (
              <>
                <p>각 계산기 페이지는 입력값, 계산식, 가정, 경고 조건을 함께 보여 주도록 설계되어 있습니다.</p>
                <p>가이드와 워크플로 페이지는 계산 결과를 실제 실험 맥락에서 이해할 수 있도록 독립적인 설명 가치를 제공합니다.</p>
                <p>최종 의사결정은 반드시 실험실 SOP, 키트 매뉴얼, 장비 조건, 지도자 검토로 다시 확인해야 합니다.</p>
              </>
            ) : (
              <>
                <p>Each calculator page is meant to document inputs, formulas, assumptions, and warnings that matter during experiment setup.</p>
                <p>Guide and workflow pages provide original educational value so visitors can understand the lab context before using a result.</p>
                <p>Final decisions should still be validated against local SOPs, kit manuals, instrument constraints, and supervisor review.</p>
              </>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{locale === 'ko' ? '신뢰 신호' : 'Trust signals'}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {locale === 'ko' ? (
              <>
                <li>About, Privacy, Terms, Editorial 페이지 공개</li>
                <li>검색 가능한 도구, 가이드, 워크플로 라이브러리</li>
                <li>푸터의 문의 이메일과 정책 링크</li>
              </>
            ) : (
              <>
                <li>Clear About, Privacy, Terms, and Editorial pages</li>
                <li>Searchable tool, guide, and workflow library</li>
                <li>Contact email and policy links in the footer</li>
              </>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
