const { ObtenerMensajes, ActualizarMensajes } = require('../Services/MessageService');
const { ObtenerSessionWhatsapp } = require('../Services/SessionService');
const { IniciarWahtsapp } = require('../Config/WhatsappClient');

const enviarMensajes = async (req, res) => {
    const idTelefono = req.params.idTelefono;

    try {
        const sessionState = await ObtenerSessionWhatsapp(idTelefono);

        if (!sessionState.isConnected) {
            return res.status(400).send('El teléfono no está conectado');
        }

        const whatsappClient = await IniciarWahtsapp(idTelefono);
        const messages = await ObtenerMensajes(idTelefono);
        console.log("soy los mensajes ==>", messages)

        for (let message of messages.slice(0, 100)) {
            const { numero, texto, id } = message;
            let numeroLimpio = message.numero.charAt(0) === '+' ? '+' + message.numero.slice(1).replace(/[^0-9]/g, '') : message.numero.replace(/[^0-9]/g, '');
            // Asegúrate de que el número esté en formato internacional completo y añade '@c.us'
            let numeroFormateado = numeroLimpio.includes('@c.us') ? numeroLimpio : `${numeroLimpio}@c.us`;

            try {
                await whatsappClient.sendMessage(numeroFormateado, texto);
                console.log(`Mensaje enviado a ${numero}`);

                await ActualizarMensajes(id, 4);

                // Introduce un retraso de 15 segundos antes de enviar el próximo mensaje
                await new Promise(resolve => setTimeout(resolve, 15000));

            } catch (err) {
                console.error(`Error al enviar mensaje a ${numero}: ${err}`);
            }
        }

        res.send('Mensajes enviados');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar mensajes');
    }
};

module.exports = { enviarMensajes };