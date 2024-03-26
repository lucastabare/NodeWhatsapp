const express = require('express');
require('dotenv').config();
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const serverAdapter = new ExpressAdapter();
const cors = require('cors'); 
const { Queue } = require('bullmq');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Config/Swagger');
const whatsappRoutes = require('./Routes/WhatsappRoutes');
const Bree = require('bree');
const path = require('path');

const app = express();
const port = 3000;
const queueMQ = new Queue('EnviarMensajesProgramadosQueue');

//CORS
app.use(cors({
  origin: '*' 
}));

// Middleware para analizar JSON entrante
app.use(express.json());

// Configurar Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Utilizar tus rutas de WhatsApp con el prefijo '/api/whatsapp'
app.use('/api/whatsapp', whatsappRoutes);

// Bull Ui
// createBullBoard({ queues: [new BullMQAdapter(queueMQ)], serverAdapter });
// serverAdapter.setBasePath('/jobs');
// app.use('/jobs', serverAdapter.getRouter());

// Bree
const bree = new Bree({
  jobs: [
    {
      name: 'job',
      path: path.join(__dirname,'src', 'Jobs', 'job'),
      interval: '1m' // Intervalo de ejemplo, ajusta según sea necesario
    }
  ]
});

// Evento disparado cuando un worker (trabajo) es creado
bree.on('worker created', (name) => {
  console.log(`Worker creado para el trabajo: ${name}`);
});

// Evento disparado cuando un worker (trabajo) ha iniciado
bree.on('worker started', (name) => {
  console.log(`Worker iniciado para el trabajo: ${name}`);
});

// Evento disparado cuando un worker (trabajo) es eliminado
bree.on('worker deleted', (name) => {
  console.log(`Worker eliminado para el trabajo: ${name}`);
});

// Evento disparado cuando un trabajo ha finalizado
bree.on('job done', (name) => {
  console.log(`Trabajo completado: ${name}`);
});

// No olvides iniciar Bree
bree.start();

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Listo ===> corriendo en http://localhost:${port}`);
});

