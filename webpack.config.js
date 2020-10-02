const path = require("path");
const webpack = require("webpack");
const PACKAGE = require('./package.json');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

var banner =
    `/**
* @name ${PACKAGE.name}
* @version ${PACKAGE.version}
* @description ${PACKAGE.description}
* 
* @website ${PACKAGE.homepage}
*/`;

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "Socialcord.plugin.js",
        libraryTarget: 'this'
    },
    target: 'node',
    externals: [
        nodeExternals({
            allowlist: ["@mtproto/core"],
            modulesFromFile: true
        }),
        {
            "@bandagedbd/bdapi": "empty"
        }
    ],
    plugins: [
        new webpack.IgnorePlugin(/request/),
        new webpack.BannerPlugin({
            banner: banner,
            raw: true,
            entryOnly: true
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    output: {
                        comments: /@name/i,
                    },
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    },
};