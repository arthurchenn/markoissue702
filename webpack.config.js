var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

var outPath = path.join(__dirname, 'target', 'markoissue702');
var assetPath = path.join(outPath, 'public');
var serverFilePath = path.join(outPath, 'server.js');

var commonLoaders = [
  {
    enforce: 'pre',
    test: /\.js$/,
    loader: 'eslint-loader',
    exclude: /node_modules/,
    include: path.resolve(__dirname, 'src')
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    include: path.resolve(__dirname, 'src')
  }
];

module.exports = [
  {
    // The configuration for the client
    name: 'browser',

    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.js', '.marko']
    },

    entry: ["babel-polyfill", "./src/pages/client.js"],

    output: {
      path: assetPath,
      filename: '[name]-[hash].js',
      publicPath: assetPath
    },

    module: {
      rules: commonLoaders.concat([
        {
          test: /\.scss$/,
          exclude: /bootstrap/,
          loader: ExtractTextPlugin.extract({ fallback: 'style-loader',
            use: [{ loader: 'css-loader', options: { minimize: true } },
              { loader: 'postcss-loader' },
              { loader: 'sass-loader',
                options: { includePaths: [path.resolve(__dirname,
                  'node_modules')] } }]
            })
        },
        {
          test: /\.marko$/,
          use: ['babel-loader', 'marko-loader']
        }
      ])
    },

    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new ExtractTextPlugin('[name]-[hash].css'),
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
          postcss: [ autoprefixer ]
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compressor: { warnings: false }
      })
    ]
  },
  {
    // The configuration for the server-side rendering
    name: 'server',
    target: 'node',
    node: {
      __dirname: false
    },
    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.js', '.marko']
    },
    entry: ['babel-polyfill', './src/server.js'],
    output: {
      path: outPath,
      filename: 'server.js',
      libraryTarget: 'commonjs2',
      publicPath: assetPath
    },
    externals: /^[a-z\-0-9]+$/,
    module: {
      rules: commonLoaders.concat([
        {
          test: /\.marko$/,
          // loader: 'marko-loader',
          // query: { target: 'server' }
          use: ['babel-loader',
            { loader: 'marko-loader',
            options: { target: 'server' } }]
        }
      ])
    },
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
];
