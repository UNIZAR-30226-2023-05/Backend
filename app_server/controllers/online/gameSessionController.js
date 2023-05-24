/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\controllers\online\gameSessionController.js
 * Descripción: Controlador de la tabla de conexiones de usuarios.
 */
class GameSessionController {
  sessions; //tabla "diccionario" de sesiones

  constructor() {
    this.sessions = {};
  }

  //Cada vez que un usuario se conecta
  addSession(user, socket) {
    this.sessions[user.nickname] = socket;
  }

  getSocket(user) {
    return this.sessions[user.nickname];
  }

  //Cada vez que un usuario se desconecta
  deleteSession(user) {
    delete this.sessions[user.nickname];
  }

  isConnected(user) {
    return user.nickname in this.sessions;
  }
}

module.exports = GameSessionController;
