export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://huddin.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/keystatic/', '/login', '/logout', '/me', '/new-story', '/stories'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
