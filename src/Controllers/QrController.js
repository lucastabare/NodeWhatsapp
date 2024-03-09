const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const sessionService = require('../Services/SessionService');
const qrconsole = require('qrcode-terminal')

const generarQR = async (req, res) => {
    const idTelefono = req.params.idTelefono;
    const sessionState = await sessionService.ObtenerSessionWhatsapp(idTelefono);

    if (sessionState && sessionState.isConnected) {
        return res.status(200).send('La sesión ya está activa. No es necesario escanear el QR nuevamente.');
    }

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: idTelefono }),
        puppeteer: { headless: true },
    });

    let responseSent = false;

    client.on('qr', (qr) => {
        if (!responseSent) {
            qrconsole.generate(qr, { small: true });
            qrcode.toDataURL(qr, async (err, url) => {
                if (err) {
                    console.error('Error al generar el código QR', err);
                    if (!responseSent) {
                        res.status(500).send('Error al generar el código QR');
                        responseSent = true;
                    }
                } else {
                    if (!responseSent) {
                        res.send(`<img src="${url}" alt="Código QR">`);
                        responseSent = true;
                        await sessionService.ActualizarSessionWhatsapp(idTelefono, { isConnected: false });
                    }
                }
            });
        }
    });

    client.on('ready', async () => {
        console.log('Cliente de WhatsApp listo y conectado');
        if (!responseSent) {
            res.status(200).send('El código QR fue escaneado con éxito, la sesión está ahora activa.');
            responseSent = true;
        }
        await sessionService.ActualizarSessionWhatsapp(idTelefono, { isConnected: true });
    });

    client.on('authenticated', (session) => {

        console.log("soy la session ==>>".session)

        sessionService.ActualizarSessionWhatsapp(idTelefono, session)
            .then(() => console.log('Sesión almacenada con éxito'))
            .catch(console.error);
    });

    client.on('disconnected', async (reason) => {
        console.log('Cliente desconectado', reason);
        await sessionService.ActualizarSessionWhatsapp(idTelefono, { isConnected: false });
    });

    client.initialize().catch(err => {
        console.error('Error al inicializar la sesión de WhatsApp', err);
        if (!responseSent) {
            res.status(500).send('Error al inicializar la sesión de WhatsApp');
            responseSent = true;
        }
    });
};

module.exports = {
    generarQR,
};