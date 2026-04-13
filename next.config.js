/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    // Externalize bcrypt and native modules for server-side
    config.externals = [...(config.externals || []), "bcrypt", "@mapbox/node-pre-gyp"];
    return config;
  },
};

module.exports = nextConfig;
