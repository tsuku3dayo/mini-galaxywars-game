import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// 公開 URL は https://tsuku3dayo.github.io/mini-galaxywars-game/（MGW-ADR-0003）
const BASE = '/mini-galaxywars-game/';

export default defineConfig({
  base: BASE,
  // 一時的な診断の表示（src/app/diag.ts）で、どの版が動いているかを見分ける
  define: {
    __BUILD_ID__: JSON.stringify(`${(process.env.GITHUB_SHA ?? 'local').slice(0, 7)} ${new Date().toISOString().slice(5, 16)}Z`),
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
        name: 'ギャラクシーウォーズミニ',
        short_name: 'GWミニ',
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
