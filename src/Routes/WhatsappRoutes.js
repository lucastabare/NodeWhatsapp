const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/MessageController');
const qrController = require('../Controllers/QrController');
const sesionController = require('../Controllers/SessionContoller');

//API PARA GENERAR QR 
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

//API PARA ELIMINAR SAESION SEGUN TELEFONO
/**
 * @swagger
 * /api/whatsapp/EliminarSesion/{idTelefono}:
 *   delete:
 *     summary: Elimina la sesion guardada por id telefono.
 *     parameters:
 *       - in: path
 *         name: idTelefono
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sesion eliminada con exito.
 */

router.delete('/EliminarSesion/:idTelefono', sesionController.eliminarSession);

//API PARA ELIMNAR TODAS LAS SESIONES GUARDADAS
/**
 * @swagger
 * /api/whatsapp/EliminarSesion/{idTelefono}:
 *   delete:
 *     summary: Elimina todas las sesiones guardadas.
 *     parameters:
 *       - in: path
 *         name: idTelefono
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sesiones eliminadas con exito.
 */

router.delete('/EliminarSessiones/', sesionController.eliminarSessiones);

module.exports = router;