import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/company/', '/api/'],
    },
    sitemap: 'https://autours.net/sitemap.xml',
  };
}
