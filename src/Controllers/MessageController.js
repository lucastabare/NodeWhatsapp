const { fetchMessages } = require('../Services/MessageService');
const { getSessionState } = require('../Services/SessionService');
const { initializeWhatsAppClient } = require('../Config/WhatsappClient');

const enviarMensajes = async (req, res) => {
    const idTelefono = req.params.idTelefono;
    const sessionState = getSessionState(idTelefono);

    if (!sessionState.isConnected) {
        return res.status(400).send('El teléfono no está conectado');
    }

    try {
        const messages = await fetchMessages(idTelefono);
        const whatsappClient = initializeWhatsAppClient();

        // Aquí iría la lógica para enviar los mensajes utilizando whatsappClient

        res.send('Mensajes enviados');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar mensajes');
    }
};

module.exports = { enviarMensajes };