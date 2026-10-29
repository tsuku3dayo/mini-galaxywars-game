import { defineConfig, devices } from '@playwright/test';

// E2E の端末（MGW-TD-0007 §7、MGW-TST-0001 §1.1）
const BASE_URL = 'http://localhost:4173/mini-galaxywars-game/';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'pc-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'iphone11-webkit', use: { ...devices['iPhone 11'] } },
    // 小さい方の確認は、MGW-GUI-0001 §1 の基準と同じ iPhone SE（第 3 世代、375 × 667）（仕様書 v1.8）
    { name: 'iphonese-webkit', use: { ...devices['iPhone SE (3rd gen)'] } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
