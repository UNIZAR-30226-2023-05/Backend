/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\controllers\chat\privChatHandler.js
 * Descripción: Handler de la comunicación privada entre amigos a través del chat.
 */

var Message = require("./Message");

/**
 * @param {*} socket
 * @param {*} privChatController
 */

const privChatHandler = (socket, privChatController) => {
  function sendMessageHandler(sender, receiver, message, callback) {
    //generar mensaje
    const msg = new Message(sender, receiver, message);

    //Enviar mensaje al usuario (privChatController)
    privChatController.sendMessage(msg);

    //Una vez enviado o almacenado el mensaje, se envía al cliente
    callback({
      msg: "message sent",
      status: "ok",
    });
  }

  //restores the messages between two users (when someone connects into the chat)
  function getMessagesHandler(sender, receiver, callback) {
    /**
     * receiver-sender is the chat between the two users
     */
    console.log("Me piden los mensajes entre ", receiver, " y ", sender);
    privChatController
      .recoverChat(receiver, sender)
      .then((messages) => {
        callback({
          messages: messages,
          status: "ok",
        });
      })
      .catch((err) => {
        callback({
          status: "error",
          error: err,
        });
      });
  }

  //Listeners
  socket.on("sendPrivMessage", sendMessageHandler);
  socket.on("getPrivMessage", getMessagesHandler);
};

module.exports = privChatHandler;
