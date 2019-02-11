import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

export default {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: ['./src/index.js'],
    vendor: ['jquery', 'jquery-ujs'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].js',
    publicPath: '/public/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          // 'sass-loader',
          {
            loader: 'postcss-loader',
            options: { plugins: [autoprefixer] },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
  devtool: 'sourcemap',
};
