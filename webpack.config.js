var webpack = require('webpack');
var license = require('./prebuild.js');

var data = {
  context: __dirname,
  entry: {
    'dist/stocks': './src/stocks.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js',
    library: 'stocks',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin(license())
  ],
  externals: {
    xmlhttprequest: 'XMLHttpRequest'
  }
};

module.exports = data;
