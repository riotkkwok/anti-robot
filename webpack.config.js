var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        "anti-robot.min": "./src/index.ts",
    },
    output: {
        path: __dirname,
        filename: "build/[name].js",
        library: 'AntiRobot',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, 'src'),
                use: {
                  loader: 'ts-loader',
                  // options: {
                  //   presets: ['es2015']
                  // }
                }
            }
        ],
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          include: /\.min\.js$/,
        }),
      ],
    },
}