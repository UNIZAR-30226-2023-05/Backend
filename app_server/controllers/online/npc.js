/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\controllers\online\npc.js
 * Descripción: Clase bot que solamente se invocará si no se ha comletado el
 * tamaño de la sala con jugadores humanos.
 */
class NPC {
  constructor(nickname) {
    this.nickname = nickname;
    this.currentCell = 0; // rectángulo inicial
    this.turnosPendientes = 0;
  }

  getNickname() {
    return this.nickname;
  }

  getCurrentCell() {
    return this.currentCell;
  }

  getTurnosPendientes() {
    return this.turnosPendientes;
  }

  setCurrCell(cell) {
    this.currentCell = cell;
  }

  setTurnosPendientes(turnos) {
    this.turnosPendientes = turnos;
  }
}

module.exports = NPC;
