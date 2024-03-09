const { Client, LocalAuth } = require('whatsapp-web.js');
const { ObtenerSessionWhatsapp } = require('../Services/SessionService');

const IniciarWahtsapp = async (idTelefono) => {
    const sessionData = await ObtenerSessionWhatsapp(idTelefono); 

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: idTelefono,
            session: sessionData ? JSON.parse(sessionData) : undefined, 
        }),
        puppeteer: { headless: true },
    });

    await client.initialize();
    return client;
};

module.exports = { IniciarWahtsapp };