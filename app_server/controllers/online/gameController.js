/* Controlador de partida para cada sala (suponiendo que la lógica de juego ya 
    está implementada). */

const predefinidos = require("../../../game_logic/predefinidos");
const { Console } = require("winston/lib/winston/transports");

class GameController {
  //--Atributos de clase--//
  room; //objeto de la clase Room
  roomLeader;
  tiempoDeTurno;

  //--Constructor--//
  constructor(room, tiempoDeTurno, socketServer) {
    this.room = room;
    this.tiempoDeTurno = tiempoDeTurno; //tiempo de turno en segundos 12*60*60 = 12 horas
    this.currentTurnTimeout = null; //timeout para el turno actual

    this.socketServer = socketServer;

    // Aquí hay que poner el tablero predefinido para juego clásico
    this.tablero = new predefinidos.tableroClasico(); //tablero de juego

    this.ackTurno = false; //ack para saber si es el turno del usuario

    this.start = false; //ack para saber si la partida ha empezado

    this.finalPartida = false; //ack para saber si la partida ha terminado

    this.currentTurn = 0; //turno actualfinalPartida
    this.ordenTurnos = []; //orden de turnos
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
      console.log("La partida no ha empezado");
      return;
    }

    //Si la partida ha terminado no se puede pasar de turno
    if (this.finalPartida) {
      // console.log("La partida ha terminado");
      return;
    }

    //Control de tiempo de turno
    if (this.currentTurnTimeout != null) {
      clearTimeout(this.currentTurnTimeout);
    }

