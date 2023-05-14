//clase para crear una sala, borrar, unirse, etc

//player
const Player = require("./player");
var Room = require("./room");

class RoomController {
  //-Atributos-

  //id de la sala --> autoincremental
  id = 0; //Solo se pone a 0 una vez, cuando se crea el primer objeto de la clase

  activeRooms = {}; //Diccionario de salas activas

  createRoom(user, roomName, numPlayers, gamemode) {
    let room = new Room(user, roomName, numPlayers, gamemode, this.id);

    //Se añade la sala al diccionario
    this.activeRooms[room.roomId] = room;

    this.id++; //Se incrementa el id

    //Se devuelve el id de la sala
    return room.roomId;
  }

  isPlayerLeader(roomID, user) {
    return this.activeRooms[roomID].isLeader(user);
  }

  //get room object
  getRoom(roomId) {
    return this.activeRooms[roomId];
  }

  getRoomName(roomId) {
    return this.activeRooms[roomId].roomName;
  }

  //server delete room
  servDelRoom(roomId,io) {
    //Se elimina la sala del diccionario
    //NO SE DECREMENTA EL ID
    //Antes de nada, se eliminan a todos los jugadores de la sala
    //io.to(roomId).emit("destroyingRoom", roomId);
    this.activeRooms[roomId].servDelRoom(io);
    delete this.activeRooms[roomId];
  }


  deleteRoom(user, roomId, io) {
    //Se elimina la sala del diccionario
    //NO SE DECREMENTA EL ID
    //Antes de nada, se eliminan a todos los jugadores de la sala
    //io.to(roomId).emit("destroyingRoom", roomId);
    this.activeRooms[roomId].delRoom(user);
    delete this.activeRooms[roomId];
  }

  joinRoom(roomId, player, io) {
    //Se añade el jugador a la sala
    // console.log("Se añade el jugador a la sala");
    let nicknames = this.activeRooms[roomId].joinRoom(player, io);
    return nicknames;
  }

  addGameController(roomId, gameController) {
    this.activeRooms[roomId].addGameController(gameController);
  }

  destroyGameController(roomId) {
    this.activeRooms[roomId].destroyGameController();
  }

  leaveRoom(roomId, player, io) {
    //Se elimina el jugador de la sala
    let nicknames = this.activeRooms[roomId].leaveRoom(player, io);
    return nicknames;
  }

  sendMessageToRoom(roomId, message, io) {
    //Se envía el mensaje a la sala
    this.activeRooms[roomId].sendMessage(message, io);
  }

  getGameController(roomId) {
    return this.activeRooms[roomId].gameController;
  }

  //Booleano, esta el jugador en la sala?
  isPlayerInRoom(roomId, player) {
    return this.activeRooms[roomId].isPlayerInRoom(player);
  }

  //Booleano, esta la sala activa?
  isRoomActive(roomId) {
    return this.activeRooms[roomId] != undefined;
  }

  //Mostrar los jugadores de la sala
  allPlayers(roomID) {
    this.activeRooms[roomID].printPlayers();
  }

  //Para eliminar sala --> darse el caso de que directamente no esté en ninguna
  isPlayerInAnyRoomBySocket(socket) {
    for (let room in this.activeRooms) {
      if (this.activeRooms[room].isPlayerInRoomBySocket(socket)) {
        return true;
      }
    }
    return false;
  }

  //Buscar jugador en alguna sala
  isPlayerInAnyRoom(player) {
    for (let room in this.activeRooms) {
      if (this.activeRooms[room].isPlayerInRoom(player)) {
        return true;
      }
    }
    return false;
  }

  isRoomIdInUse(roomId) {
    return this.activeRooms[roomId] != undefined;
  }

  //show all tremovePlayerhe rooms
  showAllRooms() {
    // console.log("Mostrando todas las salas");
    for (let room in this.activeRooms) {
      console.log("Sala: " + this.activeRooms[room].roomName);
    }

    if (Object.keys(this.activeRooms).length == 0) {
      console.log("No hay salas activas");
    }
  }

  //eliminar jugador de sala
  //---->Pendiente de autorización
  removePlayer(userLeader, roomID, player, io) {
    console.log("Socket del servidor: " + io);
    let nicknames = this.activeRooms[roomID].removeThePlayer(
      userLeader,
      player,
      io
    );
    return nicknames;
  }

  //Si no se conoce la sala en la que se encuentra el jugador
  //Se busca en todas las salas
  getPlayer_deepSearch(socket) {
    for (let room in this.activeRooms) {
      let player = this.activeRooms[room].getPlayerBySocket(socket);
      if (player != undefined) {
        return player;
      }
    }
    return undefined;
  }

  getPlayer(socket, roomID) {
    return this.activeRooms[roomID].getPlayerBySocket(socket);
  }

  isRoomNameInUse(roomName) {
    // console.log("Comprobando si el nombre de sala está en uso: " + roomName);
    for (let room in this.activeRooms) {
      if (this.activeRooms[room].roomName == roomName) {
        // console.log("Nombre de sala en uso: " + roomName);
        return true;
      }
    }
    return false;
  }

  isRoomFull(roomID) {
    return this.activeRooms[roomID].isRoomFull();
  }

  //Debug method
  destroyAllRooms() {
    //delete all the rooms in the dictionary
    console.log("Eliminando todas las salas");
    for (let room in this.activeRooms) {
      delete this.activeRooms[room];
    }
  }
}

module.exports = RoomController;
