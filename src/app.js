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

const app = express();
const port = 3000;
const queueMQ = new Queue('EnviarMensajesProgramadosQueue');

//CORS
app.use(cors());

// Middleware para analizar JSON entrante
app.use(express.json());

// Configurar Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Utilizar tus rutas de WhatsApp con el prefijo '/api/whatsapp'
app.use('/api/whatsapp', whatsappRoutes);

// Bull Ui
createBullBoard({ queues: [new BullMQAdapter(queueMQ)], serverAdapter });
serverAdapter.setBasePath('/jobs');
app.use('/jobs', serverAdapter.getRouter());


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Listo ===> corriendo en http://localhost:${port}`);
});

