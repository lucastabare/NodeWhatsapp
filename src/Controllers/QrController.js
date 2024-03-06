const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const generarQR = async (req, res) => {
    const idTelefono = req.params.idTelefono;

    // Aquí podrías agregar tu lógica para manejar diferentes sesiones basadas en idTelefono

    const client = new Client(); // Instancia del cliente de WhatsApp Web

    client.on('qr', (qr) => {
        // Generar QR y enviarlo como respuesta
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Error al generar el código QR', err);
                res.status(500).send('Error al generar el código QR');
            } else {
                // Enviar el QR como una imagen o en un iframe, dependiendo de tus necesidades
                res.send(`<img src="${url}" alt="Código QR">`);
            }
        });
    });

    client.initialize();
};

module.exports = {
    generarQR,
};