import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0, // the AGENT does the retrying/healing, not Playwright
  reporter: [
    // in GitHub Actions, also show each failure as an annotation on the run summary page
    ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test', // Sauce Demo uses data-test="..." on its elements
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // PW_CHANNEL=msedge (or chrome) uses an installed browser instead of Playwright's download
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
    },
  ],
});
