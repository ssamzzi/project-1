import Link from 'next/link';
import { relatedToolMap, toolMetas } from '../lib/data/tools';

export function RelatedTools({ id, locale }: { id: string; locale: 'en' | 'ko' }) {
  const related = relatedToolMap[id] ?? [];
  if (!related.length) return null;
  const collator = locale === 'ko' ? 'ko-KR' : 'en-US';
  const sortedRelated = [...related].sort((aSlug, bSlug) => {
    const aTool = toolMetas.find((tool) => tool.slug === aSlug);
    const bTool = toolMetas.find((tool) => tool.slug === bSlug);
    const aLabel = aTool ? (locale === 'ko' ? aTool.nameKo : aTool.nameEn) : aSlug;
    const bLabel = bTool ? (locale === 'ko' ? bTool.nameKo : bTool.nameEn) : bSlug;
    return aLabel.localeCompare(bLabel, collator);
  });

  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h3 className="mb-2 text-sm font-medium">Use these tools</h3>
      <ul className="space-y-2 text-sm">
        {sortedRelated.map((slug) => {
          const tool = toolMetas.find((t) => t.slug === slug);
          if (!tool) return null;
          const label = locale === 'ko' ? tool.nameKo : tool.nameEn;
          return (
            <li key={slug}>
              <Link className="text-indigo-700 underline" href={`/tools/${slug}`}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
