import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkdownArticle } from '../../../components/MarkdownArticle';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';
import { guideBySlug, guideMetas } from '../../../lib/data/guides';

export async function generateStaticParams() {
  return guideMetas.map((guide) => ({ slug: guide.slug }));
}

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = guideBySlug(params.slug);
  if (!guide) {
    notFound();
  }

  const markdown = await readMarkdown('guides', params.slug);
  const { title, body } = splitMarkdownSections(markdown);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Guide</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title || guide.titleEn}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{guide.shortEn}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/guides" className="font-medium text-sky-700 underline">
            All guides
          </Link>
          <Link href="/tools" className="font-medium text-sky-700 underline">
            Lab calculators
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <MarkdownArticle title={title || guide.titleEn} markdown={body} />
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Why this page exists</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              AdSense and Search reviewers both look for pages with original value. This guide is intended to provide explanation,
              not just a route to a tool.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Before applying the advice</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Check your lab SOP and kit manual.</li>
              <li>Record units, dilution assumptions, and controls.</li>
              <li>Repeat calculations when sample quality or instrument conditions change.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
