const fs = require('fs');
const path = require('path');
const { ObtenerSesionWhatsapp } = require('../Services/SessionService');

const eliminarSession = async (req, res) => {
    const idTelefono = req.params.idTelefono;
    const sessionDir = path.join(__dirname, '../Sesiones', `session-cliente-${idTelefono}`);

    if (ObtenerSesionWhatsapp(idTelefono)) {
        fs.rm(sessionDir, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error('Error al eliminar la sesión:', err);
                return res.status(500).send('Error al eliminar la sesión');
            }
            res.status(200).send('Sesión eliminada, para volver a iniciar escanee el QR');
        });
    } else {
        res.status(400).send('La sesión no existe, no se puede eliminar');
    }
};

const eliminarSessiones = async (req, res) => {
    const sessionsDir = path.join(__dirname, '../Sesiones');

    fs.rm(sessionsDir, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error al eliminar las sesiones:', err);
            return res.status(500).send('Error al eliminar las sesiones');
        }
        res.status(200).send('Todas las sesiones han sido eliminadas, para volver a iniciar escanee el QR');
    });
};

module.exports = { eliminarSession, eliminarSessiones };
