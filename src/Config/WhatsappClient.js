const { Client, LocalAuth } = require('whatsapp-web.js');

const IniciarWhatsApp = async (idTelefono) => {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: idTelefono,
      dataPath: "../Sessions"
    }),
    puppeteer: { headless: true },
  });

  await client.initialize();

  return client;
};

module.exports = { IniciarWhatsApp };