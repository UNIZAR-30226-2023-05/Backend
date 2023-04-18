// Clase player
class Player {
  //Por ahora no necesitamos nada mas

  //--Atributos
  nickname;
  socket;

  //--Constructor
  constructor(nickname, socket) {
    this.nickname = nickname;
    this.socket = socket;
  }

  //--Métodos
  getNickname() {
    return this.nickname;
  }

  getSocket() {
    return this.socket;
  }
}

module.exports = Player;
