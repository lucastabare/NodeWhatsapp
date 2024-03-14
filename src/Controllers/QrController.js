const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const sessionService = require('../Services/SessionService');
const qrconsole = require('qrcode-terminal')
const path = require('path');

const generarQR = async (req, res) => {
    console.log("aca estoy")
    const dataPath = path.resolve(__dirname, '../Sesiones');

    const idTelefono = req.params.idTelefono;

    if (sessionService.ObtenerSesionWhatsapp(idTelefono)) {
        return res.status(200)
            .send('La sesión ya está activa. No es necesario escanear el QR nuevamente.');
    }

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `cliente-${idTelefono}`,
            dataPath: dataPath
        }),
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
                        res.send(`< img src = "${url}" alt = "Código QR" > `);
                        responseSent = true;
                    }
                }
            });
        }
    });

    client.on('ready', async () => {
        console.log('Cliente de WhatsApp listo y conectado');
        if (!responseSent) {
            client.destroy();
            res.status(200)
                .send('El código QR fue escaneado con éxito, la sesión está ahora activa.');
            responseSent = true;
            client.destroy();
        }
    });

    client.on('authenticated', (session) => {
        console.log("LOGEADO CON EXITO ==>", session)
    });

    client.on('disconnected', async (reason) => {
        console.log('Cliente desconectado', reason);
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