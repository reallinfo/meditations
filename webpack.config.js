const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

const sassExtract = new ExtractTextPlugin('bundle-[name].css');
const nodeModulesDirectory = path.resolve(__dirname, './node_modules');

module.exports = {
  entry: {
    // journal: ['./src/entry/journal.ts', './src/site.scss'],
    habits: ['./src/entry/habits.ts', './src/style/habits.scss'],
  },

  output: {
    path: path.resolve(__dirname, 'assets', 'webpack'),
    filename: 'bundle-[name].js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  externals: ['window'],

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/),
    sassExtract,
    new CheckerPlugin(), // async typescript error reporting
  ],

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.css$/,
        use: sassExtract.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              modules: true,
            },
          }],
        }),
      },
      { test: /\.s?css$/,
        loader: sassExtract.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            }, {
              loader: 'sass-loader',
              options: {
                includePaths: [nodeModulesDirectory], // necessary for primer-css to work
              },
            }],
        }),
      },

      { test: /\.(woff|png|ttf|svg|eot|woff2)$/,
        loader: 'file-loader?name=../../assets/copied/[hash].[ext]&context=./assets&publicPath=/assets/copied/' },
    ],
  },
  devtool: 'source-map',
};

