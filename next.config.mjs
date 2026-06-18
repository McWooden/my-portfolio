/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any custom configuration here if needed
  outputFileTracingIncludes: {
    '/api/keystatic/[...params]': ['./src/content/**/*'],
    '/*': ['./src/content/**/*'],
  },
};

export default nextConfig;
