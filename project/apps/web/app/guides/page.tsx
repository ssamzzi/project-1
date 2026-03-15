import Link from 'next/link';
import { guideMetas } from '../../lib/data/guides';

export default function GuidesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Reference Guides</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Bench guides that explain the numbers behind each experiment</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          These pages add context that a calculator alone cannot provide: when to use a method, common interpretation mistakes,
          practical caveats, and what to check before you trust the output.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {guideMetas.map((guide) => (
          <article key={guide.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{guide.titleEn}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{guide.shortEn}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Each guide is written to reduce setup mistakes, highlight edge cases, and make the linked tools easier to use in a
              real lab workflow.
            </p>
            <Link href={`/guides/${guide.slug}`} className="mt-4 inline-flex text-sm font-medium text-sky-700 underline">
              Open guide
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
