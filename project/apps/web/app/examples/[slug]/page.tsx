import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exampleBySlug, exampleMetas } from '../../../lib/data/examples';

export async function generateStaticParams() {
  return exampleMetas.map((example) => ({ slug: example.slug }));
}

export default function ExampleDetailPage({ params }: { params: { slug: string } }) {
  const example = exampleBySlug(params.slug);
  if (!example) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Worked Example</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{example.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{example.summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={example.toolHref} className="font-medium text-sky-700 underline">
            Open linked calculator
          </Link>
          {example.workflowHref ? (
            <Link href={example.workflowHref} className="font-medium text-sky-700 underline">
              Open related workflow
            </Link>
          ) : null}
          <Link href="/examples" className="font-medium text-sky-700 underline">
            All worked examples
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="space-y-6">
          {example.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
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
            <h2 className="text-lg font-semibold text-slate-900">Why this page exists</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              A worked example gives researchers a concrete starting point and gives reviewers a page with standalone educational value.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Use before the bench</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Confirm the actual stock concentration and units.</li>
              <li>Check whether controls and replicates are included.</li>
              <li>Record the final setup in the lab notebook after calculation.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
