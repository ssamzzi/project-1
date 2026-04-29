import { notFound } from 'next/navigation';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';
import { workflowBySlug, workflowMetas } from '../../../lib/data/workflows';
import { WorkflowDetailClient } from './WorkflowDetailClient';

export async function generateStaticParams() {
  return workflowMetas.map((workflow) => ({ slug: workflow.slug }));
}

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const workflow = workflowBySlug(params.slug);
  if (!workflow) {
    notFound();
  }

  const markdown = await readMarkdown('workflows', params.slug);
  const { body } = splitMarkdownSections(markdown);

  return <WorkflowDetailClient workflow={workflow} markdown={body} />;
}
