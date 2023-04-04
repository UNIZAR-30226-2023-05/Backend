var express = require('express')

var socialRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { friendRequestHandler, getFriendRequestsHandler, getFriendsHandler } = require('../controllers/socialController.js');

//Solicitudes de amistad de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se trata la solicitud
socialRouter.post('/friends', validation.friendRequestValidation, friendRequestHandler);
//obtener solicitudes para un usuario
socialRouter.put('/friends/:id_usuario', validation.urlUserValidation, getFriendRequestsHandler);
//obtener amigos de un usuario
socialRouter.get('/friends/:id_usuario', validation.urlUserValidation, getFriendsHandler);
//aceptar o rechazar solicitud de amistad
//socialRouter.delete
module.exports = socialRouter