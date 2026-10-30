import { readFileSync } from 'node:fs';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// 公開 URL は https://tsuku3dayo.github.io/mini-galaxywars-game/（MGW-ADR-0003）
const BASE = '/mini-galaxywars-game/';

// タイトル画面に出す版（仕様書 v1.11、MGW-TD-0004 §2.1）
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    target: 'es2022',
  },
  plugins: [
    // PWA（MGW-ADR-0004、MGW-ADR-0005、MGW-TD-0007 §1）
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/icon-180.png'],
      manifest: {
        name: '銀河戦争ミニ',
        short_name: '銀河戦争ミニ',
        lang: 'ja',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        cacheId: 'mini-galaxywars',
        globPatterns: ['**/*.{html,js,css,png,svg,webmanifest}'],
        // 03 の試作は公開するが、アプリのキャッシュには入れない
        globIgnores: ['prototype/**'],
        navigateFallbackDenylist: [/\/prototype\//],
      },
    }),
  ],
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
