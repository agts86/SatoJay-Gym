import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html", "lcov"],
      reportsDirectory: "coverage/unit",
      include: ["src/shared/**/*.ts", "src/server/services/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
});
