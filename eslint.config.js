import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// 層の決まり（MGW-ADR-0001、MGW-TD-0001 §4）
const CORE_FORBIDDEN_GLOBALS = ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'performance', 'requestAnimationFrame', 'Date'].map(
  (name) => ({ name, message: 'src/core は DOM・時刻に触れない（MGW-ADR-0001）' }),
);

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'prototype/', 'playwright-report/', 'test-results/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: { globals: globals.browser, sourceType: 'script' },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', ...CORE_FORBIDDEN_GLOBALS],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'src/core は乱数を使わない（MGW-ADR-0001）' }],
      'no-restricted-imports': ['error', { patterns: [{ group: ['../*'], message: 'src/core は src/core の外を import しない（MGW-ADR-0001）' }] }],
    },
  },
  {
    files: ['src/render/**/*.ts', 'src/audio/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['../app/*', '../storage/*'], message: 'render・audio は app・storage を import しない（MGW-ADR-0001）' }] }],
    },
  },
  {
    files: ['src/storage/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['../core/*', '../render/*', '../audio/*', '../app/*'], message: 'storage はほかの層を import しない（MGW-ADR-0001）' }] }],
    },
  },
);
