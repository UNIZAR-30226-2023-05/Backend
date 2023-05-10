/**
 *
 * @param {*} socket
 * @param {*} io
 * @param {*} sessionStorage
 */
const gameSessionHandler = (socket, sessionStorage, io) => {
  //Primera función: Cuando un usuario se conecta, manda
  //un mensaje (de forma automatica) al servidor con sus "datos" --> por ahora nickname (mas adelante token???)
  //y se añade a la lista de usuarios conectados (sessionStorage)
  function openSession(user, callback) {
    //Se añade el usuario a la lista de usuarios conectados
    if (sessionStorage.isConnected(user)) {
      callback({
        ok: false,
        message: "Ya existe una sesión abierta con ese usuario",
      });
    } else {
      sessionStorage.addSession(user, socket);
      callback({
        ok: true,
        message: "Entraste en el videojuego",
      });
    }

    // console.log(sessionStorage.sessions)
  }

  //Segunda función: Cuando un usuario se desconecta, se elimina de la lista de usuarios conectados
  function closeSession(user, callback) {
    //Se elimina el usuario de la lista de usuarios conectados
    if (sessionStorage.isConnected(user)) {
      sessionStorage.deleteSession(user);
      callback({
        ok: true,
        message: "Saliste del videojuego",
      });
    } else {
      callback({
        ok: false,
        message: "No existe una sesión abierta con ese usuario",
      });
    }
  }

  //--------------------------------------------
  //Se escuchan los eventos de conexión y desconexión
  socket.on("openSession", openSession);
  socket.on("closeSession", closeSession);
};

module.exports = gameSessionHandler;
