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
   *
   * @param {*} roomName
   * @param {*} numPlayers
   * @param {*} gamemode
   * @param {*} callback
   */
  function createRoomHandler(user,roomName, numPlayers, gamemode, callback) {
    
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
        status: 'error'
      });
      return;

    }

    //El número de jugadores es mayor que el máximo permitido?
    if (numPlayers > 6) {
      callback({
        message: "El número de jugadores es mayor que el máximo permitido",
        status: 'error'
      });
      return;
    }

    //El número de jugadores es menor que el mínimo permitido?
    if (numPlayers < 2) {
      callback({
        message: "El número de jugadores es menor que el mínimo permitido",
        status: 'error'
      });
      return;
    }

    //El jugador ya está en una sala?
    if (roomController.isPlayerInAnyRoom(user.nickname)) {
      callback({
        message: "Ya estás en una sala",
        status: 'error'
      });
      return;
    }


    //Se crea la sala
    roomId = roomController.createRoom(user,roomName, numPlayers, gamemode);

    // console.log("Sala creada con ID: " + roomId);

    leader = new Player(user.nickname, socket);
    //Se añade el jugador a la sala
    roomController.joinRoom(roomId, leader);

    // console.log("Jugador " + user.nickname + " añadido a la sala " + roomId);

    //Se envía un mensaje al cliente que ha creado la sala <socket> con el ID
    callback({
      id: roomId,
      message: "Sala creada correctamente, comparte el ID con tus amigos",
      status: 'ok'
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
    //user
    newPlayer = new Player(user.nickname, socket);

    //Condiciones:
    //1. Unirse a sala que ya esta unido
    //2. Unirse a sala que no existe
    //3. Unirse a sala que esta llena
    //4. Unirse a sala cuando ya esta en otra sala
    //5. partida en juego?

    //El jugador ya está en la sala?
    if (roomController.isPlayerInRoom(roomID, newPlayer)) {
      callback({
        message: "Ya estás en la sala",
        status: 'error'
      });
      return;
    }

    //La sala existe?
    if (!roomController.isRoomActive(roomID)) {
      callback({
        message: "La sala no existe",
        status: 'error'
      });
      return;
    }

    // //La sala está llena? --> Se comprueba directamente en el joinRoom
    // if (roomController.isRoomFull(roomID)) {
    //   callback({
    //     message: "La sala está llena",
    //     status: 'error'
    //   });
    //   return;
    // }

    //El jugador está en otra sala?
    if (roomController.isPlayerInAnyRoom(newPlayer)) {
      callback({
        message: "Ya estás en otra sala",
        status: 'error'
      });
      return;
    }

    //La partida ya ha empezado?
    //...

    //-->Si ha pasado todas las condiciones, se une al jugador a la sala<--

    //Si no existe la sala, se crea internamente
    socket.join(roomID);

    //Se envía un mensaje a todos los usuarios de la sala <roomID> (excepto al que ha creado la sala
    roomController.sendMessageToRoom(roomID, `El jugador ${user.nickname} se ha unido a la sala`, io);

    //La sala envia mensaje al cliente que se ha unido --> ?? 
    // roomController.sendMessageToRoom(roomID, `Has entrado en la sala ${roomID}`, socket);

    //Se añade el jugador a la  sala
    roomController.joinRoom(roomID, newPlayer);

    //Se envía un mensaje al cliente que ha creado la sala <socket>
    callback({
      message: "Te has unido a la sala " + roomID,
      status: 'ok'
    });

  }

  //Nuevo (pendiente)
  function leaveRoomHandler(roomID, callback) {

    delPlayer = roomController.getPlayer(socket,roomID);

    // roomController.allPlayers(roomID);

    //El jugador está en la sala?
    if (roomController.isPlayerInRoom(roomID, delPlayer)) {

      
      socket.leave(roomID);

      //Se elimina el jugador de la sala
      roomController.leaveRoom(roomID, delPlayer);

      //Se envía un mensaje a todos los usuarios de la sala <roomID> (excepto al que ha creado la sala
      roomController.sendMessageToRoom(roomID, `El jugador ${delPlayer.nickname} ha abandonado la sala`, io);

      //Se envía un mensaje al cliente que ha creado la sala <socket>
      callback("Has abandonado la sala " + roomID);
    }
    else {
      //El jugador no está en la sala
      callback("No estás en la sala");
    }

  }

  //destruir sala (pendiente de aceptar)
  function destroyRoomHandler(roomID,callback) {

    //obtener el usuario que intenta destruir la sala
    user = roomController.getPlayer(socket,roomID);

    //checkear si el usuario esta en la sala (nunca debería pasar)
    if (!roomController.isPlayerInRoom(roomID, user)) {
      callback({
        message: "No estás en la sala",
        status: 'error'
      });
      return;
    }

    roomController.deleteRoom(user,roomID);

    callback({
      message: "Sala destruida correctamente",
      status: 'ok'
    });
  }

  //eliminar jugador de la sala (pendiente de aceptar)
  //--> PENDIENTE
  function removePlayerFromRoomHandler(roomID, user,callback) {

    userLeader = roomController.getPlayer(socket,roomID);

    //checkear si el usuario esta en la sala (nunca debería pasar)
    if (!roomController.isPlayerInRoom(roomID, userLeader)) {
      callback({
        message: "No estás en la sala",
        status: 'error'
      });
      return;
    }

    roomController.removePlayer(userLeader,roomID, user);
    //mensaje a todos los jugadores de la sala
    roomController.sendMessageToRoom(roomID, `El jugador ${user.nickname} ha sido eliminado de la sala`, io);

    callback({
      message: "El jugador ha sido eliminado de la sala",
      status: 'ok'

    });
  }

  //================================================================================================

  //Se escucha el evento createRoom y se llama a la función createRoomHandler
  socket.on("createRoom", createRoomHandler);
  socket.on("joinRoom", joinRoomHandler);
  socket.on("leaveTheRoom", leaveRoomHandler);
  socket.on("destroyRoom", destroyRoomHandler);
  socket.on("removePlayerFromRoom", removePlayerFromRoomHandler);
};

module.exports = roomHandler;
