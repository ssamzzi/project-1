"use client";
import Link from 'next/link';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';
import { SectionCard } from '../../components/SectionCard';

export default function ToolsPage() {
  const { t, locale } = useLocale();
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedTools = [...toolMetas].sort((a, b) => (locale === 'ko' ? a.nameKo : a.nameEn).localeCompare(locale === 'ko' ? b.nameKo : b.nameEn, collator));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{t('tools.title')}</h1>
      <p className="mt-2 text-slate-600">{t('tools.description')}</p>
      <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{locale === 'ko' ? '신규 워크플로 도구' : 'New Workflow Tool'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Genome Metadata Cleaner</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          {locale === 'ko'
            ? 'CSV, TSV, XLSX, FASTA 헤더를 업로드하고, 스키마 문제를 탐지한 뒤, 필드별 정규화 규칙을 선택하고, diff를 미리 본 다음, 정리된 파일과 변경 로그를 내보낼 수 있습니다.'
            : 'Upload CSV, TSV, XLSX, or FASTA headers, detect schema issues, choose normalization rules per field, preview diffs, and export a cleaned file with a change log.'}
        </p>
        <Link className="mt-4 inline-block rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white" href="/genome-metadata-cleaner">
          {locale === 'ko' ? 'Genome Metadata Cleaner 열기' : 'Open Genome Metadata Cleaner'}
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sortedTools.map((tool) => {
          const title = locale === 'ko' ? tool.nameKo : tool.nameEn;
          const desc = locale === 'ko' ? tool.shortKo : tool.shortEn;
          return (
            <SectionCard key={tool.id} title={title}>
              <p className="text-sm text-slate-600">{desc}</p>
              <Link className="mt-3 inline-block text-sm text-indigo-700 underline" href={`/tools/${tool.slug}`}>
                {t('global.open')}
              </Link>
            </SectionCard>
          );
        })}
      </div>
    </section>
  );
}
