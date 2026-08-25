import type { OxlintConfig } from 'oxlint';

export default {
  extends: ['@qlik/oxlint-config/recommended'],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '**/dist/*',
    '**/test/unit/coverage/*',
    '**/test/component/coverage/*',
    'docs/node_modules/*',
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
} satisfies OxlintConfig;
