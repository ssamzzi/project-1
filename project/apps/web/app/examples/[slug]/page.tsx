import { notFound } from 'next/navigation';
import { exampleBySlug, exampleMetas } from '../../../lib/data/examples';
import { ExampleDetailClient } from './ExampleDetailClient';

export async function generateStaticParams() {
  return exampleMetas.map((example) => ({ slug: example.slug }));
}

export default function ExampleDetailPage({ params }: { params: { slug: string } }) {
  const example = exampleBySlug(params.slug);
  if (!example) {
    notFound();
  }

  return <ExampleDetailClient example={example} />;
}
