const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/MessageController'); // Verifica la ruta al controlador de mensajes
const qrController = require('../Controllers/QrController'); // Verifica la ruta al controlador de QR

// Definir una ruta POST para enviar mensajes de WhatsApp
router.post('/send/:idTelefono', messageController.enviarMensajes);

// Definir una ruta GET para generar y mostrar el código QR
router.get('/armar-qr/:idTelefono', qrController.generarQR);

// Exportar el router para usarlo en app.js
module.exports = router;