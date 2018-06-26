module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ],
      plugins: [
        [
          'istanbul',
          {
            exclude: [
              '**/test/**',
              '**/dist/**'
            ]
          }
        ]
      ]
    }
  }
};
