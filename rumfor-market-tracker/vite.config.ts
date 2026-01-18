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
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('@radix-ui')) {
              return 'ui'
            }
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts'
            }
            if (id.includes('date-fns') || id.includes('axios') || id.includes('zod')) {
              return 'utils'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            // Other node_modules go to vendor
            return 'vendor'
          }

          // Feature-based splitting
          if (id.includes('/features/admin/')) {
            return 'admin'
          }
          if (id.includes('/features/markets/')) {
            return 'markets'
          }
          if (id.includes('/features/community/')) {
            return 'community'
          }
          if (id.includes('/features/auth/')) {
            return 'auth'
          }
          if (id.includes('/features/tracking/')) {
            return 'tracking'
          }
          if (id.includes('/pages/')) {
            return 'pages'
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk'
          return `assets/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})