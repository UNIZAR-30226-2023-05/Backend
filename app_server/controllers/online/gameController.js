/* Controlador de partida para cada sala (suponiendo que la lógica de juego ya 
    está implementada). */

// const EstadoJuego = require("../../gameLogic/estadoJuego");
const { config } = require("../../../config");

const { shufflePlayers } = require("../../middleware/eleccionTurno");

class GameController {
  //--Atributos de clase--//
  room;
  roomLeader;
  tiempoDeTurno;

  //--Constructor--//
  constructor(room, roomLeader, tiempoDeTurno, socketServer) {
    this.room = room;
    this.roomLeader = roomLeader;
    this.tiempoDeTurno = tiempoDeTurno;

    this.socketServer = socketServer;

    this.estadoJuego = new EstadoJuego();

    this.ackTurno = false; //ack para saber si es el turno del usuario

    this.start = false; //ack para saber si la partida ha empezado

    this.currentTurn = 0; //turno actual
    this.ordenTurnos = []; //orden de turnos
  }

  //Comienzo de partida
  empezarPartida() {
    let numUsers = this.room.getNumPlayers();
    //Se envía a todos los jugadores el estado del juego
    //...

    let users = this.room.getPlayers();
    //Se barajan los jugadores
    this.ordenTurnos = shufflePlayers(users, numUsers);

    //Se envía un mensaje a todos los jugadores de la sala con el nuevo orden the turnos
    this.socketServer.to(this.room.roomId).emit("ordenTurnos", {
      ordenTurnos: this.ordenTurnos,
      tiempo: this.tiempoDeTurno,
    });
  }

  sigTurno() {
    //Si no ha empezado la partida no se puede pasar de turno
    if (!this.start) {
      throw new Error("La partida no ha empezado");
    }

    //console.log("sigTurno");

    this.ackTurno = false; //ack para saber si es el turno del usuario
    this.currentTurn = (this.currentTurn + 1) % this.ordenTurnos.length; //turno actual
    //Enviar mensaje a todos los jugadores de la sala con el nuevo turno
    this.socketServer.to(this.room.roomId).emit("sigTurno", {
      turno: this.ordenTurnos[this.currentTurn],
      tiempo: this.tiempoDeTurno,
    });

    //console.log("sigTurno");
  }

  tirarDados(user) {
    //El usuario tira un dado y y devuelve la celda en la que cae
    let valor = Math.floor(Math.random() * 6) + 1;

    //Aquí dentro se harán comprobaciones necesarias --> calcula la nueva celda ??? (necesario??)
    let nuevaCelda = this.estadoJuego.siguienteCelda(user.currentCell, valor);

    return { nuevaPos };
  }

  moverFicha(user, numCeldaDestino) {
    //Comprobar si es el turno
    if (this.ordenTurnos[this.currentTurn] != user.nickname) {
      throw new Error("No es tu turno");
      // return;
    }

    //Si estas penalizado no puedes mover ficha
    if (user.getTurnosPendientes() > 0) {
      // Se resta uno al número de turnos que le quedan pendientes al jugador
      user.turnosPendientes--;

      // Sumar 1 al turno 
      this.currentTurn = (this.currentTurn + 1) % this.ordenTurnos.length; //turno actual
      
      //Enviar mensaje a todos los jugadores de la sala con el nuevo turno
      this.socketServer.to(this.room.roomId).emit("sigTurno", {
        turno: this.ordenTurnos[this.currentTurn],
        tiempo: this.tiempoDeTurno,
      });

      return;
    }

    //-->Entran en juego las reglas del juego
    let celdaNueva = this.estadoJuego.moverUsuario(user, numCeldaDestino); //esta sí

    //Entonces ahora comprobamos cosas:
    //Juego de la oca
    //Si la celda es una oca, se mueve la ficha a la siguiente oca
    if (celdaNueva.tipo == "oca") {
      nuevaPos = this.estadoJuego.haCaidoOca(celdaNueva.id);
      celdaNueva = this.estadoJuego.moverUsuario(user, nuevaPos);
      //Tirar de nuevo los dados
      let { nuevaPosicion } = this.tirarDados(user); // ??
    }

    // Si es una celda de penalización, se mueve la ficha a la celda de salida
    if (celdaNueva.tipo == "pozo") {
      // El usuario estará penalizado durante ?? turnos
      this.user.turnosPendientes = 2; // ??
      celdaNueva = this.estadoJuego.moverFicha(user, 0);
    }

    // Si es una celda de cárcel, lo mismo
    if (celdaNueva.tipo == "carcel") {
        // El usuario estará penalizado durante ?? turnos
        this.user.turnosPendientes = 2; // ??
        celdaNueva = this.estadoJuego.moverFicha(user, 0);
    }

    //Si es una celda de puente, se mueve la ficha a la celda de destino del puente
    if (celdaNueva.tipo == "puente") {
      celdaNueva = this.estadoJuego.moverFicha(user, celdaNueva.destino);
    } else {
      //Si no es ninguna de las anteriores, se termina el turno
      this.sigTurno();
    }

    

    //Se envía a todos los jugadores el estado del juego
    //...
  }

  turnoActual() {
    return this.currentTurn;
  }

  async comenzarTurno(user) {
    //Comprobar si es el turno
    if (this.ordenTurnos[this.currentTurn] == user.nickname) {
      throw new Error("No es tu turno");
      // return;
    }
    //Si es el turno del usuario no puede empezar el turno (ya lo ha hecho)
    else if (this.ackTurno) {
      throw new Error("Ya has empezado el turno");
      // return;
    }

    //mas condiciones...

    this.ackTurno = true; //ack para saber si es el turno del usuario

    //... más cosas
  }
}

module.exports = { GameController };
