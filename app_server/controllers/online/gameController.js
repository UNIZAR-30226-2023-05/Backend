/* Controlador de partida para cada sala (suponiendo que la lógica de juego ya 
    está implementada). */

const predefinidos = require("../../../game_logic/predefinidos");
const { Console } = require("winston/lib/winston/transports");
const { config } = require("../../../config");

// const { shufflePlayers } = require("../../utils/eleccionTurno");

class GameController {
  //--Atributos de clase--//
  room; //objeto de la clase Room
  roomLeader;
  tiempoDeTurno;

  //--Constructor--//
  constructor(room, tiempoDeTurno, socketServer) {
    this.room = room;
    this.tiempoDeTurno = tiempoDeTurno;   //tiempo de turno en segundos 12*60*60 = 12 horas
    this.currentTurnTimeout = null;       //timeout para el turno actual

    this.socketServer = socketServer;

    // Aquí hay que poner el tablero predefinido para juego clásico
    this.tablero = new predefinidos.tableroClasico(); //tablero de juego

    this.ackTurno = false;          //ack para saber si es el turno del usuario

    this.start = false;             //ack para saber si la partida ha empezado

    this.finalPartida = false;      //ack para saber si la partida ha terminado

    this.currentTurn = 0;           //turno actual
    this.ordenTurnos = [];          //orden de turnos
  }

  //Información general de partida (inicio)
  // getGameInfo() {
  //   return {
  //     roomId: this.room.roomId,
  //     roomName: this.room.roomName,
  //     gamemode: this.room.gamemode,
  //     numPlayers: this.room.numPlayers,
  //     roomLeader: this.room.roomLeader,
  //     players: this.room.players,
  //     startTime: this.room.startTime,
  //     start: this.start,
  //     finalPartida: this.finalPartida,
  //     currentTurn: this.currentTurn,
  //     ordenTurnos: this.ordenTurnos,
  //     tiempoDeTurno: this.tiempoDeTurno,
  //   };

  // }


  //Comienzo de partida
  empezarPartida() {

    //Llamara a sigTurno() cuando se acabe el tiempo de turno
    //Se queda "durmiendo" hasta que pase el tiempo o el usuario haga un movimiento -> clearTimeout(this.currentTurnTimeout);
    this.currentTurnTimeout = setTimeout(() => {
      this.sigTurno();
    }, this.tiempoDeTurno * 1000);


    //Array con los nicknames de los jugadores
    let users = this.room.getPlayers();

    // console.log(users);
    let roomID = this.room.getRoomId();

    const numUsuarios = Object.keys(users).length;

    const shufflePlayers = Object.values(users).sort(() => Math.random() - 0.5);
    
    //Nos quedamos con los nicknames de los jugadores
    for (let i = 0; i < numUsuarios; i++) {
      this.ordenTurnos.push(shufflePlayers[i].getNickname());
    }

    console.log("Orden de turnos: " + this.ordenTurnos);



    //Se envía un mensaje a todos los jugadores de la sala con el nuevo orden the turnos
    console.log("Envio orden de turnos a la sala " + roomID);
    this.socketServer.to(roomID).emit("ordenTurnos", {
      ordenTurnos: this.ordenTurnos,
      tiempo: this.tiempoDeTurno,
    });

    console.log("Turnos barajados");
    this.start = true;

    //Llamar a sigTurno()?
  }

