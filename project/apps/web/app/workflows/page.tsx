"use client";

import Link from 'next/link';
import { useLocale } from '../../lib/context/LocaleContext';
import { toolMetas } from '../../lib/data/tools';
import { workflowMetas } from '../../lib/data/workflows';

export default function WorkflowsPage() {
  const { locale } = useLocale();
  const workflowCount = workflowMetas.length;
  const isKo = locale === 'ko';

  function toolLabel(toolId: string) {
    const tool = toolMetas.find((item) => item.id === toolId);
    if (!tool) return toolId;
    return isKo ? tool.nameKo : tool.nameEn;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{isKo ? '워크플로 노트' : 'Workflow Notes'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isKo ? '일상적인 실험 준비를 위한 단계별 워크플로' : 'Step-by-step workflows for everyday lab prep'}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          {isKo
            ? 'BioLT는 계산기 목록만 제공하는 사이트가 아닙니다. 워크플로 페이지는 여러 도구를 하나의 실험 순서로 연결해 각 계산이 실제 준비 과정에서 어디에 쓰이는지 보여 줍니다.'
            : 'BioLT is not only a calculator directory. These workflow pages connect several tools into a single experiment sequence so users can understand where each calculation fits in practice.'}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isKo
            ? `현재 워크플로 라이브러리에는 정량, PCR 세팅, 클로닝, qPCR 표준곡선, 세포 계수, plating 판단을 다루는 실전 흐름 ${workflowCount}개가 있습니다.`
            : `The workflow library currently includes ${workflowCount} practical sequences covering quantification, PCR setup, cloning, qPCR standards, cell counting, and plating decisions.`}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflowMetas.map((workflow) => (
          <article key={workflow.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{isKo ? workflow.titleKo : workflow.titleEn}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{isKo ? workflow.shortKo : workflow.shortEn}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isKo ? '연결된 도구' : 'Linked tools'}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.tools.map(toolLabel).join(', ')}</p>
            <Link href={`/workflows/${workflow.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
              {isKo ? '워크플로 열기' : 'Open workflow'}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
