require('dotenv').config();

const { testSolicitud, testGetSolicitudes, testGetAmigos, testRechazarSolicitudes } = require("./ttsFunctions/socialTest");

describe('Tests parte 2', () => {
    //Tests de /social
    testSolicitud();
    testGetSolicitudes();
    testGetAmigos();
    testRechazarSolicitudes();
});
