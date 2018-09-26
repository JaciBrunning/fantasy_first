var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
      admin: './jsx/admin.jsx',
      admin_event: './jsx/admin_event.jsx',
      draft: './jsx/draft.jsx',
      event: './jsx/event_view.jsx'
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
                  presets: ["es2015", "react"]
              }
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          }
      ]
  },
  stats: {
      colors: true
  },
  devtool: 'source-map'
};