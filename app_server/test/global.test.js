/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\test\global.test.js
 * Descripción: Pruebas automatizadas para llevar a cabo todos los tests.
 */
require("dotenv").config();

const {
  testSolicitud,
  testGetSolicitudes,
  testGetAmigos,
  testRechazarSolicitudes,
} = require("./ttsFunctions/socialTest");
const { testTablero } = require("./ttsFunctions/tableroTest");
const { testSalas } = require("./ttsFunctions/webSock");
const {
  testRegistro,
  testLogin,
  delTestUser,
  testUpdateUser,
  testGetUserInfo,
  testGetUserId,
} = require("./ttsFunctions/userTest");

//Todos los tests juntos para hacer la cobertura de código
describe("AllTests", () => {
  delTestUser();
  testRegistro();
  testLogin();
  testUpdateUser();
  testGetUserInfo();
  testGetUserId();
  //---
  testSolicitud();
  testGetSolicitudes();
  testGetAmigos();
  testRechazarSolicitudes();
  //---
  testTablero();
  //---
  testSalas();
});
