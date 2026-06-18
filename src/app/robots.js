export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://huddin.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/keystatic/'], // Hide API routes and CMS editor from crawlers
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
