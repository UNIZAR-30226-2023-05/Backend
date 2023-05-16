//Controlador de las salas. Se importará el controlador (con socket) y cuando se quiera inciar una sala se llamará a la función roomController
//Se importará en app.js

const Player = require("./player");

/**
 *
 * @param {*} socket         Socket del cliente que ha creado la sala
 * @param {*} roomController Controlador de las salas
 */

const roomHandler = (socket, roomController, io) => {
  //---Crear sala---
  /**
   * @param {*} user
   * @param {*} roomName
   * @param {*} numPlayers
   * @param {*} gamemode
   * @param {*} callback
   */

  function createRoomHandler(user, roomName, numPlayers, gamemode, callback) {
    //líder de la sala
    leader = new Player(user.nickname, socket);

    //Comprobaciones:
    //1. Si la sala ya existe
    //2. Si el número de jugadores es mayor que el máximo permitido
    //3. Si el número de jugadores es menor que el mínimo permitido
    //4. Si el jugador esta en una sala

    //La sala ya existe? (mismo nombre)
    exists = roomController.isRoomNameInUse(roomName);
    if (exists) {
      callback({
        message: "Ya existe una sala con ese nombre",
        status: "error",
      });
      return;
    }

    //El número de jugadores es mayor que el máximo permitido?
    if (numPlayers > 6) {
      callback({
        message: "El número de jugadores es mayor que el máximo permitido",
        status: "error",
      });
      return;
    }

    //El número de jugadores es menor que el mínimo permitido?
    if (numPlayers < 2) {
      callback({
        message: "El número de jugadores es menor que el mínimo permitido",
        status: "error",
      });
      return;
    }

    //El jugador ya está en una sala?
    let idR = roomController.isPlayerInAnyRoom(leader);
    if (idR !== undefined) {
      callback({
        message: "Ya estás en una sala",
        sala: idR,
        status: "error",
      });
      return;
    }

    //Se crea la sala
    roomId = roomController.createRoom(leader, roomName, numPlayers, gamemode);

    // console.log("Sala creada con ID: " + roomId);

    //Se añade el jugador a la sala
    socket.join(roomId);

    roomController.joinRoom(roomId, leader, io);

    // console.log("Jugador " + user.nickname + " añadido a la sala " + roomId);

    //Se envía un mensaje al cliente que ha creado la sala <socket> con el ID
    callback({
      id: roomId,
      message: "Sala creada correctamente, comparte el ID con tus amigos",
      status: "ok",
    });
  }

  //---Unirse a una sala---
  /**
   *
   * @param {*} roomID
   * @param {*} user Instancia de la tabla Usuario
   * @param {*} callback
   */
  function joinRoomHandler(roomID, user, callback) {
    //La sala existe?
    if (!roomController.isRoomActive(roomID)) {
      callback({
        message: "La sala no existe",
        status: "error",
      });
      return;
    }

    let idR = roomController.isPlayerInAnyRoomBySocket(socket);
    if (idR !== undefined) {
      callback({
        message: "Ya estás en otra sala",
        sala: idR,
        status: "error",
      });
      return;
    }

    //user
    newPlayer = new Player(user.nickname, socket);

    //La sala está llena?
    if (roomController.isRoomFull(roomID)) {
      callback({
        message: "La sala está llena",
        status: "error",
      });

      return;
    }

    //La sala está llena?
    if (roomController.isRoomFull(roomID)) {
      callback({
        message: "La sala está llena",
        status: "error",
      });

      return;
    }

    //La partida ya ha empezado?
    //...

    //-->Si ha pasado todas las condiciones, se une al jugador a la sala<--

    //Si no existe la sala, se crea internamente
    //pasar de text a int
    roomID = parseInt(roomID);
    socket.join(roomID);

    console.log("Jugador " + user.nickname + " añadido a la sala " + roomID);

    //Se envía un mensaje a todos los usuarios de la sala <roomID> (excepto al que ha creado la sala
    roomController.sendMessageToRoom(
      roomID,
      `El jugador ${user.nickname} se ha unido a la sala`,
      io
    );

    //La sala envia mensaje al cliente que se ha unido --> ??
    // roomController.sendMessageToRoom(roomID, `Has entrado en la sala ${roomID}`, socket);

    //Se añade el jugador a la  sala -> necesitamos el socket del servidor
    let nicknames = roomController.joinRoom(roomID, newPlayer, io);

    rName = roomController.getRoomName(roomID);

    //Se envía un mensaje al cliente que ha creado la sala <socket>
    callback({
      message: "Te has unido a la sala " + roomID,
      roomName: rName,
      players: nicknames,
      status: "ok",
    });
  }

  //Nuevo (pendiente)
  function leaveRoomHandler(roomID, callback) {
    roomID = parseInt(roomID);
    //Comprobar en primera instancia si la sala existe
    if (!roomController.isRoomActive(roomID)) {
      callback({
        message: "La sala no existe",
        status: "error",
      });
      return;
    }

    //No esta en ninguna sala? --> Se han tenido que hacer mas funciones pero es mas cuestión de casos posibles
    if (!roomController.isPlayerInAnyRoomBySocket(socket)) {
      callback({
        message: "No estás en la sala",
        status: "error",
      });
      return;
    }

    //Como se desconoce si se encuentra o no en la sala, se busca en todas las salas
    delPlayer = roomController.getPlayer_deepSearch(socket);

    console.log("Jugador que va a salir de la sala: " + delPlayer.nickname);

    //Comprobar si el jugador está en la sala -> antes de comprobar socket ( sino undefined )
    if (!roomController.isPlayerInRoom(roomID, delPlayer)) {
      callback({
        message: "No estás en la sala",
        status: "error",
      });
      return;
    }
    //Comprobar si no es el líder de la sala --> en caso de no serlo, abandonar normal
    if (!roomController.isPlayerLeader(roomID, delPlayer)) {
      // socket.leave(roomID); --> ya se hace en leaveRoom

      
      //si la partida ha empezado, se eliminará al jugador de la partida
      if (roomController.activeRooms[roomID].theGameExists()) {
        //Se elimina al jugador de la partida
        roomController.activeRooms[roomID].gameController.playerAbandona(delPlayer);
      }


      //Se elimina el jugador de la sala
      let nicknames = roomController.leaveRoom(roomID, delPlayer, io);
      //Se envía un mensaje a todos los usuarios de la sala <roomID> (excepto al que ha creado la sala
      roomController.sendMessageToRoom(
        roomID,
        `El jugador ${delPlayer.nickname} ha abandonado la sala`,
        io
      );

      //Se envía un mensaje al cliente que ha creado la sala <socket>
      callback({
        message: "Has abandonado la sala " + roomID,
        players: nicknames,
        status: "ok",
      });
    } else {
      roomController.showAllRooms();
      //Es el líder de la sala --> destruir la sala
      destroyRoomHandler(roomID, callback);

      callback({
        message: "Has abandonado la sala y se ha destruido",
        status: "ok",
      });
    }
  }

  //destruir sala (pendiente de aceptar)
  function destroyRoomHandler(roomID, callback) {
    //obtener el usuario que intenta destruir la sala
    user = roomController.getPlayer(socket, roomID);

    //checkear si el usuario esta en la sala (nunca debería pasar)
    if (!roomController.isPlayerInRoom(roomID, user)) {
      callback({
        message: "No estás en la sala",
        status: "error",
      });
      return;
    }

    //No es necesario comprobar si es el líder (frontend lo sabe -> solametne hay un boton para ellos)

    // Mensaje a todos los usuarios de la sala
    roomController.sendMessageToRoom(
      roomID,
      `El jugador ${user.nickname} ha destruido la sala`,
      io
    );
    io.to(roomId).emit("destroyingRoom", roomId);
    roomController.deleteRoom(user, roomID, io);
    roomController.showAllRooms();

    roomController.showAllRooms();

    callback({
      message: "Sala destruida correctamente",
      status: "ok",
    });
  }

  //eliminar jugador de la sala (pendiente de aceptar)
  //--> PENDIENTE
  function removePlayerFromRoomHandler(roomID, user, callback) {
    userLeader = roomController.getPlayer(socket, roomID);

    //checkear si el usuario esta en la sala (nunca debería pasar)
    if (!roomController.isPlayerInRoom(roomID, userLeader)) {
      callback({
        message: "No estás en la sala",
        status: "error",
      });
      return;
    }

    //No eliminarse a sí mismo
    if (userLeader.nickname == user.nickname) {
      callback({
        message: "No puedes eliminarte a ti mismo",
        status: "error",
      });

      return;
    }

    //El jugador no esta en la sala
    if (!roomController.isPlayerInRoom(roomID, user)) {
      callback({
        message: "El jugador no está en la sala",
        status: "error",
      });

      return;
    }

    let nicknames = roomController.removePlayer(userLeader, roomID, user, io);
    //mensaje a todos los jugadores de la sala
    roomController.sendMessageToRoom(
      roomID,
      `El jugador ${user.nickname} ha sido eliminado de la sala`,
      io
    );

    callback({
      message: "El jugador ha sido eliminado de la sala",
      players: nicknames,
      status: "ok",
    });
  }

  //Debug handler
  function eliminateAllRoomsHandler() {
    roomController.destroyAllRooms();
  }

  //================================================================================================

  //Se escucha el evento createRoom y se llama a la función createRoomHandler
  socket.on("createRoom", createRoomHandler);
  socket.on("joinRoom", joinRoomHandler);
  socket.on("leaveTheRoom", leaveRoomHandler);
  socket.on("destroyRoom", destroyRoomHandler);
  socket.on("removePlayerFromRoom", removePlayerFromRoomHandler);
  //Debug handler
  socket.on("eliminarSalas", eliminateAllRoomsHandler);
};

module.exports = roomHandler;
