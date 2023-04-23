//Controlador de las salas. Se importará el controlador (con socket) y cuando se quiera inciar una sala se llamará a la función roomController
//Se importará en app.js

const Player = require("./player");

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
        
        //1.Comprobar que la sala existe
        if(!roomController.isRoomIdInUse(roomId)){
            callback({
                message: "La sala no existe",
                status: 'error'
            });
            return;
        }

        //2. Obtener el objeto Room
        let room = roomController.getRoom(roomId);

        //3. Comprobar que el jugador es el creador de la sala
        //Devuelve objeto de la clase Player
        user = roomController.getPlayer(socket,roomID);
        if(!room.isLeader(user)){
            callback({
                message: "No eres el creador de la sala",
                status: 'error'
            });
            return;
        }

        //Finalmente se crea el controlador de la partida
        let gameController = new GameController(room,turnTimeout,socket);

        //Añadimos (por tener referencia) el controlador de la partida al controlador de las salas
        roomController.addGameController(roomId, gameController);image.png

        //Se envía el evento de inicio de partida a todos los jugadores de la sala
        callback({
            message: "Partida iniciada",
            status: 'ok'
        });
        // io.to(roomId).emit('startGame',gameController.getGameInfo());
  
    }


}
module.exports = gameHandler;
