const esModules = ['chai'].join('|');

module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/test/integration/**/*.int.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `<rootDir>/node_modules/.pnpm/(?!((${esModules}))@)`,
    `node_modules/(?!.pnpm|${esModules})`,
  ],
};
