const { Client, LocalAuth } = require('whatsapp-web.js');
const { ObtenerMensajes, ActualizarMensajes } = require('../Services/MessageService');
const { ObtenerSesionWhatsapp } = require('../Services/SessionService');
const Queue = require('bull');
const EnviarMensajesProgramadosQueue = new Queue('EnviarMensajesProgramadosQueue');
const path = require('path');

const enviarMensajes = async (req, res) => {
    console.log("Iniciando el método de envío de mensajes...");

    const idTelefono = req.params.idTelefono;
    const sessionState = ObtenerSesionWhatsapp(idTelefono);

    if (!sessionState) {
        return res.status(500)
            .send('El teléfono no está conectado');
    }

    try {
        const messages = await ObtenerMensajes(idTelefono);

        if (messages.length === 0) {
            return res.status(200).send('No hay mensajes para enviar');
        }

        // Dividir los mensajes en lotes de 100
        const lotes = [];
        for (let i = 0; i < messages.length; i += 100) {
            lotes.push(messages.slice(i, i + 100));
        }

        console.log("Lotes preparados para el envío");

        if (lotes.length > 0) {
            programarEnvioLotes(lotes.shift(), idTelefono, 1);
        }

        let delayMinutos = 30;

        for (let [index, lote] of lotes.entries()) {

            programarEnvioLotes(lote, idTelefono, delayMinutos, index + 1);

            delayMinutos += 30;

        }

        res.status(200).send('Mensajes programados para su envío');

    } catch (error) {
        console.error('Error al enviar mensajes:', error);
        res.status(500).send('Error al enviar mensajes');
    }
};

const enviarMensajesAll = async () => {
    const idTelefonos = [1012, 1011, 1010, 1009, 1008, 8, 7, 2];
    console.log("Iniciando el método de envío de mensajes a todos los teléfonos...");

    for (const idTelefono of idTelefonos) {
        const sessionState = ObtenerSesionWhatsapp(idTelefono);

        if (!sessionState) {
            console.log(`El teléfono ${idTelefono} no está conectado`);
            continue;
        }

        try {
            const messages = await ObtenerMensajes(idTelefono);

            if (messages.length === 0) {
                console.log(`No hay mensajes para enviar al teléfono ${idTelefono}`);
                continue;
            }

            // Divede los mensajes en lotes de 100
            const lotes = [];

            for (let i = 0; i < messages.length; i += 100) {
                lotes.push(messages.slice(i, i + 100));
            }

            console.log(`Lotes preparados para el envío al teléfono ${idTelefono}`);

            let delayMinutos = 1;

            for (let [index, lote] of lotes.entries()) {

                programarEnvioLotes(lote, idTelefono, delayMinutos, index + 1);

                delayMinutos += 30;
            }
        } catch (error) {
            console.error(`Error al enviar mensajes al teléfono ${idTelefono}:`, error);
        }
    }

    console.log('Proceso de envío iniciado para todos los teléfonos');
};

const enviarPrimerLote = async (lote, idTelefono) => {
    console.log(`Enviando lote de mensajes para el teléfono: ${idTelefono}...`);

    const dataPath = path.resolve(__dirname, '../Sesiones');

    const sessionState = ObtenerSesionWhatsapp(idTelefono);

    if (!sessionState) {
        return res.status(400)
            .send('El teléfono no está conectado');
    }

    const whatsappClient = new Client({
        authStrategy: new LocalAuth({
            clientId: `cliente-${idTelefono}`,
            dataPath: dataPath,
        }),
        puppeteer: { headless: true },
    });

    // Espera hasta que el cliente esté listo antes de proceder
    whatsappClient.once('ready', async () => {
        console.log('Cliente de WhatsApp listo y conectado.');

        let acu = 0
        for (const message of lote) {
            acu += 1

            const { numero, texto } = message;

            let numeroLimpio = numero.replace(/[^\d]/g, "");

            if (idTelefono == 1010) {
                if (numeroLimpio.startsWith("54") && !numeroLimpio.startsWith("549")) {
                    numeroLimpio = "549" + numeroLimpio.substring(2);
                }

                if (!numeroLimpio.startsWith("549")) {
                    numeroLimpio = "549" + numeroLimpio;
                }
            }

            const numeroFormateado = `${numeroLimpio}@c.us`;

            try {
                await whatsappClient.sendMessage(numeroFormateado, texto);
                console.log("Voy enviando =====>", acu)
                console.log(`Mensaje enviado a ${numeroFormateado}`);
                await ActualizarMensajes(message.id, 4);
            } catch (err) {
                console.error(`Error al enviar mensaje a ${numero}: ${err}`);
            }

            await new Promise(resolve => setTimeout(resolve, 15000));
        }

        console.log("============== TERMINO ====================")

        whatsappClient.destroy();
    });

    whatsappClient.on('qr', qr => {
        console.log('Código QR recibido', qr);
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
        whatsappClient.destroy();
    });

    try {
        await whatsappClient.initialize();
    } catch (err) {
        console.error('Error al inicializar la sesión de WhatsApp:', err);
    }
};

// const programarEnvioLotes = (lote, idTelefono, delayMinutos) => {
//     const delay = delayMinutos * 60 * 1000;

//     EnviarMensajesProgramadosQueue.add({ lote, idTelefono }, { delay });
// };

const programarEnvioLotes = (lote, idTelefono, delayMinutos, numeroLote) => {
    const delay = delayMinutos * 60 * 1000;

    EnviarMensajesProgramadosQueue.add({
        lote,
        idTelefono,
        idsMensajes: lote.map(mensaje => mensaje.id)
    }, { delay });

    console.log(`Lote ${numeroLote} para el teléfono ${idTelefono} programado con un retraso de ${delayMinutos} minutos`);
};

EnviarMensajesProgramadosQueue.process(async (job) => {
    const { lote, idTelefono } = job.data;

    await enviarPrimerLote(lote, idTelefono);
});

EnviarMensajesProgramadosQueue.on('completed', (job, result) => {
    const { idTelefono, idsMensajes } = job.data;

    idsMensajes.forEach(idMensaje => {
        console.log(`Se envió el mensaje con ID #${idMensaje} del teléfono #${idTelefono}`);
    });

    console.log(`Lote de mensajes para el teléfono #${idTelefono} completado. IDs de mensajes: [${idsMensajes.join(", ")}]`);
});

module.exports = { enviarMensajes, EnviarMensajesProgramadosQueue, enviarMensajesAll, programarEnvioLotes };