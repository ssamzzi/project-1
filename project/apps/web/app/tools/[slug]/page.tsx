import { notFound } from 'next/navigation';
import { toolMetas } from '../../../lib/data/tools';
import { ToolCalculatorClient } from '../../../components/tools/ToolCalculatorClient';

export async function generateStaticParams() {
  return toolMetas.map((t) => ({ slug: t.slug }));
}

export default function ToolRoutePage({ params }: { params: { slug: string } }) {
  const allowed = toolMetas.some((tool) => tool.slug === params.slug);
  if (!allowed) {
    notFound();
  }
  return <ToolCalculatorClient slug={params.slug} />;
}
