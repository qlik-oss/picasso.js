// @ts-check
import tsParser from '@typescript-eslint/parser';
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
    // TSX files need the TypeScript parser with JSX enabled
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  {
    // Component test files and other TS files not in tsconfig need allowDefaultProject
    files: ['**/test/component/**/*.ts', '**/test/component/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'packages/picasso.js/test/component/*.ts',
            'packages/picasso.js/test/component/chart/*.ts',
          ],
        },
      },
    },
  },
  {
    // TypeScript files: disable rules that require strictNullChecks or are
    // incompatible with the incremental JS->TS migration state.
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    rules: {
      // Requires strictNullChecks in tsconfig (disabled for migration)
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      // Patterns common in the original JS codebase
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Naming conventions: original JS used _ prefix for unused/internal identifiers
      '@typescript-eslint/naming-convention': 'off',
      // Function type: original code uses Function broadly
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    files: ['**/*.spec.js', '**/*.spec.ts', '**/test/**/*.js', '**/test/**/*.ts', '**/__tests__/**/*.ts'],
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
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-loss-of-precision': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
