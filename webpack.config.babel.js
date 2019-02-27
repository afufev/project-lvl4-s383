// const webpack = require('webpack');
// const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//
// module.exports = {
//   mode: process.env.NODE_ENV || 'development',
//   entry: {
//     main: ['./src/index.js'],
//   },
//   output: {
//     path: path.join(__dirname, 'public', 'assets'),
//     filename: 'main.js',
//     publicPath: '/public/assets/',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: 'babel-loader',
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
//       },
//     ],
//   },
//   plugins: [
//     new webpack.ProvidePlugin({
//       $: 'jquery',
//       jQuery: 'jquery',
//       'window.jQuery': 'jquery',
//     }),
//     new MiniCssExtractPlugin({
//       filename: 'bundle.css',
//     }),
//   ],
// };
import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import precss from 'precss';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  mode: process.env.NODE_ENV || 'development',
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles', test: /\.css$/, chunks: 'all', enforce: true,
        },
      },
    },
  },
  entry: {
    main: ['./src/index.js'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].js',
    publicPath: '/assets/',
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
        // exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: { plugins: [precss, autoprefixer] },
          },
        ],
      },
      {
        test: /\.(ttf|eot|otf|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin('[name].css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
  devtool: 'sourcemap',
};
