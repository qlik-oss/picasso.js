global.navigator = {};

module.exports = {
  mocks: [],
  coverage: true,
  src: ['packages/**/src/*/.{js}', '!packages/studio'],
  nyc: {
    reportDir: 'coverage/unit',
  },
};
