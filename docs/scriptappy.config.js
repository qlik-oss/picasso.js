module.exports = {
  spec: {
    validate: true
  },
  parse: {
    rules: {
      'no-unknown-types': 1,
      'no-missing-types': 2,
      'no-multi-return': 2,
      'no-unknown-stability': 2,
      'no-duplicate-references': 2,
      'no-untreated-kinds': 2,
      'no-default-exports-wo-name': 2,
      'no-unknown-promise': 2
    }
  }
};
