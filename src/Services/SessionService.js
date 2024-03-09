const { Request, TYPES } = require('tedious');
const { getConnection } = require('../Config/database')

const ActualizarSessionWhatsapp = (idTelefono, sessionData) => {
    return new Promise((resolve, reject) => {
        const connection = getConnection();
        const sessionString = JSON.stringify(sessionData); // Convierte los datos de la sesión a un string JSON

        connection.on('connect', err => {
            if (err) {
                reject('Error al conectar a la base de datos: ' + err);
            } else {
                const query = 'UPDATE Telefono SET Sesion = @session WHERE id = @idTelefono';
                const request = new Request(query, (err) => {
                    if (err) {
                        reject('Error al ejecutar la consulta: ' + err);
                    } else {
                        resolve();
                    }
                });

                request.addParameter('session', TYPES.NVarChar, sessionString);
                request.addParameter('idTelefono', TYPES.NVarChar, idTelefono);

                connection.execSql(request);
            }
        });

        connection.connect();
    });
};

const ObtenerSessionWhatsapp = (idTelefono) => {
    return new Promise((resolve, reject) => {
        const connection = getConnection();

        connection.on('connect', err => {
            if (err) {
                reject('Error al conectar a la base de datos: ' + err);
            } else {
                const query = 'SELECT Sesion FROM Telefono WHERE id = @idTelefono';
                const request = new Request(query, (err) => {
                    if (err) {
                        reject('Error al ejecutar la consulta: ' + err);
                    }
                });

                let result = "";

                request.on('row', columns => {
                    columns.forEach(column => {
                        if (column.metadata.colName === "Sesion") {
                            result = column.value;
                        }
                    });
                });

                request.on('requestCompleted', () => {
                    if (result) {
                        // Asegúrate de que los datos estén en el formato correcto antes de resolver
                        const sessionData = JSON.parse(result);
                        // Aquí puedes realizar validaciones o transformaciones adicionales si es necesario
                        resolve(sessionData);
                    } else {
                        resolve(null);
                    }
                });

                request.addParameter('idTelefono', TYPES.NVarChar, idTelefono);
                connection.execSql(request);
            }
        });

        connection.connect();
    });
};

module.exports = { ActualizarSessionWhatsapp, ObtenerSessionWhatsapp };