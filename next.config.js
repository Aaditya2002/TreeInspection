const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Remove the disable option to enable PWA in development
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING: process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING,
    DYNAMICS_URL: process.env.DYNAMICS_URL,
    DYNAMICS_API_VERSION: process.env.DYNAMICS_API_VERSION,
    DYNAMICS_ENTITY_NAME: process.env.DYNAMICS_ENTITY_NAME,
    DYNAMICS_CLIENT_ID: process.env.DYNAMICS_CLIENT_ID,
    DYNAMICS_CLIENT_SECRET: process.env.DYNAMICS_CLIENT_SECRET,
    DYNAMICS_TENANT_ID: process.env.DYNAMICS_TENANT_ID
  },
}

module.exports = withPWA(nextConfig)

