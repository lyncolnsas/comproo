import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Next.js build outputs
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Hotspot templates (MikroTik static HTML/JS - not our TS source)
    "hotspot/**",
    "1260516031758-hotspot/**",
    // Scratch and utility scripts (not production code)
    "scratch/**",
    "scripts/**",
    // Previous AI session helper scripts
    ".gemini/**",
    // Root-level patch/setup scripts
    "patch_*.js",
    "create_*.js",
    "reorganize_*.js",
    "check_mk.ts",
    // Prisma generated client
    "prisma/generated/**",
  ]),
  {
    // ─────────────────────────────────────────────────────────────────────
    // BACKEND OVERRIDES
    // Baileys (WhatsApp) uses `use` prefix (useMultiFileAuthState) but is NOT
    // a React Hook. Disable the rule for all server-side code.
    // Relax `any` from error → warning for legacy MikroTik/Baileys integrations.
    // ─────────────────────────────────────────────────────────────────────
    files: ["src/services/**", "src/app/api/**", "src/lib/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // ─────────────────────────────────────────────────────────────────────
    // FRONTEND OVERRIDES
    // Existing pages and components have widespread use of `any` from legacy
    // data-fetching (MikroTik responses, dynamic config objects).
    // Downgrade from error → warning to allow iterative clean-up without
    // breaking the build. The `react-compiler` setState-in-effect rule is
    // experimental and generates false positives for intentional init patterns.
    // ─────────────────────────────────────────────────────────────────────
    files: ["src/app/**/*.tsx", "src/app/**/*.ts", "src/components/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
