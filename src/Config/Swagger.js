const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de WhatsApp',
      version: '1.0.0',
      description: 'Una API para enviar mensajes de WhatsApp y gestionar sesiones.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Asegúrate de usar el puerto correcto en el que se ejecuta tu servidor
      },
    ],
  },
  apis: ['./src/Routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;