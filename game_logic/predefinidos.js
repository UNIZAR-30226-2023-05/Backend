/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: game_logic\predefinidos.js
 * Descripción: Definición del tablero clásico con sus celdas predefinidas.
 */
var Tablero = require("./tablero.js");
var Celda = require("./celda.js");

function tableroClasico() {
  let celdas = [];
  for (let i = 1; i <= 63; i++) {
    // La casilla 1 pese a a ser una oca se trata como una casilla normal.
    if (
      i == 5 ||
      i == 9 ||
      i == 14 ||
      i == 18 ||
      i == 23 ||
      i == 27 ||
      i == 32 ||
      i == 36 ||
      i == 41 ||
      i == 45 ||
      i == 50 ||
      i == 54 ||
      i == 59
    ) {
      celdas.push(new Celda.CeldaOca(i));
    } else if (i == 6 || i == 12) {
      celdas.push(new Celda.CeldaPuente(i));
    } else if (i == 19) {
      celdas.push(new Celda.CeldaPosada(i));
    } else if (i == 31) {
      celdas.push(new Celda.CeldaPozo(i));
    } else if (i == 42) {
      celdas.push(new Celda.CeldaLaberinto(i));
    } else if (i == 56) {
      celdas.push(new Celda.CeldaCarcel(i));
    } else if (i == 26 || i == 53) {
      celdas.push(new Celda.CeldaDados(i));
    } else if (i == 58) {
      celdas.push(new Celda.CeldaCalavera(i));
    } else {
      celdas.push(new Celda.CeldaNormal(i));
    }
  }
  return new Tablero.Tablero(celdas);
}

module.exports = { tableroClasico };
