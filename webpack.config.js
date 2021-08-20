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
            'js/popup': './ui/index.js',
            'js/ui': './app/scripts/ui.js',
            'js/background': './app/scripts/background.js',
            'js/contentscript': './app/scripts/contentscript.js',
            'js/globalthis': './node_modules/globalthis/dist/browser.js',
            'js/lockdown-install': './node_modules/ses/dist/lockdown.cjs',
            'js/lockdown-run': './app/scripts/lockdown-run.js',
            'js/disable-console': './app/scripts/disable-console.js',
            'js/sentry-install': './app/scripts/sentry-install.js',
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
                // 'process.env.METAMASK_DEBUG': 'false',
                // 'process.env.METAMASK_ENVIRONMENT': '',
                // 'process.env.SENTRY_DSN': '',
                // 'process.version': '',
            }),
            new CopyWebpackPlugin({
              patterns: [
                { from: "public/static", to: "./" },
              ],
            }),
            // new HtmlWebpackPlugin({
            //     filename: 'home.html',
            //     template: 'public/home.html',
            //     /** JS 有依赖关系，注入页面最下方 */
            //     scriptLoading: 'blocking',
            //     /** 按照 chunks 顺序依次注入 */
            //     chunksSortMode: 'manual',
            //     minify: true,
            //     chunks: ['js/globalthis', 'js/sentry-install', 'js/lockdown-install', 'js/ui']
            // }),
            // new HtmlWebpackPlugin({
            //     filename: 'background.html',
            //     template: 'public/background.html',
            //     /** JS 有依赖关系，注入页面最下方 */
            //     scriptLoading: 'blocking',
            //     /** 按照 chunks 顺序依次注入 */
            //     chunksSortMode: 'manual',
            //     minify: true,
            //     chunks: ['js/globalthis', 'js/sentry-install', 'js/lockdown-install', 'js/background']
            // }),
            // new HtmlWebpackPlugin({
            //     filename: 'popup.html',
            //     template: 'public/popup.html',
            //     /** JS 有依赖关系，注入页面最下方 */
            //     scriptLoading: 'blocking',
            //     /** 按照 chunks 顺序依次注入 */
            //     chunksSortMode: 'manual',
            //     minify: true,
            //     chunks: ['js/globalthis', 'js/sentry-install', 'js/lockdown-install', 'js/popup']
            // }),
        ],
        module: {
            rules: [
                {
                    test: /\.[j|t]sx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // MiniCssExtractPlugin.loader,
                      // Creates `style` nodes from JS strings
                      "style-loader",
                      // Translates CSS into CommonJS
                      "css-loader",
                      // Compiles Sass to CSS
                      "sass-loader",
                    ],
                },
            ]
        },
    }
];
