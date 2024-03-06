// const express = require('express');
// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const { Connection, Request, TYPES } = require('tedious');
// const { promisify } = require('util');
// const setTimeoutAsync = promisify(setTimeout);
// const fs = require('fs');
// require('dotenv').config();
// const app = express();
// const port = 3000;
// const SESSION_FILE_PATH = './Sesiones/';

// // Configuración para la conexión a SQL Server usando variables de entorno
// var config = {
//     server: process.env.DB_SERVER,
//     authentication: {
//         type: 'default',
//         options: {
//             userName: process.env.DB_USER,
//             password: process.env.DB_PASSWORD
//         }
//     },
//     options: {
//         encrypt: true,
//         database: process.env.DB_DATABASE,
//         trustServerCertificate: true
//     }
// };

// const whatsappClient = new Client();

// whatsappClient.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
// });

// whatsappClient.on('ready', () => {
//     console.log('Cliente de WhatsApp listo');
// });

// whatsappClient.initialize();


// // ENVIO DE MENSAJES CON UPDATE + DILAY
// function EnviarMensajes() {
//     var selectConnection = new Connection(config);
//     selectConnection.on('connect', async function (err) {  // Nota el uso de 'async' aquí
//         if (err) {
//             console.error('Error connecting for SELECT: ' + err.message);
//             return;
//         }
//         console.log("Connected to the database for SELECT");

//         var request = new Request("SELECT numero, texto, id FROM mensaje WHERE idTelefono = 7", async function (err) { // Nota el uso de 'async' aquí
//             if (err) {
//                 console.error('SQL error', err);
//             }
//         });

//         var rows = [];
//         request.on('row', function (columns) {
//             let row = {};
//             columns.forEach(function (column) {
//                 row[column.metadata.colName] = column.value;
//             });
//             rows.push(row);
//         });

//         request.on('requestCompleted', async function () {  
//             for (let row of rows) {
//                 let numero = row['numero'].replace(/[^0-9]/g, '');
//                 let texto = row['texto'];
//                 let id = row['id'];
//                 const formattedNumber = numero.includes('@c.us') ? numero : `${numero}@c.us`;

//                 try {
//                     await whatsappClient.sendMessage(formattedNumber, texto);
//                     console.log(`Mensaje enviado a ${numero}`);

//                     // UPDATE A BASE DE DATOS
//                     let updateRequest = new Request(
//                         "UPDATE mensaje SET IdEstado = 4, FechaEnviado = GETDATE() WHERE id = @id",
//                         function (err) {
//                             if (err) {
//                                 console.error('SQL error in UPDATE', err);
//                             } else {
//                                 console.log(`Estado actualizado para el mensaje ${id}`);
//                             }
//                         }
//                     );

//                     updateRequest.addParameter('id', TYPES.Int, id);
//                     selectConnection.execSql(updateRequest);

//                     // DILEY DE 15s
//                     await setTimeoutAsync(15000);

//                 } catch (err) {
//                     console.error(`Error al enviar mensaje a ${numero}: ${err}`);
//                 }
//             }
//             console.log('Todos los mensajes SELECT han sido procesados');
//             selectConnection.close(); 
//         });

//         selectConnection.execSql(request);
//     });

//     selectConnection.connect();
// }

// app.post('/send', (req, res) => {
//     EnviarMensajes();
//     res.send('Proceso de envío iniciado');
// });

// app.post('/send', (req, res) => {
//     EnviarMensajes();
//     res.send('Proceso de envío iniciado');
// });

// app.listen(port, () => {
//     console.log(`Servidor corriendo en http://localhost:${port}`);
// });

// app.get('/ArmarQR/:idTelefono', async (req, res) => {
//     const idTelefono = req.params.idTelefono;
//     const sessionState = getSessionState(idTelefono);

//     if (sessionState.isConnected) {
//         res.send('Ya estás sincronizado');
//         return;
//     }

//     const customClient = new Client({
//         session: sessionState.session // Carga la sesión si existe
//     });

//     customClient.on('qr', (qr) => {
//         qrcode.toDataURL(qr, async (err, url) => {
//             if (err) {
//                 res.status(500).send("Error al generar el QR");
//             } else {
//                 await updateSessionState(idTelefono, { isConnected: false, qr: url });
//                 res.send(`<iframe src="${url}" frameborder="0"></iframe>`);
//             }
//         });
//     });

