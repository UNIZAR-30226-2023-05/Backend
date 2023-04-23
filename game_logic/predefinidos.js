import {Tablero} from "./tablero.js";
import {CeldaNormal, CeldaOca, CeldaPuente, CeldaPosada, CeldaPozo, 
    CeldaLaberinto, CeldaCarcel, CeldaDados, CeldaCalavera} from "./celda.js";

function tableroClasico (){
    let celdas = [];
    for (let i = 0; i < 63; i++) {
        // La casilla 1 pese a a ser una oca se trata como una casilla normal.
        if (i == 5 || i == 9 || i == 14 || i == 18 || i == 23 || 
            i == 27 || i == 32 || i == 36 || i == 41 || i == 45 || i == 50 || 
            i == 54 || i == 59) {
            celdas.push(new CeldaOca(i));
        } else if (i == 6 || i == 12) {
            celdas.push(new CeldaPuente(i));
        } else if (i == 19) {
            celdas.push(new CeldaPosada(i));
        } else if (i == 31) {
            celdas.push(new CeldaPozo(i));
        } else if (i == 42) {
            celdas.push(new CeldaLaberinto(i));
        } else if (i == 56) {
            celdas.push(new CeldaCarcel(i));
        } else if (i == 26 || i == 53) {
            celdas.push(new CeldaDados(i));
        } else if (i == 58) {
            celdas.push(new CeldaCalavera(i));
        } else {
            celdas.push(new CeldaNormal(i));
        }
    }
    return new Tablero(celdas);
}

export {tableroClasico};