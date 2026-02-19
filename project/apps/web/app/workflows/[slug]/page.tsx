import { notFound } from 'next/navigation';
import Link from 'next/link';
import { workflowMetas, workflowBySlug } from '../../../lib/data/workflows';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';

export async function generateStaticParams() {
  return workflowMetas.map((w) => ({ slug: w.slug }));
}

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const wf = workflowBySlug(params.slug);
  if (!wf) {
    notFound();
  }
  const md = await readMarkdown('workflows', params.slug);
  const { title, body } = splitMarkdownSections(md);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{title || (wf.titleEn)}</h1>
      <p className="mt-3 text-slate-600">Use these tools:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {wf.tools.map((slug) => (
          <Link href={`/tools/${slug}`} key={slug} className="rounded-md border border-indigo-300 px-3 py-1 text-sm text-indigo-700">
            {slug}
          </Link>
        ))}
      </div>
      <article className="mt-6 rounded-lg border bg-white p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
        {body}
      </article>
    </section>
  );
}
