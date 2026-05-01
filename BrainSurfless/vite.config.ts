import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.ts',
        '.web.tsx',
        '.web.js',
        '.web.jsx',
        '.mjs',
        '.js',
        '.ts',
        '.tsx',
        '.jsx',
        '.json',
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^react-native$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/react-native-web/dist/index.js',
        ),
      },
      {
        find: /^react-native-svg$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/react-native-svg/lib/module/ReactNativeSVG.web.js',
        ),
      },
      {
        // Prevent accidental resolution of RN codegen native helper (Flow/TS syntax)
        find: 'react-native/Libraries/Utilities/codegenNativeComponent',
        replacement: path.resolve(__dirname, 'web/shims/codegenNativeComponent.js'),
      },
    ],
    extensions: [
      '.web.ts',
      '.web.tsx',
      '.web.js',
      '.web.jsx',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ],
  },
  define: {
    // RN のグローバルフラグを Web でも使えるように
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    // Polyfill for react-native's Animated and other modules that reference global
    global: 'globalThis',
  },
  root: path.resolve(__dirname, 'web'),
  publicDir: path.resolve(__dirname, 'web/public'),
  build: {
    outDir: path.resolve(__dirname, 'dist-web'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname)],
    },
  },
});
