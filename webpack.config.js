const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /@bandagedbd\/bdapi/,
                use: 'noop-loader'
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
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    },
};