/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: game_logic\tablero.js
 * Descripción: Clase Tablero correspondiente al tablero del juego de la Oca.
 */
// Clase Tablero
class Tablero {
  constructor(celdas) {
    this.celdas = celdas;
  }

  // Recibe un indice y llama al método execute de la celda correspondiente
  execute(i) {
    i -= 1;
    return this.celdas[i].execute();
  }
}

module.exports = { Tablero };
