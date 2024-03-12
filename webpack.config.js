//PARA BUILDEAR LA APLICACION
const path = require('path');

module.exports = {
    entry: './src/app.js', // Punto de entrada de tu aplicación
    output: {
        filename: 'bundle.js', // Nombre del archivo de salida
        path: path.resolve(__dirname, 'dist') // Directorio de salida
    },
    externals: {
        // Ignora el módulo 'url' cuando webpack lo encuentre
        'url': 'url'
    },
    module: {
        rules: [
            {
                test: /\.yaml$/,
                use: 'yaml-loader',
                type: 'json'
            }
        ]
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false
        }
    }
};