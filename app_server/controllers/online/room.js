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
  bots; //objeto con los bots de la sala (id, bot(objeto de la clase NPC))
  startTime = config.startTime;

  gameController; //objeto de la clase GameControllerç
  roomController; //objeto de la clase RoomController

  //--Constructor--
  constructor(user, roomName, players, gamemode, roomId, roomController) {
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

    console.log("Lider de la sala: " + user.nickname);

    this.roomLeader = user.nickname;

    this.gameController = undefined;

    this.roomController = roomController;

    this.bots = {}; //Diccionario vacío
  }

  //--Métodos--

  //Unir jugador X a esta sala (player es un objeto de la clase Player)
  /**
   *
   * @param {*} player Instancia de la clase Player
   */
  joinRoom(player, io) {
    //Si el tamaño de la sala es igual al número de jugadores, no se puede unir
    if (this.numPlayers == Object.keys(this.players).length) {
      throw new Error("Sala llena");
    } else {
      //Se añade el jugador al diccionario
      this.players[player.nickname] = player;
    }

    //Devolver los nicknames únicamente
    let nicknames = [];
    //Ply es el identificador del jugador en el diccionario y se accede a su nickname con players[ply].nickname
    for (let ply in this.players) {
      nicknames.push(this.players[ply].nickname);
    }

    console.log("Jugadores en la sala: " + nicknames);
    io.to(this.roomId).emit("updatePlayers", nicknames);

    return nicknames;
  }

  addGameController(gameController) {
    this.gameController = gameController;
  }

  getRoomId() {
    return this.roomId;
  }

  //Eliminar jugador X de esta sala (player es un objeto de la clase Player)
  leaveRoom(player, io) {
    //Si el jugador no está en la sala, no se puede eliminar
    if (this.players[player.nickname] == undefined) {
      throw new Error("El jugador no está en la sala");
    } else {
      //Se desconecta al jugador de la sala
      this.players[player.nickname].socket.leave(this.roomId);
      //Se desconecta al jugador de la sala
      this.players[player.nickname].socket.leave(this.roomId);
      delete this.players[player.nickname];
      let nicknames = [];
      for (let ply in this.players) {
        nicknames.push(this.players[ply].nickname);
      }

      //Mensaje a todos los jugadores de la sala
      io.to(this.roomId).emit("updatePlayers", nicknames);

      return nicknames;
    }
  }

  //Devuelve el número de jugadores que hay en la sala
  getNumPlayers() {
    return this.numPlayers;
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

  //Devuelve los jugadores de la sala
  getPlayers() {
    return this.players;
  }

  isPlayerInRoomBySocket(socket) {
    //Se recorre el diccionario de jugadores
    for (let player in this.players) {
      //Si el socket del jugador es igual al socket pasado por parámetro, se devuelve el jugador
      if (this.players[player].socket == socket) {
        return true;
      }
    }
    //Si no se encuentra el jugador, se devuelve undefined
    return false;
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
    //io.to(this.roomId).emit("destroyingRoom", this.roomId);
  }

  //eliminar jugador de la sala (PENDING)
  removeThePlayer(remover, player, io) {
    //Primero: se comprueba que no te puedas eliminar a ti mismo
    if (remover.nickname == player.nickname) {
      throw new Error("No puedes eliminarte a ti mismo");
    } else {
      //Segundo: se comprueba que el jugador que elimina a otro es el líder de la sala
      if (this.isLeader(remover)) {
        //Tercero: se comprueba que el jugador que se quiere eliminar está en la sala
        if (this.isPlayerInRoom(player)) {
          //enviar mensaje al que ha sido eliminado
          let delSocket = this.players[player.nickname].socket;
          delSocket.emit("serverRoomMessage", "Has sido eliminado de la sala");

          //Cuarto: se elimina al jugador de la sala
          console.log("Socket server: " + io);
          let nicknames = this.leaveRoom(player, io);

          return nicknames;
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

  // Game exists
  theGameExists() {
    return this.gameController != undefined;
  }

  // Delete room
  delRoom(user) {
    // this.printPlayers();
    if (this.isLeader(user)) {
      //1. Eliminamos a todos los jugadores de la sala
      for (let player in this.players) {
        // console.log("Eliminando jugador " + player);
        //evitamos borrarse a si mismo y que se borre a los jugadores de la sala únicamente
        if (
          player != user.nickname &&
          this.isPlayerInRoom(this.players[player])
        ) {
          console.log("Eliminando jugador " + player);
          this.players[player].socket.leave(this.roomId);
          delete this.players[player];
        }

        // else
        // {
        //   //console...
        // }
      }
      //2. Eliminamos la sala
      delete this.roomId;
    } else {
      //Aquí se supone que no llega nunca
      throw new Error("No eres el líder de la sala");
    }
  }
  //print players in the room
  printPlayers() {
    // console.log("Jugadores en la sala " + this.roomId + ":");
    for (let player in this.players) {
      console.log(this.players[player].nickname);
      console.log(this.players[player].nickname);
    }
  }

  isRoomFull() {
    return this.numPlayers == Object.keys(this.players).length;
  }

  servDeleteRoom(io) {
    //SERVIDOR ELIMINA SALA
    io.to(this.roomId).emit("destroyingRoom", this.roomId);
    //1. Eliminamos a todos los jugadores de la sala
    for (let player in this.players) {
      // console.log("Eliminando jugador " + player);
      //evitamos borrarse a si mismo y que se borre a los jugadores de la sala únicamente
      if (this.isPlayerInRoom(this.players[player])) {
        console.log("Eliminando jugador " + player);
        this.players[player].socket.leave(this.roomId);
        delete this.players[player];
      }
    }

    console.log("Eliminando sala " + this.roomId);
    //2. Eliminamos la sala entera
    delete this.roomId;
  }

  destroyGameController() {
    console.log("Eliminando game controller");
    delete this.gameController;
  }

  addBot(bot) {
    this.bots[bot.nickname] = bot;
  }

  getBot(botNickname) {
    return this.bots[botNickname];
  }

  getOnlyPlayers() {
    let players = [];
    for (let player in this.players) {
      players.push(this.players[player]);
    }

    return players;
  }

  getAllPlayers() {
    let players = [];
    for (let player in this.players) {
      players.push(this.players[player]);
    }

    for (let bot in this.bots) {
      players.push(this.bots[bot]);
    }

    return players;
  }

  isBot(nickname) {
    return this.bots[nickname] != undefined;
  }
}

module.exports = Room;
