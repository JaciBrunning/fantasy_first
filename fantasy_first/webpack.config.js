var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
      index: './jsx/index.js'
  },
  output: {
      path: path.resolve(__dirname, 'build/js'),
      filename: '[name].js',
      libraryTarget: 'var',
      library: '[name]'
  },
  module: {
      rules: [
          {
              test: /\.jsx$/,
              loader: 'babel-loader',
              query: {
                  presets: ["es2015", "react", "minify"]
              }
          }
      ]
  },
  stats: {
      colors: true
  },
  devtool: 'source-map'
};