    //Llamara a sigTurno() cuando se acabe el tiempo de turno
    //Se queda "durmiendo" hasta que pase el tiempo o el usuario haga un movimiento -> clearTimeout(this.currentTurnTimeout);
    this.currentTurnTimeout = setTimeout(() => {
      this.sigTurno();
      //Meter mensaje de que se ha acabado el tiempo de turno si se desea
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

  hasGameFinished() {
    return this.finalPartida;
  }

  tirarDados(user) {
    //Si no ha empezado la partida no se puede tirar dados
    if (!this.start) {
      console.log("La partida no ha empezado");
      return;
    }

    //Si la partida ha terminado no se puede tirar dados
    if (this.finalPartida) {
      // console.log("La partida ha terminado");
      return;
    }

    //El usuario tira un dado y y devuelve la celda en la que cae
    let valor = Math.floor(Math.random() * 6) + 1;

    //Aquí dentro se harán comprobaciones necesarias --> calcula la nueva celda ??? (necesario??)
    let nuevaCelda = user.getCurrentCell() + valor;

    let haLlegado;

    //Comprobar si ha llegado al final
    if (nuevaCelda == 63) {
      console.log("El usuario " + user.getNickname() + " ha llegado a la meta");
      haLlegado = true;
    } else if (nuevaCelda > 63) {
      nuevaCelda = 63 - (nuevaCelda % 63); //Te has pasado de la meta
      haLlegado = false;
    } else {
      haLlegado = false;
    }

    console.log({ valor, nuevaCelda, haLlegado });
    return { valor, nuevaCelda, haLlegado };
  }

  moverFicha(user) {
    //Si estas penalizado no puedes mover ficha
    if (user.getTurnosPendientes() > 0) {
      // Se resta uno al número de turnos que le quedan pendientes al jugado
      console.log("El usuario " + user.getNickname() + " está penalizado");
      user.turnosPendientes--;

      // Sumar 1 al turno
      this.currentTurn = (this.currentTurn + 1) % this.ordenTurnos.length; //turno actual

      //Enviar mensaje a todos los jugadores de la sala con el nuevo turno
      this.socketServer.to(this.room.roomId).emit("sigTurno", {
        turno: this.ordenTurnos[this.currentTurn],
        tiempo: this.tiempoDeTurno,
      });

      this.socketServer.to(this.room.roomId).emit("serverRoomMessage", {
        message: "⊙﹏⊙∥ El usuario " + user.getNickname() + " está penalizado",
      });

      return {
        dice: 0,
        afterDice: user.getCurrentCell(),
        rollAgain: false,
        finalCell: user.getCurrentCell(),
      };
    }

    //El usuario tira el dado
    let { valor, nuevaCelda, haLlegado } = this.tirarDados(user);

    //Si le ha tocado un 6, se suma la estadística
    if (valor == 6) {
      user.sumaSeis();
    }

    //Comprobar si ha llegado al final
    if (haLlegado) {
      user.setCurrCell(nuevaCelda);
      //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
      //Buscamos cada jugador de la partida y los ordenamos por su posición
      let users = this.room.getPlayers();
      // console.log(users);
      let players = Object.values(users);

      let usersOrdenados = players.sort((a, b) => {
        return b.getCurrentCell() - a.getCurrentCell();
      });

      let posiciones = {};
      let nuevasPos = usersOrdenados.map((user) => {
        return (posiciones = {
          nickname: user.nickname,
          celda: user.getCurrentCell(),
        });
      });

      //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
      this.socketServer.to(this.room.roomId).emit("finPartida", {
        ganador: user.nickname,
        posiciones: nuevasPos,
      });

      this.finalPartida = true;

      // Eliminar timeout
      this.currentTurnTimeout = null;

      // Actualizar estadísticas de los jugadores
      // TODO: Comprobar acceso a campos, probablemente esté mal
      for (let pl in users) {
        if (pl != user.nickname) {
          this.players;
          // Perdedores
          users[pl].actualizarEstadisticas(false);
        } else {
          // Ganador
          users[pl].actualizarEstadisticas(true);
        }
      }

      this.socketServer.to(this.room.roomId).emit("serverRoomMessage", {
        message:
          "(❁´◡`❁) El usuario " + user.getNickname() + " ha ganado la partida",
      });

      return {
        dice: valor,
        afterDice: nuevaCelda,
        rollAgain: false,
        finalCell: nuevaCelda,
      };
    }

    //nuevaCelda, celda calculado con el numero del dado
    //proximaCelda, tras comprobar el estado de nuevaCelda, puede ser la misma u otra celda segun el tipo
    //tiraOtraVez, si es true, el jugador tira otra vez
    console.log("celdaActual: " + user.getCurrentCell());
    console.log("valor: " + valor);
    console.log("haLlegado: " + haLlegado);

    //Movemos al usuario a la nueva celda
    user.setCurrCell(nuevaCelda);

    console.log("celdaActualPostDado: " + user.getCurrentCell());

    console.log("================================================== ");

    //Comprobar estado de la nueva celda --> tablero.execute(nuevaCelda)
    let { nueva, turno, penalizacion, caidoOca, caidoCalavera } =
      this.tablero.execute(nuevaCelda);
    console.log({ nueva, turno, penalizacion, caidoOca, caidoCalavera });
    console.log("================================================== ");
    //Comprobar estadísticas
    if (caidoOca) {
      user.sumaOca();
    } else if (caidoCalavera) {
      user.sumaCalavera();
    }

    //estadoCelda => [proximaCleda (si es especial), tiraOtraVez, penalizacion]

    //Si hay penalización se le añade al jugador
    if (penalizacion > 0) {
      user.turnosPendientes = penalizacion;
    }

    //Si se tiene que mover (punete, oca..)
    if (nueva != user.getCurrentCell()) {
      //comprobar si ha llegado al final
      user.setCurrCell(nueva);
      if (nueva == 63) {
        //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
        //Buscamos cada jugador de la partida y los ordenamos por su posición

        //user.setCurrCell(nueva);

        let users = this.room.getPlayers();
        // console.log(users);
        let players = Object.values(users);

        let usersOrdenados = players.sort((a, b) => {
          return b.getCurrentCell() - a.getCurrentCell();
        });

        let posiciones = {};
        let nuevasPos = usersOrdenados.map((user) => {
          return (posiciones = {
            nickname: user.nickname,
            celda: user.getCurrentCell(),
          });
        });

        //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
        this.socketServer.to(this.room.roomId).emit("finPartida", {
          ganador: user.nickname,
          posiciones: nuevasPos,
        });

        // Eliminar timeout
        this.currentTurnTimeout = null;

        this.finalPartida = true;

        this.socketServer.to(this.room.roomId).emit("serverRoomMessage", {
          message:
            "(❁´◡`❁) El usuario " +
            user.getNickname() +
            " ha ganado la partida",
        });

        return {
          dice: valor,
          afterDice: nuevaCelda,
          rollAgain: turno,
          finalCell: nueva,
        };
      }
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
      return b.getCurrentCell() - a.getCurrentCell();
    });

    //printPlayer para cada miembro del diccionario
    for (let i = 0; i < usersOrdenados.length; i++) {
      usersOrdenados[i].printPlayerInfo();
    }

    //objeto con nicknames y posiciones

    //para cada usuario ordenado nos guardamos su celda actual y su nickname
    // for (let i = 0; i < usersOrdenados.length; i++) {
    //   posiciones.nickname = usersOrdenados[i].nickname;
    //   posiciones.pos = usersOrdenados[i].getCurrentCell();
    // }

    let posiciones = {};
    let nuevasPos = usersOrdenados.map((user) => {
      return (posiciones = {
        nickname: user.nickname,
        celda: user.getCurrentCell(),
      });
    });

    //Se envía un mensaje a todos los jugadores de la sala con el ganador con las posiciones de los jugadores
    this.socketServer.to(this.room.roomId).emit("estadoPartida", {
      posiciones: nuevasPos,
    });
    //             -->Estado de partida<--

    //Si se tira otra vez no se pasa de turno
    if (!turno) {
      this.sigTurno();
    } else {
      //mensaje a toda la sala de vuelve a tirar
      this.socketServer.to(this.room.roomId).emit("serverRoomMessage", {
        message: "( ͡ಠ ʖ̯ ͡ಠ)! El jugador " + user.nickname + " vuelve a tirar",
      });
    }

    return {
      dice: valor,
      afterDice: nuevaCelda,
      rollAgain: turno,
      finalCell: nueva,
    };
  }

  turnoActual() {
    return this.currentTurn;
  }

  comenzarTurno(user) {
    //Comprobar si es el turno
    if (this.ordenTurnos[this.currentTurn] != user.nickname) {
      return {};
      // return;
    }

    //mas condiciones...

    this.ackTurno = true; //ack para saber si es el turno del usuario

    let { dice, afterDice, rollAgain, finalCell } = this.moverFicha(user);
    console.log("================================================== ");

    this.ackTurno = false; //ack para saber si es el turno del usuario

    return {
      dice: dice,
      afterDice: afterDice,
      rollAgain: rollAgain,
      finalCell: finalCell,
    };
  }

  playerAbandona(user) {
    //si un jugador quita de los turnos y si es su turno se pasa al siguiente
    this.ordenTurnos = this.ordenTurnos.filter((nick) => nick != user.nickname);

    this.socketServer.to(this.room.roomId).emit("serverRoomMessage", {
      message:
        "(┬┬﹏┬┬) El jugador " + user.nickname + " ha abandonado la partida",
    });

    //Si era su turno se pasa al siguiente
    if (this.ordenTurnos[this.currentTurn] == user.nickname) {
      this.sigTurno();
    }

    // Se saca al jugador de la lista de turnos
    this.ordenTurnos = this.ordenTurnos.filter((turno) => {
      return turno != user.nickname;
    });
  }
}

module.exports = { GameController };
