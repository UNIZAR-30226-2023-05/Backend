//Controlador de las salas. Se importará el controlador (con socket) y cuando se quiera inciar una sala se llamará a la función roomController
//Se importará en app.js

const Player = require("./player");

const { GameController } = require("./gameController");

/**
 *
 * @param {*} socket         Socket del cliente que ha creado la sala
 * @param {*} GameController Controlador de las salas
 */

const gameHandler = (socket, roomController, io) => {
  //-->Eventos de la partida

  //Evento de inicio de partida
  function startGameHandler(roomId, turnTimeout, callback) {
    //Obtener el objeto Room
    roomId = parseInt(roomId);
    turnTimeout = parseInt(turnTimeout);

    //1.Comprobar que la sala existe
    if (!roomController.isRoomActive(roomId)) {
      callback({
        message: "La sala no existe",
        status: "error",
      });
      return;
    }

    //2. Obtener el objeto Room
    let room = roomController.getRoom(roomId);

    //3. Comprobar que el jugador es el creador de la sala
    //Devuelve objeto de la clase Player
    user = roomController.getPlayer(socket, roomId);
    if (!room.isLeader(user)) {
      callback({
        message: "No eres el creador de la sala",
        status: "error",
      });
      return;
    }

    //Finalmente se crea el controlador de la partida
    let gameController = new GameController(room, turnTimeout, io);

    //Añadimos (por tener referencia) el controlador de la partida al controlador de las salas
    roomController.addGameController(roomId, gameController);

    //Se inicia la partida
    gameController.empezarPartida();

    //Se envía el evento de inicio de partida a todos los jugadores de la sala
    callback({
      message: "Partida iniciada",
      status: "ok",
    });
    // io.to(roomId).emit('startGame',gameController.getGameInfo());
  }

  //Evento de turno
  function turnHandler(roomId, callback) {
    roomId = parseInt(roomId);
    //Comprobar que la sala existe
    if (!roomController.isRoomIdInUse(roomId)) {
      callback({
        message: "La sala no existe",
        status: "error",
      });
      return;
    }

    //Obtener el objeto Room
    let room = roomController.getRoom(roomId);

    //Obtener el player dado el socket
    let player = roomController.getPlayer(socket, roomId);

    console.log("Voy a jugar el turno: " + player.nickname);

    //Comprobar que el jugador está en la sala
    if (!room.isPlayerInRoom(player)) {
      callback({
        message: "No estás en la sala",
        status: "error",
      });
      return;
    }

    //Tomar el controlador de la partida
    let gameController = roomController.getGameController(roomId);

    //Verificar que la partida ha empezado
    if (!gameController.isGameStarted()) {
      callback({
        message: "La partida no ha empezado",
        status: "error",
      });
      return;
    }

    //Comenzar turno
    let { dice, afterDice, rollAgain, finalCell } =
      gameController.comenzarTurno(player);

    //si es un objeto vacío, es que el jugador no puede tirar
    if (dice === undefined) {
      callback({
        message: "No puedes tirar",
        status: "error",
      });
      return;
    }
    //comprobar si esta penalizado
    if (dice === 0) {
      callback({
        message: "Estás penalizado",
        status: "error",
      });
      return;
    }

    if (finalCell === 63) {

      //Tratamiento de final de partida
      //Se envía el evento de final de partida a todos los jugadores de la sala
      io.to(roomId).emit("serverRoomMessage", {
        message: "Partida finalizada, se va a cerrar la sala en 10 segundos",
      });

      //Se cierra la sala en 10 segundos
      setTimeout(() => {
        roomController.servDelRoom(roomId,io);
      }, 10000);

      callback({
        message: "Has ganado",
        status: "ok",
      });
      return;
    }

    console.log("================================================== ");
    console.log({
      dice: dice,
      afterDice: afterDice,
      rollAgain: rollAgain,
      finalCell: finalCell,
    });

    //Resultado del turno: dice, casilla, etc JSON
    callback({
      message: "Turno realizado correctamente",
      status: "ok",
      res: {
        dice: dice,
        afterDice: afterDice,
        rollAgain: rollAgain,
        finalCell: finalCell,
      },
    });
  }

  //Listeners
  socket.on("startGame", startGameHandler);
  socket.on("turn", turnHandler);
};
module.exports = gameHandler;
