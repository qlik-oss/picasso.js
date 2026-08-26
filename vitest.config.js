const babel = require('@babel/core');

module.exports = {
  plugins: [
    {
      name: 'babel-jsx-in-js',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.includes('/packages/') || !id.endsWith('.js')) {
          return null;
        }

        const result = await babel.transformAsync(code, {
          babelrc: false,
          configFile: false,
          filename: id,
          parserOpts: { plugins: ['jsx'] },
          plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic', pragma: 'h' }]],
        });

        return result?.code ? { code: result.code, map: result.map } : null;
      },
    },
  ],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    globals: true,
    include: ['**/src/**/__tests__/*.spec.js'],
    setupFiles: ['./vitest.setup.js'],
    reporters: ['default', 'junit'],
    outputFile: './reports/junit/results.xml',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: './reports/coverage',
    },
  },
};
