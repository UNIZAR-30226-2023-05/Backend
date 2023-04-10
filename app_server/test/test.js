//Importar los ficheros de test y ejecutarlos
//
const { testRegistro, testLogin, delTestUser, testUpdateUser, testGetUserInfo } = require("./ttsFunctions/userTest");

//Ejecutar los tests al mismo tiempo
describe('Tests', () => {
    delTestUser();
    testRegistro();
    testLogin();
    testUpdateUser();
    testGetUserInfo();
});