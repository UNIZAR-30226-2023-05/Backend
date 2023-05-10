// Clase celda
class Celda {
  constructor(id, nueva, turno, penalizacion, caidoOca, caidoCalavera) {
    this.id = id; //Número de la celda en el tablero
    this.nueva = nueva; //Número de la nueva casilla en la que se encuentra
    this.turno = turno; //Booleano que indica si se vuelve a tener el turno o no
    this.penalizacion = penalizacion; //Número de turnos perdidos
    this.caidoOca = caidoOca; //Booleano que indica si se ha caído en una oca
    this.caidoCalavera = caidoCalavera; //Booleano que indica si se ha caído en una calavera
  }

  // Método execute. Será implementado por las clases hijas.
  execute() {
    return {
      nueva: this.nueva,
      turno: this.turno,
      penalizacion: this.penalizacion,
      caidoOca: this.caidoOca,
      caidoCalavera: this.caidoCalavera,
    };
  }
}

class CeldaNormal extends Celda {
  constructor(id) {
    super(id, id, false, 0, false, false); //No avanza ni retrocede,no se vuelve a tener el turno y no se pierde ningún turno adicional
  }
}

class CeldaOca extends Celda {
  constructor(id) {
    switch (id) {
      case 5:
        super(id, 9, true, 0, true, false);
        break;
      case 9:
        super(id, 14, true, 0, true, false);
        break;
      case 14:
        super(id, 18, true, 0, true, false);
        break;
      case 18:
        super(id, 23, true, 0, true, false);
        break;
      case 23:
        super(id, 27, true, 0, true, false);
        break;
      case 27:
        super(id, 32, true, 0, true, false);
        break;
      case 32:
        super(id, 36, true, 0, true, false);
        break;
      case 36:
        super(id, 41, true, 0, true, false);
        break;
      case 41:
        super(id, 45, true, 0, true, false);
        break;
      case 45:
        super(id, 50, true, 0, true, false);
        break;
      case 50:
        super(id, 54, true, 0, true, false);
        break;
      case 54:
        super(id, 59, true, 0, true, false);
        break;
      case 59:
        super(id, 63, true, 0, true, false);
        break;
      default:
        throw new Error("Error: el id de la celda no es válido");
        break;
    }
  }
}

class CeldaPuente extends Celda {
  constructor(id) {
    switch (id) {
      case 6:
        super(id, 12, true, 0, false, false);
        break;
      case 12:
        super(id, 6, true, 0, false, false);
        break;
      default:
        throw new Error("Error: el id de la celda no es válido");
        break;
    }
  }
}

class CeldaPosada extends Celda {
  constructor(id) {
    super(id, id, false, 1, false, false);
  }
}

class CeldaPozo extends Celda {
  constructor(id) {
    super(id, id, false, 2, false, false);
  }
}

class CeldaLaberinto extends Celda {
  constructor(id) {
    super(id, id, false, 3, false, false);
  }
}

class CeldaCarcel extends Celda {
  constructor(id) {
    super(id, id, false, 4, false, false);
  }
}

class CeldaDados extends Celda {
  constructor(id) {
    if (id == 53) {
      super(id, 26, true, 0, false, false);
    } else if (id == 26) {
      super(id, 53, true, 0, false, false);
    } else {
      throw new Error("Error: el id de la celda no es válido");
    }
  }
}

class CeldaCalavera extends Celda {
  constructor(id) {
    super(id, 1, false, 0, false, true);
  }
}

// La casilla final programarla como una casilla normal que se necesita num exacto y si no se retrocede
// Hacer esto en el controlador del juego

module.exports = {
  CeldaNormal,
  CeldaOca,
  CeldaPuente,
  CeldaPosada,
  CeldaPozo,
  CeldaLaberinto,
  CeldaCarcel,
  CeldaDados,
  CeldaCalavera,
};
