const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode : "none",
    entry: {
        main: './src/l8.js'
    },
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'l8.bundle.js',
        library: {
             type: 'module'
        },
    }
}