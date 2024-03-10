const { Client, LocalAuth } = require('whatsapp-web.js');
const { ObtenerMensajes, ActualizarMensajes } = require('../Services/MessageService');
const { ObtenerSesionWhatsapp } = require('../Services/SessionService');
const path = require('path');

// const enviarMensajes = async (req, res) => {
//     const dataPath = path.resolve(__dirname, '../Sesiones');
//     const idTelefono = req.params.idTelefono;

//     try {
//         const sessionState = ObtenerSesionWhatsapp(idTelefono);

//         console.log("soy la session =>", sessionState)

//         if (!sessionState) {
//             return res.status(400)
//                 .send('El teléfono no está conectado');
//         }

//         const whatsappClient = new Client({
//             authStrategy: new LocalAuth({
//                 clientId: `cliente-${idTelefono}`,
//                 dataPath: dataPath,
//                 webVersion: '2.2306.7',
//             }),
//             puppeteer: { headless: true },
//         });

//         // whatsappClient.on('ready', async () => {
//         //     console.log('Cliente de WhatsApp listo y conectado');

//         //     for (let message of messages.slice(0, 100)) {
//         //         const { numero, texto, id } = message;
//         //         let numeroLimpio = message.numero.charAt(0) === '+' ? '+' + message.numero.slice(1).replace(/[^0-9]/g, '') : message.numero.replace(/[^0-9]/g, '');
//         //         // Asegúrate de que el número esté en formato internacional completo y añade '@c.us'
//         //         let numeroFormateado = numeroLimpio.includes('@c.us') ? numeroLimpio : `${numeroLimpio}@c.us`;

//         //         try {
//         //             await whatsappClient.sendMessage(numeroFormateado, texto);
//         //             console.log(`Mensaje enviado a ${numero}`);

//         //             await ActualizarMensajes(id, 4);

//         //             // Introduce un retraso de 15 segundos antes de enviar el próximo mensaje
//         //             await new Promise(resolve => setTimeout(resolve, 15000));

//         //         } catch (err) {
//         //             console.error(`Error al enviar mensaje a ${numero}: ${err}`);
//         //         }
//         //     }

//         //     res.send('Mensajes enviados');
//         // });

//         whatsappClient.initialize().then(async () => {
//             whatsappClient.on('ready', async () => {
//                 console.log('Cliente de WhatsApp listo y conectado');
//                 const messages = await ObtenerMensajes(idTelefono);
//                 console.log("soy los mensajes ==>", messages);

//                 for (let message of messages) {
//                     const { numero, texto, id } = message;
//                     let numeroFormateado = numero.includes('@c.us') ? numero : `${numero}@c.us`;

//                     try {
//                         await whatsappClient.sendMessage(numeroFormateado, texto);
//                         console.log(`Mensaje enviado a ${numero}`);
//                         await ActualizarMensajes(id, 4);

//                     } catch (err) {
//                         console.error(`Error al enviar mensaje a ${numero}: ${err}`);
//                     }
//                 }

//                 res.send('Mensajes enviados');
//             });
//         }).catch(err => {
//             console.error('Error al inicializar la sesión de WhatsApp', err);
//             res.status(500).send('Error al inicializar la sesión de WhatsApp');
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error al enviar mensajes');
//     }
// };

const enviarMensajes = async (req, res) => {
    const dataPath = path.resolve(__dirname, '../Sesiones');
    const idTelefono = req.params.idTelefono;

    const sessionState = ObtenerSesionWhatsapp(idTelefono);

    if (!sessionState) {
        return res.status(400).send('El teléfono no está conectado');
    }

    const whatsappClient = new Client({
        authStrategy: new LocalAuth({
            clientId: `cliente-${idTelefono}`,
            dataPath: dataPath,
        }),
        puppeteer: { headless: true },
    });

    whatsappClient.on('ready', async () => {
        console.log('Cliente de WhatsApp listo y conectado');
        try {
            const messages = await ObtenerMensajes(idTelefono);
            console.log("soy los mensajes ==>", messages);

            // for (let message of messages) {
            //     const { numero, texto, id } = message;
            //     let numeroFormateado = numero.includes('@c.us') ? numero : `${numero}@c.us`;

            //     try {
            //         await whatsappClient.sendMessage(numeroFormateado, texto);
            //         console.log(`Mensaje enviado a ${numero}`);
            //         await ActualizarMensajes(id, 4);
            //     } catch (err) {
            //         console.error(`Error al enviar mensaje a ${numero}: ${err}`);
            //     }
            // }

            for (let message of messages) {
                const { numero, texto, id } = message;

                // Asegúrate de que el número está en el formato correcto
                let numeroLimpio = numero.replace(/[^\d]/g, "");  // Elimina todo lo que no sea dígitos
                if (!numeroLimpio.startsWith("549")) {  // Asegúrate de que comienza con el código de país sin '+'
                    numeroLimpio = "549" + numeroLimpio;  // Añade el código de país si no está presente
                }
                let numeroFormateado = `${numeroLimpio}@c.us`;

                try {
                    await whatsappClient.sendMessage(numeroFormateado, texto);
                    console.log(`Mensaje enviado a ${numero}`);
                    await ActualizarMensajes(id, 4);
                } catch (err) {
                    console.error(`Error al enviar mensaje a ${numero}: ${err}`);
                }
            }

            res.send('Mensajes enviados');
        } catch (error) {
            console.error('Error al enviar mensajes:', error);
            res.status(500).send('Error al enviar mensajes');
        }
    });

    whatsappClient.on('qr', qr => {
        console.log("ESTOY EN EL QR")
    });

    whatsappClient.initialize().catch(err => {
        console.error('Error al inicializar la sesión de WhatsApp', err);
        res.status(500).send('Error al inicializar la sesión de WhatsApp');
    });
};


module.exports = { enviarMensajes };