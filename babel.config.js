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
  ignore: [
    'node_modules',
    'assets',
    'view',
    'public',
    'test',
    'spec',
    'logs',
    'lib/jasmine_examples',
    'db',
  ],
};
