// @ts-check
import qlik from '@qlik/eslint-config';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default qlik.compose(
  ...qlik.configs.recommended,
  ...qlik.configs.cjs,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
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
      'prettier/prettier': 'error',
      'default-param-last': 'warn',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.spec.js', '**/test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
        chai: 'readonly',
        expect: 'readonly',
        sinon: 'readonly',
        page: 'readonly',
        browser: 'readonly',
        context: 'readonly',
        window: 'writable',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'no-loss-of-precision': 'off',
    },
  }
);
