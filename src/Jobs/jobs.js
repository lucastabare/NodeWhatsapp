const { enviarPrimerLote } = require('../Controllers/MessageController')

module.exports = async (job) => {
    console.log(`Inicio del trabajo 'Enviar Mensajes' con datos:`, job.data);
  
    const { lote, idTelefono } = job.data;
  
    // Aquí tu lógica para enviar el lote
    await enviarPrimerLote(lote, idTelefono);
  
    console.log(`Trabajo 'Enviar Mensajes' completado para el ID de teléfono: ${idTelefono}`);
  };