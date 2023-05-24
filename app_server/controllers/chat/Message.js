/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\models\chat\message.js
 * Descripción: Clase Message con sus atributos y métodos necesarios, utilizada
 * para el sistema de mensajería a través del chat.
 */
class Message {
  constructor(sender, receiver, message) {
    this.sender = sender;
    this.receiver = receiver;
    this.message = message;
    this.time = new Date();
  }

  //Getters
  getSender() {
    return this.sender;
  }

  getReceiver() {
    return this.receiver;
  }

  getMessage() {
    return this.message;
  }

  getDate() {
    return this.date;
  }

  getTime() {
    return this.time;
  }

  //Setters
  setSender(sender) {
    this.sender = sender;
  }

  setReceiver(receiver) {
    this.receiver = receiver;
  }

  setMessage(message) {
    this.message = message;
  }

  setDate(date) {
    this.date = date;
  }

  //Methods
  toString() {
    return `Sender: ${this.sender}, Receiver: ${this.receiver}, Message: ${this.message}, Date: ${this.date}`;
  }
}

module.exports = Message;
