//clase de objeto Room

//fichero de configuración
const config = require("../../../config.js");

class Room {
  //--Atributos--
  roomId;
  roomName;
  gamemode;
  numPlayers;
  roomLeader; //jugador que ha creado la sala
  players; //objeto con los jugadores de la sala (id, player(objeto de la clase Player))
  startTime = config.startTime;
  gameController; //objeto de la clase GameController

  //--Constructor--
  constructor(user, roomName, players, gamemode, roomId) {
    this.roomName = roomName;
    this.roomId = roomId;
    //Que no supere los límites
    if (players > config.maxPlayers) {
      throw new Error("Número de jugadores excedido");
    } else if (players < config.minPlayers) {
      throw new Error("Número de jugadores insuficiente");
    } else {
      this.numPlayers = players;
    }

    this.players = {}; //Diccionario vacío

    this.gamemode = gamemode;

    this.roomLeader = user.nickname;

    //Inicialmente no tiene game controller -> es una referencia
    this.gameController = undefined;
  }

  //--Métodos--

  //Unir jugador X a esta sala (player es un objeto de la clase Player)
  /**
   *
   * @param {*} player Instancia de la clase Player
   */
  joinRoom(player) {
    //Si el tamaño de la sala es igual al número de jugadores, no se puede unir
    if (this.numPlayers == Object.keys(this.players).length) {
      throw new Error("Sala llena");
    } else {
      //Se añade el jugador al diccionario (socket, nickname)
      this.players[player.nickname] = player; 
    }
  }

  //Eliminar jugador X de esta sala (player es un objeto de la clase Player)
  leaveRoom(player) {
    //Si el jugador no está en la sala, no se puede eliminar
    if (this.players[player.nickname] == undefined) {
      throw new Error("El jugador no está en la sala");
    } else {
      delete this.players[player.nickname];
    }
  }

  //Devuelve el número de jugadores que hay en la sala
  getAllPlayers() {
    return this.players;
  }

  //Devuelve un player dado un socket
  getPlayerBySocket(socket) {
    //Se recorre el diccionario de jugadores
    for (let player in this.players) {
      //Si el socket del jugador es igual al socket pasado por parámetro, se devuelve el jugador
      if (this.players[player].socket == socket) {
        return this.players[player];
      }
    }
    //Si no se encuentra el jugador, se devuelve undefined
    return undefined;
  }

  //Devuelve un player dado un nickname
  getPlayerByNickname(nickname) {
    
    //Se recorre el diccionario de jugadores
    for (let player in this.players) {
      //Si el nickname del jugador es igual al nickname pasado por parámetro, se devuelve el jugador
      if (this.players[player].nickname == nickname) {
        console.log("Se ha encontrado el jugador");
        return this.players[player];
      }
      //Si no se encuentra el jugador, se devuelve undefined
    }

    return undefined;
  }

  //is player in room
  isPlayerInRoom(player) {
    return this.players[player.nickname] != undefined;
  }

  //Send message to all players in the room
  sendMessage(message, io) {
    //Broadcast message to all players in the room
    io.to(this.roomId).emit(
      "serverRoomMessage",
      `[${this.roomName}]` + message
    );
  }

  //eliminar jugador de la sala (PENDING)
  removePlayer(remover, player) {
    //Primero: se comprueba que no te puedas eliminar a ti mismo
    if (remover.nickname == player.nickname) {
      throw new Error("No puedes eliminarte a ti mismo");
    } else {
      //Segundo: se comprueba que el jugador que elimina a otro es el líder de la sala
      if (this.isLeader(remover)) {
        //Tercero: se comprueba que el jugador que se quiere eliminar está en la sala
        if (this.isPlayerInRoom(player)) {
          //Cuarto: se elimina al jugador de la sala
          this.leaveRoom(player);
        } else {
          throw new Error("El jugador no está en la sala");
        }
      } else {
        throw new Error("No eres el líder de la sala");
      }
    }
  }

  //is leader
  isLeader(player) {
    return this.roomLeader == player.nickname;
  }

  isRoomFull() {
    return this.numPlayers == Object.keys(this.players).length;
  }

  delRoom(user) {
    // this.printPlayers();
    if (this.isLeader(user)) {
      //1. Eliminamos a todos los jugadores de la sala
      for (let player in this.players) {
        // console.log("Eliminando jugador " + player);
        //evitamos borrarse a si mismo
        if (
          player != user.nickname &&
          this.isPlayerInRoom(this.players[player])
        ) {
          this.removePlayer(user, this.players[player]);
        }
        // else
        // {
        //   //console...
        // }
      }
      //2. Eliminamos la sala
      delete this.roomId;
    } else {
      throw new Error("No eres el líder de la sala");
    }
  }
  //print players in the room
  printPlayers() {
    console.log("Jugadores en la sala " + this.roomId + ":");
    for (let player in this.players) {
      //Mostrar tanto nickname como socket
      console.log(
        "Nickname: " + this.players[player].nickname + " Socket: " + this.players[player].socket
      );
    }
  }

  //get players in the room
  getPlayers() {
    //Devolver un array con los nicknames de los jugadores
    let players = [];
    for (let player in this.players) {
      players.push(this.players[player].nickname);
    }
    return players;
  }

  setController(controller) {
    this.gameController = controller;
  }
}

module.exports = Room;
