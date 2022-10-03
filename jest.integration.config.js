module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/test/integration/**/*.int.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
};
