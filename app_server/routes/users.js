var express = require('express')

var userRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { registerHandler, loginHandler,  deleteUser, changePassword, changeFullName } = require('../controllers/userController.js');


//Registro de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se registra
userRouter.post('/register', validation.registerValidation, registerHandler);

userRouter.post('/login', validation.loginValidation, loginHandler);


// userRouter.delete('/delete', deleteUser);


module.exports = userRouter 