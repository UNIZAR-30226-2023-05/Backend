

//clase para crear una sala, borrar, unirse, etc

//player
const Player = require('./player');
var Room = require('./room');

class RoomController {

    //-Atributos-

    //id de la sala --> autoincremental
    id = 0; //Solo se pone a 0 una vez, cuando se crea el primer objeto de la clase

    activeRooms = {}; //Diccionario de salas activas


    createRoom(user,roomName, numPlayers, gamemode) {
            
            let room = new Room(user, roomName, numPlayers, gamemode,this.id);
    
            //Se añade la sala al diccionario
            this.activeRooms[room.roomId] = room;

            this.id++; //Se incrementa el id
    
            //Se devuelve el id de la sala
            return room.roomId;
    
    }

    deleteRoom(user,roomId) {
        //Se elimina la sala del diccionario
        //NO SE DECREMENTA EL ID
        //Antes de nada, se eliminan a todos los jugadores de la sala
        this.activeRooms[roomId].delRoom(user);
        delete this.activeRooms[roomId];
    }

    joinRoom(roomId, player) {
        //Se añade el jugador a la sala
        // console.log("Se añade el jugador a la sala");
        this.activeRooms[roomId].joinRoom(player);
    }

    leaveRoom(roomId, player) {
        //Se elimina el jugador de la sala
        this.activeRooms[roomId].leaveRoom(player);
    }

    sendMessageToRoom(roomId, message,io) {
        //Se envía el mensaje a la sala
        this.activeRooms[roomId].sendMessage(message,io);
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

    //Buscar jugador en alguna sala
    isPlayerInAnyRoom(player) {
        for (let room in this.activeRooms) {
            if (this.activeRooms[room].isPlayerInRoom(player)) {
                return true;
            }
        }
        return false;
    }


    //eliminar jugador de sala
    //---->Pendiente de autorización
    removePlayer(userLeader, roomID, player) {
        this.activeRooms[roomID].removePlayer(userLeader,player);
    }

    //Devolver un room dado un id
    getRoom(roomID) {
        return this.activeRooms[roomID];
    }

    getPlayer(socket,roomID) {
        return this.activeRooms[roomID].getPlayerBySocket(socket);
    }

    //Misma función que la de arriba, pero con el nickname
    getPlayerByNickname(nickname,roomID) {
        // console.log("Buscando jugador por nickname: " + nickname);
        return this.activeRooms[roomID].getPlayerByNickname(nickname);
    }

    isRoomNameInUse(roomName) {
        console.log("Comprobando si el nombre de sala está en uso: " + roomName);
        for (let room in this.activeRooms) {
            if (this.activeRooms[room].roomName == roomName) {
                console.log("Nombre de sala en uso: " + roomName);
                return true;
            }
        }
        return false;
    }

    getRoom(roomID) {
        return this.activeRooms[roomID];
    }

    addGameController(roomID, gameController) {
        this.activeRooms[roomID].setController(gameController);
    }



}

module.exports = RoomController;