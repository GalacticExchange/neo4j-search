const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

fs.emptyDirSync(path.resolve('../resources/assets'));

module.exports = {
    entry: ['./js/index.js', './styles/main.scss'],
    output: {
        path: path.resolve('../resources/assets/dist/'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    },
                        'sass-loader']
                })
            },
            {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'},
            {
                test: /\.js$/,
                loaders: ['babel-loader'],
                include: [
                    path.resolve(__dirname, "node_modules/@material")
                ]
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin(),
        new ExtractTextPlugin({
            filename: 'bundle.css',
            allChunks: true
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery',
            mdc: 'material-components-web',
            randomColor: 'randomcolor',
            cytoscape: 'cytoscape',
            cola: 'webcola'
        }),
        new CopyWebpackPlugin([
            {from: 'html', to: path.resolve('../resources/assets/html/')},
            {from: 'images', to: path.resolve('../resources/assets/images/')}
        ])
    ]
};