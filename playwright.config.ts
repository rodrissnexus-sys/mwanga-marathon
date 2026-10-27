import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a production build and the real Supabase
// project from .env.local. Test accounts and rows are created and removed by
// tests/e2e/global-setup.ts / global-teardown.ts.
//   npm run build && npm run test:e2e
//   E2E_BASE_URL=https://<preview>.vercel.app npm run test:e2e

const PORT = Number(process.env.E2E_PORT ?? 3100);
// Set E2E_BASE_URL to test a deployed site (e.g. a Vercel preview) instead.
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    // Use a locally installed Chromium if Playwright's own browser isn't downloaded.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
