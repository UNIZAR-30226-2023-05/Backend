// Clase celda
class Celda {
    constructor(id, nueva, turno, turnosperdidos) {
        this.id = id; //Número de la celda en el tablero
        this.nueva = nueva; //Número de la nueva casilla en la que se encuentra
        this.turno = turno; //Booleano que indica si se vuelve a tener el turno o no
        this.turnosperdidos = turnosperdidos; //Número de turnos perdidos
    }
    
    // Método execute. Será implementado por las clases hijas.
    execute() {
        return [this.nueva, this.turno, this.turnosperdidos]
    }
}

class CeldaNormal extends Celda {
    constructor(id) {
        super(id, id, false, 0); //No avanza ni retrocede,no se vuelve a tener el turno y no se pierde ningún turno adicional
    }
}

class CeldaOca extends Celda{
    constructor(id) {
        switch (id) {
            case 5:
                super(id, 9, true, 0);
                break;
            case 9:
                super(id, 14, true, 0);
                break;
            case 14:
                super(id, 18, true, 0);
                break;
            case 18:
                super(id, 23, true, 0);
                break;
            case 23:
                super(id, 27, true, 0);
                break;
            case 27:
                super(id, 32, true, 0);
                break;
            case 32:
                super(id, 36, true, 0);
                break;
            case 36:
                super(id, 41, true, 0);
                break;
            case 41:
                super(id, 45, true, 0);
                break;
            case 45:
                super(id, 50, true, 0);
                break;
            case 50:
                super(id, 54, true, 0);
                break;
            case 54:
                super(id, 59, true, 0);
                break;
            case 59:
                super(id, 63, true, 0);
                break;
            default:
                throw new Error("Error: el id de la celda no es válido");
                break;
        }
    }
}

class CeldaPuente extends Celda {
    constructor(id) {
        switch(id){
            case 6:
                super(id, 12, true, 0);
                break;
            case 12:
                super(id, 6, true, 0);
                break;
            default:
                throw new Error("Error: el id de la celda no es válido");
                break;
        }
    }
}

class CeldaPosada extends Celda {
    constructor(id) {
        super(id, id, false, 1);
    }
}

class CeldaPozo extends Celda {
    constructor(id) {
        super(id, id, false, 2);
    }
}

class CeldaLaberinto extends Celda {
    constructor(id) {
        super(id, id, false, 3);
    }
}

class CeldaCarcel extends Celda {
    constructor(id) {
        super(id, id, false, 4);
    }
}

class CeldaDados extends Celda {
    constructor(id) {
        if(id == 53) {
            super(id, 26, true, 0);
        }
        else if(id == 26) {
            super(id, 53, true, 0);
        }
        else {
            throw new Error("Error: el id de la celda no es válido");
        }
    }
}

class CeldaCalavera extends Celda {
    constructor(id) {
        super(id, 1, false, 0);
    }
}

// La casilla final programarla como una casilla normal que se necesita num exacto y si no se retrocede
// Hacer esto en el controlador del juego

module.exports = { CeldaNormal, CeldaOca, CeldaPuente, CeldaPosada, CeldaPozo, 
    CeldaLaberinto, CeldaCarcel, CeldaDados, CeldaCalavera };