import Link from 'next/link';
import { exampleMetas } from '../../lib/data/examples';

export default function ExamplesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Worked Examples</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Real experiment setups, not just generic calculators</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          These worked examples show how a researcher would actually use BioLT during PCR planning, cell seeding, cloning, and qPCR interpretation.
          Each page is meant to stand on its own as reference content.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {exampleMetas.map((example) => (
          <article key={example.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{example.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{example.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Best for</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{example.audience}</p>
            <Link href={`/examples/${example.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
              Open example
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