  sigTurno() {
    //Si no ha empezado la partida no se puede pasar de turno
    if (!this.start) {
      throw new Error("La partida no ha empezado");
    }

    //Si la partida ha terminado no se puede pasar de turno
    if (this.finalPartida) {
      throw new Error("La partida ha terminado");
    }

    //Control de tiempo de turno
    if (this.currentTurnTimeout != null) {
      clearTimeout(this.currentTurnTimeout);
    }


    //Llamara a sigTurno() cuando se acabe el tiempo de turno
    //Se queda "durmiendo" hasta que pase el tiempo o el usuario haga un movimiento -> clearTimeout(this.currentTurnTimeout);
    this.currentTurnTimeout = setTimeout(() => {
      this.sigTurno();
    }, this.tiempoDeTurno * 1000);



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

  //bool: has game started?
  isGameStarted() {
    return this.start;
  }

  tirarDados(user) {
    
    //Si no ha empezado la partida no se puede tirar dados
    if (!this.start) {
      throw new Error("La partida no ha empezado");
    }

    //Si la partida ha terminado no se puede tirar dados
    if (this.finalPartida) {
      throw new Error("La partida ha terminado");
    }


    //El usuario tira un dado y y devuelve la celda en la que cae
    let valor = Math.floor(Math.random() * 6) + 1;

    //Aquí dentro se harán comprobaciones necesarias --> calcula la nueva celda ??? (necesario??)
    let nuevaCelda = user.getCurrentCell() + valor

    

    let haLlegado

    //Comprobar si ha llegado al final
    if (nuevaCelda == 63) {
      haLlegado = true;
    } else if (nuevaCelda > 63) {
      nuevaCelda = 63 - (nuevaCelda % 63);  //Te has pasado de la meta
      haLlegado = false;
    }
    else {
      haLlegado = false;
    }

    console.log({ valor, nuevaCelda, haLlegado })
    return { valor, nuevaCelda, haLlegado };
  }

  moverFicha(user) {

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

    //El usuario tira el dado
    let { valor, nuevaCelda, haLlegado } = this.tirarDados(user);

    //Si le ha tocado un 6, se suma la estadística
    if (valor == 6) {
      user.sumaSeis();
    }

    //Comprobar si ha llegado al final
    if (haLlegado) {
      //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
      //Buscamos cada jugador de la partida y los ordenamos por su posición
      let users = this.room.getPlayers();
      let usersOrdenados = users.sort((a, b) => {
        return a.getCurrentCell() - b.getCurrentCell();
      });

      //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
      this.socketServer.to(this.room.roomId).emit("finPartida", {
        ganador: user.nickname,
        posiciones: usersOrdenados,
      });

      this.finalPartida = true;
      
      // Actualizar estadísticas de los jugadores
      // TODO: Comprobar acceso a campos, probablemente esté mal
      for(let pl in users){
        if (pl != user.nickname){
          this.players
          // Perdedores
          users[pl].actualizarEstadisticas(false);
        }
        else{
          // Ganador
          users[pl].actualizarEstadisticas(true);
        }
      }

      return { dice: valor, afterDice:nuevaCelda, rollAgain:false, finalCell:nuevaCelda };
    }
    else {

      //nuevaCelda, celda calculado con el numero del dado
      //proximaCelda, tras comprobar el estado de nuevaCelda, puede ser la misma u otra celda segun el tipo
      //tiraOtraVez, si es true, el jugador tira otra vez
      console.log("celdaActual: " + user.getCurrentCell());
      console.log("valor: " + valor);
      console.log("haLlegado: " + haLlegado);




      //Movemos al usuario a la nueva celda
      user.setCurrCell(nuevaCelda);

      console.log("celdaActualPostDado: " + user.getCurrentCell());

      console.log("================================================== ")

      //Comprobar estado de la nueva celda --> tablero.execute(nuevaCelda)
      let {nueva, turno, penalizacion, caidoOca, caidoCalavera } = this.tablero.execute(nuevaCelda);
      console.log({nueva, turno, penalizacion, caidoOca, caidoCalavera })
      console.log("================================================== ")
      //Comprobar estadísticas
      if (caidoOca) {
        user.sumaOca();
      }
      else if (caidoCalavera) {
        user.sumaCalavera();
      }

      //estadoCelda => [proximaCleda (si es especial), tiraOtraVez, penalizacion]

      //Si hay penalización se le añade al jugador
      if (penalizacion > 0) {
        user.turnosPendientes = penalizacion;
      }

      //Si se tiene que mover (punete, oca..)
      if (nueva != user.getCurrentCell()) {
        user.setCurrCell(nueva);
      }


      // console.log("Fin de turno del jugador: " + user.nickname);
      // console.log("Celda actual: " + user.getCurrentCell());
      // console.log("Dados: " + valor);


      //Enviamos mensaje con el estado actual de la partida
      //Buscamos cada jugador de la partida y los ordenamos por su posición
      //                -->Estado de partida<--
      let users = this.room.getPlayers();
      // console.log(users);
      let players = Object.values(users);

      let usersOrdenados = players.sort((a, b) => {
        return a.getCurrentCell() - b.getCurrentCell();
      });

      //printPlayer para cada miembro del diccionario
      for (let i = 0; i < usersOrdenados.length; i++) {
        usersOrdenados[i].printPlayerInfo();
      }

      //nos quedamos con los nicknames
      let nuevasPos = usersOrdenados.map((user) => {
        return user.nickname;
      });

      

      //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
      this.socketServer.to(this.room.roomId).emit("estadoPartida", {
        posiciones: nuevasPos,
      });
      //             -->Estado de partida<--

      //Si se tira otra vez no se pasa de turno
      if (!turno) {
        this.sigTurno();
      }

      
      return { dice: valor, afterDice:nuevaCelda, rollAgain:turno, finalCell:nueva };

    }

  }

  turnoActual() {
    return this.currentTurn;
  }

  comenzarTurno(user) {
    //Comprobar si es el turno
    if (this.ordenTurnos[this.currentTurn] != user.nickname) {
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

    let { dice, afterDice, rollAgain, finalCell } = this.moverFicha(user);
    console.log("================================================== ")
    
    return { dice: dice, afterDice:afterDice, rollAgain:rollAgain, finalCell:finalCell };

    
  }
}

module.exports = { GameController };
