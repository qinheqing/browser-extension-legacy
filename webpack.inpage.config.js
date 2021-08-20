const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        mode: "development",
        devtool: false,
        target: 'web',
        entry: {
            'js/inpage': './app/scripts/inpage.js',
        },

        output: {
            path: path.resolve(__dirname, 'dist/'),
            filename: '[name].js'
        },

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json", '.jsx'],
            alias: {
                'dnode': path.resolve(__dirname, './node_modules/dnode/browser.js'),
            },
            fallback: {
                // 在浏览器中增加 node.js internal 模块
                "stream": require.resolve("stream-browserify"),
                "crypto": require.resolve("crypto-browserify"),
                "process": require.resolve('process/browser'),
                "path": require.resolve('path-browserify'),
                "fs": require.resolve('browserify-fs'),
                "events": require.resolve('events'),
                "vm": false,
                "http": false,
                "https": false,
                "net": false,
                "os": false,
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
                global: 'global'
            }),
            new webpack.DefinePlugin({
                'process.env.INFURA_PROJECT_ID': JSON.stringify('0f1946aacbeb4f98a83cc1058764dbc1'),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.[j|t]sx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] }
            ]
        },
    }
];
