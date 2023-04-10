//Importar los ficheros de test y ejecutarlos
//
const { testRegistro, testLogin, delTestUser, testUpdateUser, testGetUserInfo, testGetUserId } = require("./ttsFunctions/userTest");
const { testSolicitud, testGetSolicitudes, testGetAmigos, testRechazarSolicitudes } = require("./ttsFunctions/socialTest");

//Ejecutar los tests al mismo tiempo
describe('Tests', () => {
    //Hay que ejecutar los test por separados porque si no da conflictos la BD
    /*
    //Tests de /users
    delTestUser();
    testRegistro();
    testLogin();
    testUpdateUser();
    testGetUserInfo();
    testGetUserId();
    */

    //Tests de /social
    testSolicitud();
    testGetSolicitudes();
    testGetAmigos();
    testRechazarSolicitudes();
});