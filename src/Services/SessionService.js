const fs = require('fs');
const path = require('path');

const ObtenerSesionWhatsapp = (idTelefono) => {
    const sessionDir = path.join(__dirname, '../Sesiones', `session-cliente-${idTelefono}`);

    return fs.existsSync(sessionDir);
};

const ActualizarSesionWhatsApp = (idTelefono) => {
    console.log("soy la session en el actualizar =>")
    const sessionDir = path.join(__dirname, '../Sesiones', `session-cliente-${idTelefono}`);
    const sessionFile = path.join(sessionDir, 'session.json'); // Nombre de archivo para los datos de sesión

    // Asegurarse de que el directorio de sesión existe
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Escribir los datos de sesión en el archivo
    //fs.writeFile(sessionFile);
};


module.exports = { ObtenerSesionWhatsapp, ActualizarSesionWhatsApp };