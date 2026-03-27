import type { MetadataRoute } from 'next';
import { exampleMetas } from '../lib/data/examples';
import { guideMetas } from '../lib/data/guides';
import { toolMetas } from '../lib/data/tools';
import { workflowMetas } from '../lib/data/workflows';
import { SITE_URL } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/tools', '/examples', '/guides', '/workflows', '/genome-metadata-cleaner', '/about', '/privacy', '/terms', '/editorial', '/search'];
  const staticEntries = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const toolEntries = toolMetas.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const exampleEntries = exampleMetas.map((example) => ({
    url: `${SITE_URL}/examples/${example.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const guideEntries = guideMetas.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const workflowEntries = workflowMetas.map((workflow) => ({
    url: `${SITE_URL}/workflows/${workflow.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...toolEntries, ...exampleEntries, ...guideEntries, ...workflowEntries];
}
