import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ToolCalculatorClient } from '../../../components/tools/ToolCalculatorClient';
import { toolMetas } from '../../../lib/data/tools';
import { SITE_NAME, SITE_URL } from '../../../lib/site';

export async function generateStaticParams() {
  return toolMetas.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = toolMetas.find((item) => item.slug === params.slug);
  if (!tool) {
    return {
      title: SITE_NAME,
      description: 'Life-science calculators and guides for routine lab planning.',
    };
  }

  const title = `${tool.nameEn} | ${SITE_NAME}`;
  const description = tool.shortEn;
  const canonicalPath = `/tools/${tool.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: 'article',
    },
  };
}

export default function ToolRoutePage({ params }: { params: { slug: string } }) {
  const tool = toolMetas.find((item) => item.slug === params.slug);
  if (!tool) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading calculator...</div>}>
      <ToolCalculatorClient slug={tool.slug} />
    </Suspense>
  );
}
