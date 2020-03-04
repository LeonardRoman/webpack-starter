const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const plugins = () => {
  const base = [
    new HTMLWebpackPlugin(
      {
        // template: './index.html',
        template: './index.pug',
        filename: './index.html',
        inject: true,
        minify: {
          collapseWhitespace: isProd,
          removeComments: isProd,
          useShortDoctype: isProd
        }
      }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src/favicon.ico'),
      to: path.resolve(__dirname, 'dist')
    }]),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })]
  if (isProd) base.push(new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerHost: 'localhost',
    analyzerPort: 8888,
    openAnalyzer: true,
  }))
  return base
}

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if (isProd) {
    config.minimizer = [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})]
  }
  return config
}

const cssLoaders = extra => {
  const loaders = [{
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDev,
      reloadAll: true
    }
  },
    'css-loader',
    'postcss-loader']
  if (extra) loaders.push(extra)
  return loaders
}

const babelLoaders = (preset) => {
  const loaders = {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env']
    }
  }
  if (preset) loaders.options.presets.push(preset)
  return loaders
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'production',
  entry: {
    main: ['@babel/polyfill', './index.js'],
    // analytics: './analytics.ts',
    index: './index.pug'
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimization(),
  devtool: isDev ? 'source-map' : '',
  devServer: {
    port: 4200,
    hot: isDev
  },
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.css$/, use: cssLoaders()
      },
      { test: /\.(png|jpg|svg|gif)$/, use: ['file-loader'] },
      { test: /\.(ttf|woff|woff2|eot)$/, use: ['file-loader'] },
      {
        test: /\.js$/, exclude: /node_modules/, loader: babelLoaders()
      },
      {
        test: /\.ts$/, exclude: /node_modules/, loader: babelLoaders('@babel/preset-typescript')
      }
    ]
  }
}
