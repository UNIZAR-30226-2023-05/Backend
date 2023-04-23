// Clase Tablero
class Tablero {
    constructor(celdas) {
        this.celdas = celdas;
    }

    // Recibe un indice y llama al método execute de la celda correspondiente
    execute(i) {
        i += 1;
        return this.celdas[i].execute();
    }
}

module.exports = Tablero;