//Tabla de conexiones

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
