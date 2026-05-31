import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/company/', '/api/', '/profile/'],
    },
    sitemap: 'https://autours.net/sitemap.xml',
  };
}
