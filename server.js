/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: server.js
 * Descripción: Servidor para el juego de la Oca.
 */
require("dotenv").config();

var port = process.env.port || 4000;

var { app, server, io } = require("./app");

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//------------------OLD CODE------------------
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
