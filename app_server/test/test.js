//Importar los ficheros de test y ejecutarlos
//
const testRegistro = require('./ttsFunctions/userTest');

//Ejecutar los tests al mismo tiempo
describe('Tests', () => {
    testRegistro();
});