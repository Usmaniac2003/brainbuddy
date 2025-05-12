/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '**',
      },
    ],
  },
  webpack(config) {
    // 1) Prevent Webpack from trying to polyfill or bundle the 'canvas' package
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
    };

    // 2) Alias Konva's Node entrypoint to the browser build
    // config.resolve.alias = {
    //   ...(config.resolve.alias || {}),
    //   // Whenever code tries to import 'konva/lib/index-node.js', use the browser bundle
    //   ['konva/lib/index-node.js']: require.resolve('konva/konva.js'),
    // };

    return config;
  },
};

export default nextConfig;
