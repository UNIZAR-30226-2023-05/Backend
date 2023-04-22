//Controlador de las salas. Se importará el controlador (con socket) y cuando se quiera inciar una sala se llamará a la función roomController
//Se importará en app.js

const Player = require("./player");

/**
 *
 * @param {*} socket         Socket del cliente que ha creado la sala
 * @param {*} GameController Controlador de las salas
 */

const roomHandler = (socket, GameController, io) => {
}
  

module.exports = roomHandler;
