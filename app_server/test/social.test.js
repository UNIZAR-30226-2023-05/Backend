/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\test\social.test.js
 * Descripción: Pruebas automatizadas para llevar a cabo los tests del sistema
 * de amigos.
 */
require("dotenv").config();

const {
  testSolicitud,
  testGetSolicitudes,
  testGetAmigos,
  testRechazarSolicitudes,
} = require("./ttsFunctions/socialTest");

describe("Tests parte 2", () => {
  //Tests de /social
  testSolicitud();
  testGetSolicitudes();
  testGetAmigos();
  testRechazarSolicitudes();
});
