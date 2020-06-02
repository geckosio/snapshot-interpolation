const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './example/client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'example/dist'),
  },
  plugins: [new HtmlWebpackPlugin()],
}
