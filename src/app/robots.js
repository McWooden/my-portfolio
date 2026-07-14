export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://halohuddin.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/logout', '/me', '/new-story', '/stories'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
