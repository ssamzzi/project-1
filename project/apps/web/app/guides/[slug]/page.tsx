import { notFound } from 'next/navigation';
import { guideMetas, guideBySlug } from '../../../lib/data/guides';
import { readMarkdown, splitMarkdownSections } from '../../../lib/content/reader';

export async function generateStaticParams() {
  return guideMetas.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guideBySlug(params.slug);
  if (!guide) {
    notFound();
  }

  const md = await readMarkdown('guides', params.slug);
  const parsed = splitMarkdownSections(md);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{parsed.title || guide.titleEn}</h1>
      <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-slate-700 whitespace-pre-line leading-6 break-words">
        {parsed.body}
      </div>
      <section className="mt-6 rounded-lg border bg-slate-50 p-4">
        <h2 className="text-sm font-semibold">Requirements / 요구사항</h2>
        <p className="mt-1 text-sm text-slate-700">{guide.slug}</p>
      </section>
    </section>
  );
}
