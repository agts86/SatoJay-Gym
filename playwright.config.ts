import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const chromeChannel = existsSync("/usr/bin/google-chrome") ? { channel: "chrome" as const } : {};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...chromeChannel },
    },
  ],
});
