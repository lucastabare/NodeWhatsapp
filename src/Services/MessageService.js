const { Request, TYPES } = require('tedious');
const { getConnection } = require('../Config/database');

const ObtenerMensajes = async (idTelefono) => {
    const connection = getConnection();
    const messages = [];

    return new Promise((resolve, reject) => {
        connection.on('connect', (err) => {
            if (err) {
                console.error('Error connecting for SELECT:', err.message);
                return reject(err);
            }

            const request = new Request(`SELECT numero, texto, id 
                                        FROM mensaje 
                                        WHERE idTelefono = @idTelefono 
                                        AND FechaEnviado IS NULL 
                                        AND IdEstado = 0
                                        AND Encolado = 0`, (err) => {
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

const ActualizarMensajes = async (id, status) => {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
        connection.on('connect', err => {
            if (err) {
                console.error('Error connecting for UPDATE:', err.message);
                return reject(err);
            }

            const request = new Request(
                'UPDATE mensaje SET IdEstado = @status, FechaEnviado = GETDATE() WHERE id = @id',
                err => {
                    if (err) {
                        console.error('SQL error in UPDATE:', err);
                        return reject(err);
                    }
                }
            );

            request.addParameter('status', TYPES.Int, status);
            request.addParameter('id', TYPES.Int, id);

            request.on('requestCompleted', () => {
                connection.close();
                console.log(`Estado actualizado para el mensaje ${id}`);
                resolve();
            });

            connection.execSql(request);
        });

        connection.connect();
    });
};

const ActualizarMensajesEncolado = async (id, status) => {
    const connection = getConnection();

    return new Promise((resolve, reject) => {
        connection.on('connect', err => {
            if (err) {
                console.error('Error connecting for UPDATE:', err.message);
                return reject(err);
            }

            const request = new Request(
                'UPDATE mensaje SET Encolado = @status WHERE id = @id',
                err => {
                    if (err) {
                        console.error('SQL error in UPDATE:', err);
                        return reject(err);
                    }
                }
            );

            request.addParameter('status', TYPES.Int, status);
            request.addParameter('id', TYPES.Int, id);

            request.on('requestCompleted', () => {
                connection.close();
                console.log(`Encolado actualizado para el mensaje ${id}`);
                resolve();
            });

            connection.execSql(request);
        });

        connection.connect();
    });
};

module.exports = { ObtenerMensajes, ActualizarMensajes, ActualizarMensajesEncolado };