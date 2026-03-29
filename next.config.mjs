import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async redirects() {
    return [
      // QR code on packaging points to /ingredients → send to the anchor on the landing page
      {
        source:      '/ingredients',
        destination: '/en#ingredients',
        permanent:   true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);