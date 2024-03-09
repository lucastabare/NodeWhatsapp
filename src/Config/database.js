const { Connection } = require('tedious');

const getConnection = () => {
    const config = {
        server: process.env.DB_SERVER,
        authentication: {
            type: 'default',
            options: {
                userName: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            }
        },
        options: {
            encrypt: true,
            database: process.env.DB_DATABASE,
            trustServerCertificate: true
        }
    };
    return new Connection(config);
};

module.exports = { getConnection };