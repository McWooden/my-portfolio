/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any custom configuration here if needed
  outputFileTracingIncludes: {
    '/api/keystatic/[...params]': ['./src/content/**/*'],
    '/*': ['./src/content/**/*'],
  },
  async redirects() {
    return [
      {
        source: '/new-stories',
        destination: '/new-story',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
