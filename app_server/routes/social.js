var express = require('express')

var socialRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { friendRequestHandler } = require('../controllers/socialController.js');

//Solicitudes de amistad de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se trata la solicitud
socialRouter.post('/friends', validation.friendRequestValidation, friendRequestHandler);


module.exports = socialRouter