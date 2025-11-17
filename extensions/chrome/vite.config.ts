import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy manifest.json to dist
        if (existsSync('manifest.json')) {
          copyFileSync('manifest.json', 'dist/manifest.json');
        }
        // Copy provider file to dist
        if (existsSync('src/provider/DumpSackProvider.ts')) {
          copyFileSync('src/provider/DumpSackProvider.ts', 'dist/provider.js');
        }
        // Copy UI files
        if (existsSync('src/ui/approval.html')) {
          copyFileSync('src/ui/approval.html', 'dist/approval.html');
        }
        if (existsSync('src/ui/approval.js')) {
          copyFileSync('src/ui/approval.js', 'dist/approval.js');
        }
        // Copy assets folder
        if (existsSync('public/assets')) {
          cpSync('public/assets', 'dist/assets', { recursive: true });
        }
      }
    }
  ],
  resolve: {
    alias: {
      // Monorepo packages
      '@dumpsack/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/index.ts'),
      '@dumpsack/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/index.ts'),
      '@dumpsack/shared-types': path.resolve(__dirname, '../../packages/shared-types/index.ts'),
      // Fix for deep imports in crypto libraries
      '@scure/bip39/wordlists/english': '@scure/bip39/wordlists/english.js',
      '@noble/curves/ed25519': '@noble/curves/ed25519.js',
      '@noble/hashes/sha256': '@noble/hashes/sha256.js',
      '@noble/hashes/sha512': '@noble/hashes/sha512.js',
      '@noble/hashes/ripemd160': '@noble/hashes/ripemd160.js',
    }
  },
  optimizeDeps: {
    include: ['@solana/web3.js', 'zustand'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        popup: 'popup.html',
        options: 'options.html',
        approval: 'approval.html',
        background: 'src/background.ts',
        content: 'src/content.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name + '.js';
        }
      }
    }
  }
});