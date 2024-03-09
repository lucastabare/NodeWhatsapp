const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/MessageController'); // Verifica la ruta al controlador de mensajes
const qrController = require('../Controllers/QrController'); // Verifica la ruta al controlador de QR

/**
 * @swagger
 * /api/whatsapp/EnviarMensajes/{idTelefono}:
 *   post:
 *     summary: Envia mensajes de WhatsApp.
 *     parameters:
 *       - in: path
 *         name: idTelefono
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mensaje enviado con éxito.
 */

router.post('/EnviarMensajes/:idTelefono', messageController.enviarMensajes);

/**
 * @swagger
 * /api/whatsapp/GenerarQR/{idTelefono}:
 *   get:
 *     summary: Genera y muestra el código QR para iniciar sesión.
 *     parameters:
 *       - in: path
 *         name: idTelefono
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Código QR generado con éxito.
 */

router.get('/GenerarQR/:idTelefono', qrController.generarQR);

// Exportar el router para usarlo en app.js
module.exports = router;