import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'
import checker from 'vite-plugin-checker'
import compression from 'vite-plugin-compression'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    checker({
      typescript: true,
      overlay: { initialIsOpen: false }
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    // Sentry error monitoring and release tracking
    ...(process.env.VITE_SENTRY_DSN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          name: process.env.npm_package_version,
          create: true,
          finalize: true,
        },
        sourcemaps: {
          assets: './dist/**',
        },
        bundleSizeOptimizations: {
          excludeDebugStatements: true,
          excludeReplayIframe: true,
          excludeReplayShadowDom: true,
          excludeReplayWorker: true,
        },
      })
    ] : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/features': resolve(__dirname, './src/features'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/config': resolve(__dirname, './src/config'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/layouts': resolve(__dirname, './src/layouts'),
      '@/assets': resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable chunking to put everything in main bundle
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})