var webpack = require('webpack');
var license = require('./prebuild.js');

var data = {
  context: __dirname,
  entry: {
    'dist/stocks': './src/stocks.js'
  },
  output: {
    path: './',
    filename: '[name].js',
    library: 'stocks',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
    //new webpack.BannerPlugin(license())
  ]
};

module.exports = data;
