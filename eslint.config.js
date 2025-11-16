// eslint.config.js (root, flat-config)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import importX from "eslint-plugin-import-x";

// Shared TypeScript globs for project-aware rules
const tsProjects = [
  "./tsconfig.base.json",
  "./app/tsconfig.json",
  "./extensions/chrome/tsconfig.json",
  "./packages/*/tsconfig.json",
];

export default [
  // Ignore builds and vendor dirs everywhere
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/node_modules/**",
      "**/.turbo/**",
    ],
  },

  // Base JS/TS (no type-checking yet)
  js.configs.recommended,

  // TypeScript (with and without type-checking)
  ...tseslint.configs.recommended,
  // Turn on type-aware rules using each package tsconfig
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsProjects,
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-native": reactNative,
      "import-x": importX,
    },
    rules: {
      // TS sanity
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "warn",

      // React/React Native
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "off", // using NativeWind

      // Imports (ESLint 9 compatible)
      "import-x/no-unresolved": "error",
      "import-x/named": "off", // noisy with TS type-only reexports
      "import-x/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
        },
      ],
    },
    settings: {
      react: { version: "detect" },
      "import-x/resolver": {
        typescript: {
          project: tsProjects,
        },
      },
    },
  },

  // Extension (browser/chrome env)
  {
    files: ["extensions/chrome/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        chrome: "readonly",
      },
    },
  },

  // Node configs (scripts, tooling)
  {
    files: ["**/*.cjs", "**/scripts/**/*.ts", "**/*.config.{ts,js}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
      },
    },
  },
];