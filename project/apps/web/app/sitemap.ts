import type { MetadataRoute } from 'next';
import { toolMetas } from '../lib/data/tools';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://project-1-2wk.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/tools', '/labops-ai', '/about', '/privacy', '/terms', '/editorial', '/search'];
  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const toolEntries = toolMetas.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...toolEntries];
}
