var express = require('express')

var userRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { registerHandler, loginHandler, updateUserHandler,  deleteUserHandler, getUserIdHandler } = require('../controllers/userController.js');


//Registro de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se registra
userRouter.post('/register', validation.registerValidation, registerHandler);

userRouter.get('/register', validation.getUserIdValidation, getUserIdHandler);

userRouter.put('/register', validation.updateUserValidation, updateUserHandler);

userRouter.delete('/register', validation.deleteUserValidation, deleteUserHandler);

userRouter.post('/login', validation.loginValidation, loginHandler);




module.exports = userRouter 