const path = require('path');

const webviewConfig = {
    name: 'webview',
    mode: 'development',
    target: 'web',
    entry: './src/webview/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webview.js',
        libraryTarget: 'umd' // Just to be safe
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css']
    },
    devtool: 'nosources-source-map'
};

const extensionConfig = {
    name: 'extension',
    mode: 'development',
    target: 'node', // VS Code extensions run in a Node.js-like environment
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs'
    },
    externals: {
        'vscode': 'commonjs vscode' // Ignored because it's provided by the host
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'nosources-source-map'
};

module.exports = [webviewConfig, extensionConfig];
