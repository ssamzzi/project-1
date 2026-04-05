import Link from 'next/link';
import { workflowMetas } from '../../lib/data/workflows';

export default function WorkflowsPage() {
  const workflowCount = workflowMetas.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Workflow Notes</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Step-by-step workflows for everyday lab prep</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          BioLT is not only a calculator directory. These workflow pages connect several tools into a single experiment sequence so
          users can understand where each calculation fits in practice.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The workflow library currently includes {workflowCount} practical sequences covering quantification, PCR setup, cloning,
          qPCR standards, cell counting, and plating decisions.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflowMetas.map((workflow) => (
          <article key={workflow.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{workflow.titleEn}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{workflow.shortEn}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Linked tools</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.tools.join(', ')}</p>
            <Link href={`/workflows/${workflow.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
              Open workflow
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
