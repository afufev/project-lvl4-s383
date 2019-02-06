module.exports = {
  presets: [
    '@babel/preset-flow',
    ['@babel/preset-env',
      {
        targets: { node: 'current' },
        ignoreBrowserslistConfig: true,
      }],
  ],
  plugins: ['@babel/plugin-proposal-throw-expressions', '@babel/plugin-proposal-class-properties'],
  exclude: ['/node_modules/'],
};
