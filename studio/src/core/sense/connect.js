import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.20.0.json';
import mixins from './mixins';

const defaultConnection = 'ws://localhost:9076/app/engineData';
let connection = 'ws://localhost:9076/app/engineData';
let session;

const connect = function enigmaConnect(appId) {
  const newConnection =
    typeof appId === 'undefined' ? connection : connection.replace('engineData', encodeURIComponent(appId));
  if (!session) {
    session = enigma.create({
      schema,
      mixins,
      connection: newConnection,
      createSocket: () => {
        const ws = new WebSocket(newConnection);
        ws.onerror = function enigmaOnError(e) {
          console.log(e); // eslint-disable-line no-console
          e.preventDefault();
        };
        return ws;
      },
    });
  }
  return session.open();
};

function setConnection(v) {
  if (connection !== v) {
    connection = v || defaultConnection;
    if (session) {
      session.close();
      session = null;
    }
  }
}

function closeConnection() {
  if (session) {
    session.close();
    session = null;
  }
}

export default {
  setConnection,
  getDocs: () => connect().then((global) => global.getDocList()),
  openApp: (appId) => {
    closeConnection();
    return connect(appId).then((global) => global.openDoc(appId));
  },
};
