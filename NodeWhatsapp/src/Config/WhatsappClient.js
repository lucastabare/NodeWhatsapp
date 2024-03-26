const { Client, LocalAuth } = require('whatsapp-web.js');

const IniciarWhatsApp = (idTelefono, dataPath) => {
  return new Promise((resolve, reject) => {
    console.log("Tratando de iniciar");

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `cliente-${idTelefono}`,
        dataPath: dataPath
      }),
      puppeteer: { headless: true },
    });

    client.on('ready', () => {
      console.log('Cliente de WhatsApp listo.');
      resolve(client);
    });

    client.on('authenticated', () => {
      console.log('Cliente de WhatsApp autenticado.');
    });

    client.on('auth_failure', msg => {
      console.error('Fallo en la autenticación:', msg);
      reject(new Error('Fallo en la autenticación'));
    });

    client.on('disconnected', (reason) => {
      console.log('Cliente de WhatsApp desconectado:', reason);
      reject(new Error('Cliente de WhatsApp desconectado'));
    });

    client.initialize().catch(err => {
      console.error('Error al inicializar el cliente de WhatsApp:', err);
      reject(err);
    });
  });
};

module.exports = { IniciarWhatsApp };