import { defineConfig } from "vitest/config";

// Convex function tests (convex-test runs the real functions against a mock backend).
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["tests/convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
