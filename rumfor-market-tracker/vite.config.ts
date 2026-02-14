import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'
import checker from 'vite-plugin-checker'
import compression from 'vite-plugin-compression'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import Inspect from 'vite-plugin-inspect'

// ============================================
// 🚀 RUMFOR MARKET TRACKER - VITE PLUGIN STACK
// ============================================

// Plugin Stack Banner - Shows all plugins on startup
function vitePluginBanner() {
  return {
    name: 'rumfor-banner',
    configureServer(_server) {
      const plugins = [
        {
          name: 'Core',
          items: [
            { name: '@vitejs/plugin-react-swc', desc: '⚡ Fast React builds with SWC (Rust)', url: 'https://github.com/vitejs/vite-plugin-react-swc' },
          ]
        },
      {
        name: 'Styling & UI',
        items: [
          { name: 'UnoCSS', desc: '🎨 Instant atomic CSS engine', url: 'https://unocss.dev/' },
          { name: '@unocss/preset-icons', desc: '🖼️ 200k+ icons from Iconify', url: 'https://unocss.dev/presets/icons' },
          { name: '@unocss/preset-typography', desc: '📝 Beautiful prose content', url: 'https://unocss.dev/presets/typography' },
          { name: '@unocss/preset-web-fonts', desc: '🔤 Google Fonts support', url: 'https://unocss.dev/presets/web-fonts' },
          { name: 'vite-plugin-checker', desc: '🔍 Real-time TypeScript checking', url: 'https://github.com/vitejs/vite-plugin-checker' },
        ]
      },
        {
          name: 'Performance & DX',
          items: [
            { name: 'unplugin-auto-import', desc: '🔄 Auto-import React/Router hooks (46 hooks!)', url: 'https://github.com/unplugin/unplugin-auto-import' },
            { name: 'vite-plugin-inspect', desc: '🔍 Debug plugin transformations', url: 'http://localhost:5173/__inspect/' },
            { name: 'vite-plugin-compression', desc: '📦 Gzip + Brotli compression', url: 'https://github.com/vbenjs/vite-plugin-compression' },
          ]
        },
        {
          name: 'Monitoring',
          items: [
            { name: '@sentry/vite-plugin', desc: '🐛 Error tracking & sourcemaps', url: 'https://docs.sentry.io/platforms/javascript/guides/vite/' },
          ]
        },
        {
          name: 'Testing (NEW!)',
          items: [
            { name: 'Vitest', desc: '🧪 Fast unit testing (5-10x faster than Jest)', url: 'https://vitest.dev/' },
            { name: '@vitest/ui', desc: '🎛️ Visual test runner', url: 'https://vitest.dev/guide/ui.html' },
            { name: '@testing-library/react', desc: '🧩 React component testing', url: 'https://testing-library.com/docs/react-testing-library/' },
          ]
        }
      ]

      // Print banner on startup
      console.log('\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 RUMFOR MARKET TRACKER - VITE PLUGIN STACK')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
      
      plugins.forEach(category => {
        console.log(`📦 ${category.name}`)
        console.log('─'.repeat(50))
        category.items.forEach(item => {
          console.log(`   ${item.desc}`)
          console.log(`   └─ ${item.url}`)
        })
        console.log('')
      })
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📖 Guides: VITE-PLUGINS-GUIDE.md | src/test/README.md')
      console.log('🔍 Inspect: http://localhost:5173/__inspect/')
      console.log('🧪 Tests:  npm run test:ui')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n')
    }
  }
}

// ============================================
// END PLUGIN STACK BANNER
// ============================================

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginBanner(),
    react(),
    UnoCSS(),
    checker({
      typescript: {
        root: resolve(__dirname, './src'),
      },
      overlay: { initialIsOpen: false },
      enableBuild: false,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    // Auto-import React and React Router hooks
    AutoImport({
      imports: [
        'react',
        'react-router-dom',
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: { enabled: true },
    }),

    // Inspect plugin transformations (visit /__inspect/ in dev)
    Inspect(),

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
