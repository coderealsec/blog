/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn03.ciceksepeti.com',
      'images.unsplash.com',
      'picsum.photos', 
      'via.placeholder.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
};

export default nextConfig;
