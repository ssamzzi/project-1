import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkdownArticle } from '../../../components/MarkdownArticle';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';
import { toolMetas } from '../../../lib/data/tools';
import { workflowBySlug, workflowMetas } from '../../../lib/data/workflows';

export async function generateStaticParams() {
  return workflowMetas.map((workflow) => ({ slug: workflow.slug }));
}

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const workflow = workflowBySlug(params.slug);
  if (!workflow) {
    notFound();
  }

  const markdown = await readMarkdown('workflows', params.slug);
  const { title, body } = splitMarkdownSections(markdown);
  const linkedTools = workflow.tools.reduce<(typeof toolMetas)[number][]>((items, toolId) => {
    const tool = toolMetas.find((entry) => entry.id === toolId);
    if (tool) {
      items.push(tool);
    }
    return items;
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Workflow</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title || workflow.titleEn}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{workflow.shortEn}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <MarkdownArticle title={title || workflow.titleEn} markdown={body} />
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Use these tools</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {linkedTools.map((tool) => (
                <li key={tool.id}>
                  <Link href={`/tools/${tool.slug}`} className="font-medium text-sky-700 underline">
                    {tool.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Operational note</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The purpose of these workflow pages is to connect calculations to a full experimental sequence, which helps readers
              understand intent, sequencing, and validation checks.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/workflows" className="font-medium text-sky-700 underline">
                All workflows
              </Link>
              <Link href="/tools" className="font-medium text-sky-700 underline">
                Tool library
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