//     customClient.on('ready', async () => {
//         console.log('Cliente de WhatsApp listo y conectado');
//         await updateSessionState(idTelefono, { isConnected: true });
//     });

//     customClient.on('authenticated', (session) => {
//         const sessionFilePath = `${SESSION_FILE_PATH}${idTelefono}.json`;
//         fs.writeFileSync(sessionFilePath, JSON.stringify(session));
//     });

//     customClient.initialize();
// });

// app.post('/enviar-mensajes/:idTelefono', async (req, res) => {
//     const idTelefono = req.params.idTelefono;

//     // Verificar si el teléfono está conectado
//     const sessionState = getSessionState(idTelefono);
//     if (!sessionState.isConnected) {
//         res.status(400).send('El teléfono no está conectado');
//         return;
//     }

//     // Cargar la sesión para este teléfono
//     const customClient = withSession(idTelefono);

//     customClient.on('ready', async () => {
//         console.log('Cliente de WhatsApp listo y conectado para enviar mensajes');

//         var selectConnection = new Connection(config);
//         selectConnection.on('connect', async function (err) {
//             if (err) {
//                 console.error('Error connecting for SELECT: ' + err.message);
//                 return res.status(500).send('Error al conectar a la base de datos');
//             }
//             console.log("Connected to the database for SELECT");

//             var request = new Request(`SELECT numero, texto, id FROM mensaje WHERE idTelefono = @idTelefono AND FechaEnviado IS NULL AND IdEstado = 0`, async function (err) {
//                 if (err) {
//                     console.error('SQL error', err);
//                     return res.status(500).send('Error al ejecutar la consulta SQL');
//                 }
//             });

//             request.addParameter('idTelefono', TYPES.Int, idTelefono);

//             var rows = [];
//             request.on('row', function (columns) {
//                 let row = {};
//                 columns.forEach(function (column) {
//                     row[column.metadata.colName] = column.value;
//                 });
//                 rows.push(row);
//             });

//             request.on('requestCompleted', async function () {
//                 for (let row of rows) {
//                     let numero = row['numero'].replace(/[^0-9]/g, '');
//                     let texto = row['texto'];
//                     let id = row['id'];
//                     const formattedNumber = numero.includes('@c.us') ? numero : `${numero}@c.us`;

//                     try {
//                         await customClient.sendMessage(formattedNumber, texto);
//                         console.log(`Mensaje enviado a ${numero}`);

//                         // Aquí deberías agregar la lógica para actualizar el estado del mensaje en la base de datos
//                         // Por ejemplo, marcarlo como enviado (IdEstado = 4)

//                         // Considera implementar un retraso si es necesario

//                     } catch (err) {
//                         console.error(`Error al enviar mensaje a ${numero}: ${err}`);
//                     }
//                 }
//                 console.log('Todos los mensajes SELECT han sido procesados');
//                 selectConnection.close();
//                 res.send('Mensajes enviados');
//             });

//             selectConnection.execSql(request);
//         });

//         selectConnection.connect();
//     });

//     customClient.initialize();
// });

// const getSessionState = (idTelefono) => {
//     const sessionFilePath = `${SESSION_FILE_PATH}${idTelefono}.json`;
//     const sessionStatePath = `${SESSION_FILE_PATH}${idTelefono}-state.json`;
//     let isConnected = false;
//     let session = null;

//     if (fs.existsSync(sessionFilePath)) {
//         session = require(sessionFilePath);
//     }

//     if (fs.existsSync(sessionStatePath)) {
//         const stateData = fs.readFileSync(sessionStatePath);
//         const state = JSON.parse(stateData);
//         isConnected = state.isConnected;
//     }

//     return { isConnected, session };
// };

// const updateSessionState = (idTelefono, state) => {
//     const sessionStatePath = `${SESSION_FILE_PATH}${idTelefono}-state.json`;
//     const stateData = JSON.stringify(state);
//     fs.writeFileSync(sessionStatePath, stateData);
// };

const express = require('express');
const whatsappRoutes = require('./src/routes/whatsappRoutes'); // Actualiza la ruta según tu estructura de directorios

const app = express();

app.use('/api/whatsapp', whatsappRoutes); // Prefijo '/api/whatsapp' para todas las rutas definidas en whatsappRoutes

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});