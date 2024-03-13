const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // Importante para que Webpack sepa que es para Node.js
    entry: './src/app.js', // Punto de entrada de tu aplicación
    output: {
        path: path.resolve(__dirname, 'dist'), // Carpeta de salida
        filename: 'app.bundle.js' // Nombre del archivo de salida
    },
    externals: [nodeExternals()], // Para evitar empaquetar las dependencias de node_modules
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
