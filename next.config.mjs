/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any custom configuration here if needed
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
