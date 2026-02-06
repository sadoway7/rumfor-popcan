// vite.config.ts
import { defineConfig } from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/vite/dist/node/index.js";
import react from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/@vitejs/plugin-react-swc/index.js";
import { resolve } from "path";
import UnoCSS from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/unocss/dist/vite.mjs";
import checker from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/vite-plugin-checker/dist/esm/main.js";
import compression from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/vite-plugin-compression/dist/index.mjs";
import { sentryVitePlugin } from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import AutoImport from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/unplugin-auto-import/dist/vite.mjs";
import Inspect from "file:///Users/sadoway/Documents/VS%20Code/rumfor%202026/rumfor-vpopcan/rumfor-market-tracker/node_modules/vite-plugin-inspect/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/sadoway/Documents/VS Code/rumfor 2026/rumfor-vpopcan/rumfor-market-tracker";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    checker({
      typescript: true,
      overlay: { initialIsOpen: false }
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br"
    }),
    // Auto-import React and React Router hooks
    AutoImport({
      imports: [
        "react",
        "react-router-dom"
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: { enabled: true }
    }),
    // Inspect plugin transformations (visit /__inspect/ in dev)
    Inspect(),
    // Sentry error monitoring and release tracking
    ...process.env.VITE_SENTRY_DSN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          name: process.env.npm_package_version,
          create: true,
          finalize: true
        },
        sourcemaps: {
          assets: "./dist/**"
        },
        bundleSizeOptimizations: {
          excludeDebugStatements: true,
          excludeReplayIframe: true,
          excludeReplayShadowDom: true,
          excludeReplayWorker: true
        }
      })
    ] : []
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "@/components": resolve(__vite_injected_original_dirname, "./src/components"),
      "@/features": resolve(__vite_injected_original_dirname, "./src/features"),
      "@/pages": resolve(__vite_injected_original_dirname, "./src/pages"),
      "@/hooks": resolve(__vite_injected_original_dirname, "./src/hooks"),
      "@/utils": resolve(__vite_injected_original_dirname, "./src/utils"),
      "@/types": resolve(__vite_injected_original_dirname, "./src/types"),
      "@/config": resolve(__vite_injected_original_dirname, "./src/config"),
      "@/lib": resolve(__vite_injected_original_dirname, "./src/lib"),
      "@/layouts": resolve(__vite_injected_original_dirname, "./src/layouts"),
      "@/assets": resolve(__vite_injected_original_dirname, "./src/assets")
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: process.env.NODE_ENV === "production" ? false : true,
    minify: "esbuild",
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: void 0
        // Disable chunking to put everything in main bundle
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2Fkb3dheS9Eb2N1bWVudHMvVlMgQ29kZS9ydW1mb3IgMjAyNi9ydW1mb3ItdnBvcGNhbi9ydW1mb3ItbWFya2V0LXRyYWNrZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zYWRvd2F5L0RvY3VtZW50cy9WUyBDb2RlL3J1bWZvciAyMDI2L3J1bWZvci12cG9wY2FuL3J1bWZvci1tYXJrZXQtdHJhY2tlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc2Fkb3dheS9Eb2N1bWVudHMvVlMlMjBDb2RlL3J1bWZvciUyMDIwMjYvcnVtZm9yLXZwb3BjYW4vcnVtZm9yLW1hcmtldC10cmFja2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJ1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gJ0BzZW50cnkvdml0ZS1wbHVnaW4nXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IEluc3BlY3QgZnJvbSAndml0ZS1wbHVnaW4taW5zcGVjdCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFVub0NTUygpLFxuICAgIGNoZWNrZXIoe1xuICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcbiAgICAgIG92ZXJsYXk6IHsgaW5pdGlhbElzT3BlbjogZmFsc2UgfVxuICAgIH0pLFxuICAgIGNvbXByZXNzaW9uKHtcbiAgICAgIGFsZ29yaXRobTogJ2d6aXAnLFxuICAgICAgZXh0OiAnLmd6JyxcbiAgICB9KSxcbiAgICBjb21wcmVzc2lvbih7XG4gICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXG4gICAgICBleHQ6ICcuYnInLFxuICAgIH0pLFxuXG4gICAgLy8gQXV0by1pbXBvcnQgUmVhY3QgYW5kIFJlYWN0IFJvdXRlciBob29rc1xuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogW1xuICAgICAgICAncmVhY3QnLFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICBdLFxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcbiAgICAgIGVzbGludHJjOiB7IGVuYWJsZWQ6IHRydWUgfSxcbiAgICB9KSxcblxuICAgIC8vIEluc3BlY3QgcGx1Z2luIHRyYW5zZm9ybWF0aW9ucyAodmlzaXQgL19faW5zcGVjdC8gaW4gZGV2KVxuICAgIEluc3BlY3QoKSxcblxuICAgIC8vIFNlbnRyeSBlcnJvciBtb25pdG9yaW5nIGFuZCByZWxlYXNlIHRyYWNraW5nXG4gICAgLi4uKHByb2Nlc3MuZW52LlZJVEVfU0VOVFJZX0RTTiA/IFtcbiAgICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICBvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXG4gICAgICAgIHByb2plY3Q6IHByb2Nlc3MuZW52LlNFTlRSWV9QUk9KRUNULFxuICAgICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgICByZWxlYXNlOiB7XG4gICAgICAgICAgbmFtZTogcHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbixcbiAgICAgICAgICBjcmVhdGU6IHRydWUsXG4gICAgICAgICAgZmluYWxpemU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZW1hcHM6IHtcbiAgICAgICAgICBhc3NldHM6ICcuL2Rpc3QvKionLFxuICAgICAgICB9LFxuICAgICAgICBidW5kbGVTaXplT3B0aW1pemF0aW9uczoge1xuICAgICAgICAgIGV4Y2x1ZGVEZWJ1Z1N0YXRlbWVudHM6IHRydWUsXG4gICAgICAgICAgZXhjbHVkZVJlcGxheUlmcmFtZTogdHJ1ZSxcbiAgICAgICAgICBleGNsdWRlUmVwbGF5U2hhZG93RG9tOiB0cnVlLFxuICAgICAgICAgIGV4Y2x1ZGVSZXBsYXlXb3JrZXI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIF0gOiBbXSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAnQC9jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQC9mZWF0dXJlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvZmVhdHVyZXMnKSxcbiAgICAgICdAL3BhZ2VzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wYWdlcycpLFxuICAgICAgJ0AvaG9va3MnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hvb2tzJyksXG4gICAgICAnQC91dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMnKSxcbiAgICAgICdAL3R5cGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy90eXBlcycpLFxuICAgICAgJ0AvY29uZmlnJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb25maWcnKSxcbiAgICAgICdAL2xpYic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvbGliJyksXG4gICAgICAnQC9sYXlvdXRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9sYXlvdXRzJyksXG4gICAgICAnQC9hc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2Fzc2V0cycpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBvcGVuOiB0cnVlLFxuICAgIGNvcnM6IHRydWUsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBzb3VyY2VtYXA6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyBmYWxzZSA6IHRydWUsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCwgLy8gRGlzYWJsZSBjaHVua2luZyB0byBwdXQgZXZlcnl0aGluZyBpbiBtYWluIGJ1bmRsZVxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5YSxTQUFTLG9CQUFvQjtBQUN0YyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyx3QkFBd0I7QUFDakMsT0FB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
