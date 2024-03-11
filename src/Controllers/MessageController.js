const { Client, LocalAuth } = require('whatsapp-web.js');
const { ObtenerMensajes, ActualizarMensajes } = require('../Services/MessageService');
const { ObtenerSesionWhatsapp } = require('../Services/SessionService');
const path = require('path');

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

            if (messages.length === 0) {
                whatsappClient.destroy();
                return res.status(200)
                    .send('No hay mensajes para enviar');
            }

            for (let message of messages) {
                const { numero, texto, id } = message;

                let numeroLimpio = numero.replace(/[^\d]/g, "");
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

            whatsappClient.destroy();
            res.status(200)
                .send('Mensajes enviados');

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