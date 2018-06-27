module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { browsers: ['last 2 chrome versions'] } }]
      ]
    }
  }
};
