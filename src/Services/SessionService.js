const fs = require('fs');
const SESSION_FILE_PATH = './Sesiones/';

const getSessionState = (idTelefono) => {
    const sessionFilePath = `${SESSION_FILE_PATH}${idTelefono}.json`;
    if (fs.existsSync(sessionFilePath)) {
        return { isConnected: true };
    }
    return { isConnected: false };
};

const updateSessionState = (idTelefono, state) => {
    const sessionStatePath = `${SESSION_FILE_PATH}${idTelefono}-state.json`;
    const stateData = JSON.stringify(state);
    fs.writeFileSync(sessionStatePath, stateData);
};

module.exports = { getSessionState, updateSessionState };