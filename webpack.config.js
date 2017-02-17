var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    habits: ["./assets/webpack-entry-habits.js"],
    journal: ["./assets/webpack-entry-journal.js"],
  },

  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'webpack-bundle-[name].js'
  },

  resolve: {
    alias: {
      jquery: path.resolve(__dirname, 'assets/vendor/jquery/dist/jquery.min'),
      moment: path.resolve(__dirname, 'assets/vendor/moment/min/moment.min'),
      Tether: path.resolve(__dirname, 'assets/vendor/tether/dist/js/tether.min'),
      riot: path.resolve(__dirname, "assets/vendor/riot/riot+compiler.min"),
    },
  },

  externals: ['window'],

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ProvidePlugin({
      "Tether": "Tether", // required for bootstrap
    })
  ],

  /* Compile riot .tag files */
  module: {
    rules: [
      { test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      { test: /\.(woff|png|ttf|svg|eot|woff2)$/,
        loader: 'file-loader?name=copied/[hash].[ext]&context=./assets&publicPath=assets/' },
      { enforce: 'pre', test: /\.tag$/, exclude: /assets\/vendor/, loader: 'riotjs-loader' },
    ],
  },
  'devtool': 'source-map',
};
