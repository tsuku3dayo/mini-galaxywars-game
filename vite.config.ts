import { defineConfig } from 'vitest/config';

// 公開 URL は https://tsuku3dayo.github.io/mini-galaxywars-game/（MGW-ADR-0003）
export default defineConfig({
  base: '/mini-galaxywars-game/',
  build: {
    target: 'es2022',
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
