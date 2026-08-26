import qlik from '@qlik/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [qlik.recommended, qlik.vitest],
  ignorePatterns: [
    '**/dist/**',
    '**/test/unit/coverage/**',
    '**/test/component/coverage/**',
    'docs/node_modules/**',
    'test/config/*.js',
  ],
  rules: {
    'no-bitwise': 'off',
    'no-continue': 'off',
    'no-multi-assign': 'off',
    'no-param-reassign': 'off',
    'no-redeclare': 'off',
    'no-restricted-globals': 'off',
    'no-return-assign': 'off',
    'no-useless-call': 'off',
    'one-var': 'off',
    'prefer-const': 'off',
    'prefer-object-has-own': 'off',
    'default-param-last': 'warn',
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/test/**/*.js'],
      rules: {
        'no-unused-expressions': 'off',
        'no-loss-of-precision': 'off',
      },
    },
  ],
});
