const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const initializeWhatsAppClient = () => {
    const whatsappClient = new Client();

    whatsappClient.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    whatsappClient.on('ready', () => {
        console.log('Cliente de WhatsApp listo');
    });

    whatsappClient.initialize();

    return whatsappClient;
};

module.exports = { initializeWhatsAppClient };