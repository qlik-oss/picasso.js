const esModules = ['preact', 'd3.*'].join('|');

module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/__tests__/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [`<rootDir>//node_modules/(?!(${esModules})/)`],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/junit',
      },
    ],
  ],
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: './reports/coverage',
};
