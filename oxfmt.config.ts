import config from '@qlik/oxfmt-config';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...config,
  // TODO: Consider using the shared @qlik/oxfmt-config default printWidth again.
  // sortImports: true,
  // jsdoc: {
  //   commentLineStrategy: 'keep',
  // },
  ignorePatterns: ['docs/scriptappy.json', 'packages/picasso.js/types/index.d.ts', 'pnpm-lock.yaml'],
});
