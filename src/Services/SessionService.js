const fs = require('fs');
const path = require('path');

const ObtenerSesionWhatsapp = (idTelefono) => {
    const sessionDir = path.join(__dirname, '../Sesiones', `session-cliente-${idTelefono}`);

    return fs.existsSync(sessionDir);
};

const ActualizarSesionWhatsApp = (idTelefono) => {
    const sessionDir = path.join(__dirname, '../Sesiones', `session-cliente-${idTelefono}`);
    const sessionFile = path.join(sessionDir, 'session.json'); // Nombre de archivo para los datos de sesión

    // Asegurarse de que el directorio de sesión existe
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

};

module.exports = { ObtenerSesionWhatsapp, ActualizarSesionWhatsApp };