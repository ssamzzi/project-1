interface MarkdownArticleProps {
  title: string;
  markdown: string;
}

function renderBlock(line: string, key: string) {
  if (line.startsWith('- ')) {
    return { type: 'li' as const, value: line.slice(2), key };
  }

  const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
  if (orderedMatch) {
    return { type: 'oli' as const, value: orderedMatch[1], key };
  }

  return { type: 'p' as const, value: line, key };
}

export function MarkdownArticle({ title, markdown }: MarkdownArticleProps) {
  const sections = markdown
    .split('\n## ')
    .map((chunk, index) => {
      const normalized = index === 0 ? chunk.replace(/^# /, '') : chunk;
      const [heading, ...rest] = normalized.split('\n');
      const lines = rest.map((line) => line.trim()).filter(Boolean);
      return {
        heading: index === 0 ? title : heading.trim(),
        lines: index === 0 ? lines : lines,
      };
    })
    .filter((section) => section.lines.length > 0);

  return (
    <article className="space-y-6">
      {sections.map((section, sectionIndex) => {
        const blocks = section.lines.map((line, lineIndex) => renderBlock(line, `${sectionIndex}-${lineIndex}`));
        const unordered = blocks.filter((block) => block.type === 'li');
        const ordered = blocks.filter((block) => block.type === 'oli');
        const paragraphs = blocks.filter((block) => block.type === 'p');

        return (
          <section key={`${section.heading}-${sectionIndex}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {sectionIndex > 0 ? <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2> : null}
            {paragraphs.length > 0 ? (
              <div className="space-y-3 text-sm leading-7 text-slate-700">
                {paragraphs.map((block) => (
                  <p key={block.key}>{block.value}</p>
                ))}
              </div>
            ) : null}
            {unordered.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                {unordered.map((block) => (
                  <li key={block.key}>{block.value}</li>
                ))}
              </ul>
            ) : null}
            {ordered.length > 0 ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
                {ordered.map((block) => (
                  <li key={block.key}>{block.value}</li>
                ))}
              </ol>
            ) : null}
          </section>
        );
      })}
    </article>
  );
}
