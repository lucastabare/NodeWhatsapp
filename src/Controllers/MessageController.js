const { Client, LocalAuth } = require('whatsapp-web.js');
const { ObtenerMensajes, ActualizarMensajes } = require('../Services/MessageService');
const { ObtenerSesionWhatsapp } = require('../Services/SessionService');
const { IniciarWhatsApp } = require('../Config/WhatsappClient')
const Queue = require('bull');
const EnviarMensajesProgramadosQueue = new Queue('EnviarMensajesProgramadosQueue');
const path = require('path');

//METODO PARA ENVIAR LOS MENSAJES COMUN
// const enviarMensajes = async (req, res) => {
//     const dataPath = path.resolve(__dirname, '../Sesiones');
//     const idTelefono = req.params.idTelefono;

//     const sessionState = ObtenerSesionWhatsapp(idTelefono);

//     if (!sessionState) {
//         return res.status(400).send('El teléfono no está conectado');
//     }

//     const whatsappClient = new Client({
//         authStrategy: new LocalAuth({
//             clientId: `cliente-${idTelefono}`,
//             dataPath: dataPath,
//         }),
//         puppeteer: { headless: true },
//     });

//     whatsappClient.on('ready', async () => {
//         console.log('Cliente de WhatsApp listo y conectado');
//         try {
//             const messages = await ObtenerMensajes(idTelefono);
//             console.log("soy los mensajes ==>", messages);

//             if (messages.length === 0) {
//                 whatsappClient.destroy();
//                 return res.status(200)
//                     .send('No hay mensajes para enviar');
//             }

//             for (let message of messages) {
//                 const { numero, texto, id } = message;

//                 let numeroLimpio = numero.replace(/[^\d]/g, "");
//                 if (!numeroLimpio.startsWith("549")) {  // Asegúrate de que comienza con el código de país sin '+'
//                     numeroLimpio = "549" + numeroLimpio;  // Añade el código de país si no está presente
//                 }
//                 let numeroFormateado = `${numeroLimpio}@c.us`;

//                 try {
//                     await whatsappClient.sendMessage(numeroFormateado, texto);
//                     console.log(`Mensaje enviado a ${numero}`);
//                     await ActualizarMensajes(id, 4);
//                 } catch (err) {
//                     console.error(`Error al enviar mensaje a ${numero}: ${err}`);
//                 }
//             }

//             whatsappClient.destroy();
//             res.status(200)
//                 .send('Mensajes enviados');

//         } catch (error) {
//             console.error('Error al enviar mensajes:', error);
//             res.status(500).send('Error al enviar mensajes');
//         }
//     });

//     whatsappClient.on('qr', qr => {
//         console.log("ESTOY EN EL QR")
//     });

//     whatsappClient.initialize().catch(err => {
//         console.error('Error al inicializar la sesión de WhatsApp', err);
//         res.status(500).send('Error al inicializar la sesión de WhatsApp');
//     });
// };

//METODO PARA ENVIAR MENSAJES CON BACKGROUN JOBS, ENCOLA MENSAJES
const enviarMensajes = async (req, res) => {
    const idTelefono = req.params.idTelefono;
    const sessionState = ObtenerSesionWhatsapp(idTelefono);

    if (!sessionState) {
        return res.status(400).send('El teléfono no está conectado');
    }

    try {
        const messages = await ObtenerMensajes(idTelefono);

        if (messages.length === 0) {
            return res.status(200).send('No hay mensajes para enviar');
        }

        //TODO-LUCAS REEMPLAZAR LOGICA POR 100
        const lotes = [];
        for (let i = 0; i < messages.length; i += 3) {
            if (i < messages.length - 3) {
                lotes.push(messages.slice(i, i + 3));
            } else {
                lotes.push(messages.slice(i));
            }
        }

        await enviarPrimerLote(lotes.shift(), idTelefono);

        // Programa los lotes futuros
        for (let i = 0; i < lotes.length; i++) {
            const delayHoras = i + 1;
            programarEnvioLotes(lotes[i], idTelefono, delayHoras);
        }

        console.log("soy los lotes ===>", lotes)

        res.status(200).send('Mensajes enviados y programados');
    } catch (error) {
        console.error('Error al enviar mensajes:', error);
        res.status(500).send('Error al enviar mensajes');
    }
};

const enviarPrimerLote = async (lote, idTelefono) => {
    const dataPath = path.resolve(__dirname, '../Sesiones');
    let whatsappClient;

    try {
        whatsappClient = await IniciarWhatsApp(idTelefono, dataPath);

        for (let message of lote) {
            const { numero, texto } = message;
            let numeroLimpio = numero.replace(/[^\d]/g, "");
            if (!numeroLimpio.startsWith("549")) {
                numeroLimpio = "549" + numeroLimpio;
            }
            const numeroFormateado = `${numeroLimpio}@c.us`;

            try {
                await whatsappClient.sendMessage(numeroFormateado, texto);
                console.log(`Mensaje enviado a ${numero}`);
                // Actualizar estado del mensaje a enviado
                await ActualizarMensajes(message.id, 4);
            } catch (err) {
                console.error(`Error al enviar mensaje a ${numero}: ${err}`);
            }

            await new Promise(resolve => setTimeout(resolve, 15000));
        }

    } catch (error) {
        console.error('Error al iniciar cliente de WhatsApp:', error);
    } finally {
        if (whatsappClient) {
            whatsappClient.destroy();
        }
    }
};

const programarEnvioLotes = (lote, idTelefono, delayHoras) => {

    // EnviarMensajesProgramadosQueue.add({ lote, idTelefono }, { delay: delayMinutos * 60 * 1000 });

    EnviarMensajesProgramadosQueue.add({ lote, idTelefono }, { delay: 5 * 60 * 1000 }); //TEST 5m
};

EnviarMensajesProgramadosQueue.process(async (job) => {
    const { lote, idTelefono } = job.data;
    await enviarPrimerLote(lote, idTelefono);
});

module.exports = { enviarMensajes, EnviarMensajesProgramadosQueue };