//Path: app_server\controllers\chat\privChatController.js

//1.0 privChatController

const { PrismaClient } = require("@prisma/client");

class PrivChatController {
  //Controller to handle private chat between friends

  //We have 2 cases:
  //1. Both users are online
  //2. One of the users is offline

  //Case 1: Both users are online
  //1. We send the message to the receiver
  //2. Check if the receiver is connected
  //3.1 If the receiver is connected, we send the message to the receiver
  //3.2 Store the message in the database

  //Case 2: One of the users is offline
  //1. We send the message to the receiver
  //2. Check if the receiver is connected
  //3.1 If the receiver is not connected we just store the message in the database

  //And when the receiver connects, we send him all the messages that were stored in the database
  //like "recover the chat", every time a user connects in the chat with someone, we send him all the messages
  //that were stored in the database

  //--Atributes
  //1. io: socket.io instance
  //2. sessionStorage: session controller instance

  constructor(io, sessionStorage) {
    this.io = io;
    this.sessionStorage = sessionStorage;
    this.prisma = new PrismaClient();
  }
  //Function to send a message to a user
  async sendMessage(msg) {
    //We check if the receiver is connected
    //If the receiver is connected, we send the message to the receiver
    //If the receiver is not connected, we just store the message in the database

    //receiver
    const receiver = msg.receiver;
    //sender
    const sender = msg.sender;

    //We check if the receiver is connected
    console.log("receiver: ", receiver);
    console.log("sender: ", sender);
    if (this.sessionStorage.isConnected(receiver)) {
      //If the receiver is connected, we send the message to the receiver
      //We get the socket of the receiverW
      let receiverSocket = this.sessionStorage.getSocket(receiver);

      console.log("receiverSocket: ", receiverSocket);
      //We send the message to the receiver
      receiverSocket.emit("privMessage", msg);
    }
    //We store the message in the database (prisma)
    //We create the message

    //Search for the id by the nickname
    const userSender = await this.prisma.usuario.findUnique({
        where: {
            nickname: sender,
        },
    });
    const send_id = userSender.id_usuario;
    console.log("send_id: ",send_id);

    const userReceiver = await this.prisma.usuario.findUnique({
        where: {
            nickname: receiver,
        },
    });
    const rec_id = userReceiver.id_usuario;
    console.log("rec_id: ",rec_id);

    const dateTimeString = msg.time.toLocaleString();
    const fechaMsg = dateTimeString.substring(0,9);
    const horaMsg = dateTimeString.substring(11,19);

    const message = await this.prisma.mensaje.create({
        data: {
            //id: autoincremental
            //fecha_hora : msg.date,
            fecha: fechaMsg,
            hora: horaMsg,
            contenido : msg.message,
            //id_usuario_emisor
            //id_usuario_receptor
            emisor : send_id,
            destinatario : rec_id,
        },
    });
    console.log("Nuevo mensaje almacenado: ",message);
  }

  //Function to recover the chat
  async recoverChat(user, otherUser) {
    /*If the user connects and checks the chat with someone, we send him all the messages
    that were stored in the database
    We get all the messages between the two users (user and otherUser) and (otherUser and user)
    We get the messages between user and otherUser

        SELECT * FROM mensaje WHERE (id_usuario_emisor = user AND id_usuario_receptor = otherUser) OR (id_usuario_emisor = otherUser AND id_usuario_receptor = user)
        */
    console.log("Se va a intentar recuperar los mensajes");
    const messages = await this.prisma.mensaje.findMany({
        where: {
            OR: [
                {
                    emisor: user,
                    destinatario: otherUser,
                },
                {
                    emisor: otherUser,
                    destinatario: user,
                },
            ],
        },
    });
    console.log("Mensajes recuperados: ",messages);
    return messages;
  }
}

//Export the class
module.exports = PrivChatController;
