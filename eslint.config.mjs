import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference kits, agent tooling and the vendored ScrollCraft engine:
    // not site source, so their style is not ours to lint.
    "design/**",
    "scrollcraft/**",
    "public/scrollcraft/**",
    ".agents/**",
    ".cursor/**",
    ".claude/**",
    ".codex/**",
  ]),
]);

export default eslintConfig;
