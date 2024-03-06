const { Request, TYPES } = require('tedious');
const { getConnection } = require('../Config/database');

const fetchMessages = async (idTelefono) => {
    const connection = getConnection();
    const messages = [];

    return new Promise((resolve, reject) => {
        connection.on('connect', (err) => {
            if (err) {
                console.error('Error connecting for SELECT:', err.message);
                return reject(err);
            }

            const request = new Request(`SELECT numero, texto, id FROM mensaje WHERE idTelefono = @idTelefono AND FechaEnviado IS NULL AND IdEstado = 0`, (err) => {
                if (err) {
                    console.error('SQL error:', err);
                    return reject(err);
                }
            });

            request.addParameter('idTelefono', TYPES.Int, idTelefono);

            request.on('row', (columns) => {
                let row = {};
                columns.forEach((column) => {
                    row[column.metadata.colName] = column.value;
                });
                messages.push(row);
            });

            request.on('requestCompleted', () => {
                connection.close();
                resolve(messages);
            });

            connection.execSql(request);
        });

        connection.connect();
    });
};

// Otras funciones como actualizar el estado del mensaje en la base de datos podrían ir aquí

module.exports = { fetchMessages };