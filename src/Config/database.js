const { Connection } = require('tedious');

// Función para crear una nueva conexión
function getConnection() {
    const config = {
        server: process.env.DB_SERVER,  // Asegúrate de que esto es una cadena
        authentication: {
            type: 'default',
            options: {
                userName: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            },
        },
        options: {
            database: process.env.DB_DATABASE,
            encrypt: false, // Desactivar cifrado
            trustServerCertificate: true,
            port: parseInt(process.env.DB_PORT, 10) || 1433,  // Usa el puerto de .env o el predeterminado
        },
    };

    return new Connection(config);
}

module.exports = { getConnection };
