module.exports = {
  presets: [
    '@babel/preset-flow',
    ['@babel/preset-env', {
      targets: { node: 'current' },
      ignoreBrowserslistConfig: true,
    }],
  ],
  ignore: ['node_modules'],
};
