const TerserPlugin = require("terser-webpack-plugin");
const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/bundle.ts',
  output: {
    filename: 'snapshot-interpolation.js',
    path: path.resolve(__dirname, 'bundle'),
    library: 'Snap',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i,
          },
        },
        extractComments: false,
      }),
    ],
  },
}
