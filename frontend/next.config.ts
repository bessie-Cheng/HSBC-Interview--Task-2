/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/valuation/:path*',
        destination: 'http://localhost:8001/api/valuation/:path*', // 确保端口正确
      },
      {
        source: '/api/market/:path*',
        destination: 'http://localhost:8080/api/market/:path*',
      },
    ];
  },
};

module.exports = nextConfig;