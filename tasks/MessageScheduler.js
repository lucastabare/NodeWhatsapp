const cron = require('node-cron');
const { ObtenerMensajes, ActualizarMensajesEncolado } = require('../src/Services/MessageService');
const { programarEnvioLotes } = require('../src/Controllers/MessageController');

async function verificarYEncolarMensajes() {
    try {
        const mensajesNuevos = await ObtenerMensajes({ estado: 'nuevo' });

        if (mensajesNuevos.length === 0) {
            console.log('No hay mensajes nuevos para encolar.');
            return;
        }

        const lotes = [];
        for (let i = 0; i < mensajesNuevos.length; i += 100) {
            lotes.push(mensajesNuevos.slice(i, i + 100));
        }

        let delayMinutos = 0; 

        for (const lote of lotes) {

            programarEnvioLotes(lote, delayMinutos);
            delayMinutos += 30; 

            // Actualizar el estado de los mensajes en el lote a 'encolado'
            for (const mensaje of lote) {
                await ActualizarMensajesEncolado(mensaje.id, { encolado: true });
            }
        }
    } catch (error) {
        console.error('Error al verificar y encolar mensajes:', error);
    }
}

// Configura el cron job para ejecutar cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
    console.log('Ejecutando tarea  cada 15 minutos');
    await verificarYEncolarMensajes();
});

module.exports = {
    verificarYEncolarMensajes, 
};