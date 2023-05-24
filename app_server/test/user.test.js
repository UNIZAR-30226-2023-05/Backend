/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\test\user.test.js
 * Descripción: Pruebas automatizadas para llevar a cabo los tests del sistema
 * de usuarios.
 */
require("dotenv").config();

//Importar los ficheros de test y ejecutarlos
//
const {
  testRegistro,
  testLogin,
  delTestUser,
  testUpdateUser,
  testGetUserInfo,
  testGetUserId,
} = require("./ttsFunctions/userTest");

//Ejecutar los tests al mismo tiempo
describe("Tests parte 1", () => {
  //Hay que ejecutar los test por separados porque si no da conflictos la BD
  //Tests de /users
  delTestUser();
  testRegistro();
  testLogin();
  testUpdateUser();
  testGetUserInfo();
  testGetUserId();
});
