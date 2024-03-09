const express = require('express');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Config/Swagger');
const whatsappRoutes = require('./Routes/WhatsappRoutes');

const app = express();
const port = 3000;

// Middleware para analizar JSON entrante
app.use(express.json());

// Configurar Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Utilizar tus rutas de WhatsApp con el prefijo '/api/whatsapp'
app.use('/api/whatsapp', whatsappRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(process.env.DB_SERVER);
});