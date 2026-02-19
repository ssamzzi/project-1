import fs from 'fs/promises';
import path from 'path';

export async function readMarkdown(subdir: 'guides' | 'workflows', slug: string): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'content', subdir, `${slug}.md`),
    path.join(process.cwd(), 'apps', 'web', 'content', subdir, `${slug}.md`),
  ];

  let data: string | null = null;
  for (const p of candidates) {
    try {
      data = await fs.readFile(p, 'utf8');
      break;
    } catch {
      data = null;
    }
  }

  if (!data) {
    throw new Error(`Markdown file not found for ${slug} in ${subdir}`);
  }
  return data;
}

export function splitMarkdownSections(md: string): { title: string; body: string } {
  const lines = md.split('\n');
  const title = lines.find((l) => l.startsWith('# ')) || '';
  return {
    title: title.replace(/^# /, ''),
    body: lines.filter((line, idx) => idx > 0 || !line.startsWith('# ')).join('\n').trim(),
  };
}
