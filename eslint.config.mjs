import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import regexp from 'eslint-plugin-regexp';
import e18e from '@e18e/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import storybook from 'eslint-plugin-storybook';
import oxlint from 'eslint-plugin-oxlint';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.d.ts', '**/*.d.cts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      sonarjs,
      regexp,
      '@e18e': e18e,
      '@stylistic': stylistic,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // SonarJS (Quality & Code Smells, cognitive-complexity adjusted to 20 per user request)
      'sonarjs/cognitive-complexity': ['warn', 20],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-immediate-return': 'warn',

      // RegExp security & ReDoS prevention
      'regexp/no-super-linear-backtracking': 'error',
      'regexp/optimal-quantifier-concatenation': 'warn',
      'regexp/no-useless-assertions': 'warn',
      'regexp/prefer-character-class': 'warn',

      // E18e Modern JS & Performance
      '@e18e/prefer-object-has-own': 'warn',
      '@e18e/prefer-array-at': 'warn',
      '@e18e/prefer-spread-syntax': 'warn',
      '@e18e/prefer-flatmap-over-map-flat': 'warn',
      '@e18e/no-spread-in-reduce': 'warn',
      '@e18e/prefer-timer-args': 'warn',

      // Stylistic consistency
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      'testing-library/no-node-access': 'warn',
      'testing-library/prefer-screen-queries': 'warn',
      'testing-library/await-async-queries': 'error',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    plugins: {
      storybook,
    },
    rules: {
      'storybook/default-exports': 'error',
      'storybook/hierarchy-separator': 'warn',
    },
  },
  ...oxlint.configs['flat/recommended'],
];
