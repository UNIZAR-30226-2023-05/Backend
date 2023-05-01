// Clase player
class Player {
  //Por ahora no necesitamos nada mas

  //--Atributos
  nickname;
  socket;
  currentCell;
  turnosPendientes;
  estadisticas = {
    vecesOca: 0,
    vecesSeis: 0,
    vecesCalavera: 0
  }

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

  setCurrCell(cell) {
    this.currentCell = cell;
  }

  //--Métodos para estadísticas
  sumaOca(){
    this.estadisticas.vecesOca++;
  }

  sumaSeis(){
    this.estadisticas.vecesSeis++;
  }

  sumaCalavera(){
    this.estadisticas.vecesCalavera++;
  }

  actualizarEstadisticas(){
    //TODO: Actualizar las estadísticas en la base de datos
      //Si no existe, se crea, si no se actualiza
    //Comprobar logros
      //Actualizamos los logros del usuario
  }

}

module.exports = Player;
