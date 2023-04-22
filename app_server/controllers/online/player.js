// Clase player
class Player {
  //Por ahora no necesitamos nada mas

  //--Atributos
  nickname;
  socket;
  currentCell;
  turnosPendientes;

  //--Constructor
  constructor(nickname, socket) {
    this.nickname = nickname;
    this.socket = socket;
    this.currentCell = 0; // rectángulo inicial
    this.turnosPendientes = 0;
  }

  //--Métodos
  getNickname() {
    return this.nickname;
  }

  getSocket() {
    return this.socket;
  }

  getCurrentCell() {
    return this.currentCell;
  }

  getTurnosPendientes(){
    return this.turnosPendientes;
  }
}

module.exports = Player;
