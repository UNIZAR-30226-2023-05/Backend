/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\test\ws.test.js
 * Descripción: Pruebas automatizadas para llevar a cabo los tests de WebSockets.
 */
require("dotenv").config();

const { testSalas } = require("./ttsFunctions/webSock");

//Tests de /websock
describe("Tests WEBSOCKETS", () => {
  testSalas();
});
