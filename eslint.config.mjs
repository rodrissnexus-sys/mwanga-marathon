import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Code ported 1:1 from the Vite app. These React Compiler rules flag
  // pre-existing patterns (fetch-then-setState in effects, helpers declared
  // after use) that work today; they're reported as warnings until the data
  // layer moves to Server Components in Phase 5.
  {
    files: ["src/views/**", "src/components/**", "src/contexts/**", "src/layouts/**"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  {
    files: ["src/views/dashboard/**"],
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
