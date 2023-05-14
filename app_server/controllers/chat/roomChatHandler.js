/**
 * @param {*} socket
 */

const roomChatHandler = (socket) => {
  //Enviar mensaje a la sala
  function sendMessageRoom(roomId, messageContent, callback) {
    roomId = parseInt(roomId);
    //Check if the room exists
    if (!roomController.isRoomActive(roomId)) {
      callback({
        message: "La sala no existe",
        status: "error",
      });
      return;
    }

    //Check if the user is in the room --> nunca se va a dar porque el usuario no puede enviar mensajes si no está en la sala
    let user = roomController.getPlayer(socket, roomId);
    if (user == null) {
      callback({
        message: "El usuario no está en la sala",
        status: "error",
      });
      return;
    }

    //Check if the message is empty
    if (messageContent.trim().length == 0) {
      callback({
        message: "El mensaje está vacío",
        status: "error",
      });
      return;
    }

    //Check if the message is too long
    if (messageContent.trim().length > 1000) {
      callback({
        message: "El mensaje es demasiado largo",
        status: "error",
      });
      return;
    }

    //Check if the user is muted  ...?

    //Enviar mensaje a la sala
    //Enviar mensaje a la sala
    //evento: roomMessage

    msg = {
      user: user.nickname,
      message: messageContent,
      date: new Date().toLocaleDateString(),
    };

    socket.to(roomId).emit("roomMessage", msg);

    console.log(msg);

    callback({
      msg: "message sent",
      status: "ok",
    });
  }

  //Listeners
  socket.on("sendMessage", sendMessageRoom);
};

module.exports = roomChatHandler;
