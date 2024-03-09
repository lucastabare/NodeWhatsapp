const { SQLAuth } = require('./ruta/a/sqlAuth'); 

const client = new Client({
    authStrategy: new SQLAuth({ clientId: 'idTelefono' }) 
});