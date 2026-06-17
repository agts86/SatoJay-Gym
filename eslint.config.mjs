import js from "@eslint/js";
import next from "eslint-config-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**", "next-env.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  {
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
