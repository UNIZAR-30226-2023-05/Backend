require('dotenv').config();


const { testSolicitud, testGetSolicitudes, testGetAmigos, testRechazarSolicitudes } = require("./ttsFunctions/socialTest");
const { testTablero } = require("./ttsFunctions/tableroTest");
const { testSalas } = require("./ttsFunctions/webSock");
const { testRegistro, testLogin, delTestUser, testUpdateUser, testGetUserInfo, testGetUserId } = require("./ttsFunctions/userTest");

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
    }
);

