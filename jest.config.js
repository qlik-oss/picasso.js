module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/__tests__/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!preact/.*)'],
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: './coverage',
};
