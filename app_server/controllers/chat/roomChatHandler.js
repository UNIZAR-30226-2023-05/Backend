/**
 * @param {*} socket
 */

const roomChatHandler = (socket) => {
  //Enviar mensaje a la sala
  const sendMessage = (user, roomID, message,callback) => {
    //generar mensaje
    const msg = {
      name: user.nickname,
      message: message,
      //hora?
    };

    //Enviar mensaje a la sala
    //evento: roomMessage
    socket.to(roomID).emit("roomMessage", msg);

    callback({
      msg: "message sent",
      status: "ok",
    });
  };

  //Listeners
  socket.on("sendMessage", sendMessage);
};

module.exports = roomChatHandler;