var express = require('express')

var userRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { registerHandler, loginHandler, updateUserHandler,  deleteUserHandler, 
    getUserIdHandler, getUserHandler, getLogrosHandler, getRankingPartidasHandler,
    getRankingOcasHandler, getEstadisticasHandler } = require('../controllers/users/userController.js');


//Registro de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se registra
userRouter.post('/register', validation.registerValidation, registerHandler);

userRouter.get('/register', validation.getUserIdValidation, getUserIdHandler);

userRouter.put('/register', validation.updateUserValidation, updateUserHandler);

userRouter.delete('/register/:id_usuario', validation.urlUserValidation, deleteUserHandler);

userRouter.post('/login', validation.loginValidation, loginHandler);


//Estadísticas
userRouter.get('/logros/:id_usuario', validation.urlUserValidation, getLogrosHandler);
userRouter.get('/ranking/partidas', getRankingPartidasHandler);
userRouter.get('/ranking/ocas', getRankingOcasHandler);
userRouter.get('/estadisticas/:id_usuario', validation.urlUserValidation, getEstadisticasHandler);

//Obtener datos de un usuario excepto la contraseña cifrada
userRouter.get('/:id_usuario', validation.urlUserValidation, getUserHandler);

module.exports = userRouter 