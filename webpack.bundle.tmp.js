const config = require('./webpack.bundle.js')

module.exports = { ...config, output: { ...config.output, filename: 'snapshot-interpolation.tmp.js' } }
