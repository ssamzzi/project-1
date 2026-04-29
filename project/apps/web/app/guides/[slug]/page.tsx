import { notFound } from 'next/navigation';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';
import { guideBySlug, guideMetas } from '../../../lib/data/guides';
import { GuideDetailClient } from './GuideDetailClient';

export async function generateStaticParams() {
  return guideMetas.map((guide) => ({ slug: guide.slug }));
}

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = guideBySlug(params.slug);
  if (!guide) {
    notFound();
  }

  const markdown = await readMarkdown('guides', params.slug);
  const { body } = splitMarkdownSections(markdown);

  return <GuideDetailClient guide={guide} markdown={body} />;
}
