const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // каждый раз создает index.html в папке build
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); //очищать папку dist
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //Компилятор scss файлов


module.exports = {
    mode: 'development',
    entry: './src/js/index.js',
    devtool: 'inline-source-map',
    target: 'es6',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js',
    },
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: path.resolve(__dirname, './src/style'),
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            title: 'Development',
        }),
    ],
};