module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.base.json',
      './app/tsconfig.json',
      './extensions/chrome/tsconfig.json',
      './packages/*/tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: { es6: true },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'warn',
    'react-native/no-inline-styles': 'off', // using NativeWind
    'import/order': ['warn', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
      groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
    }],
    'import/no-unresolved': 'error',
  },
  ignorePatterns: ['**/dist/**', '**/build/**', '**/.expo/**', '**/node_modules/**'],
};