var express = require('express')

var socialRouter = express.Router();

//const { isLoggedIn } = require('../middleware/authorization')
const validation  = require('../middleware/validation.js')
const { friendRequestHandler, getFriendRequestsHandler, getFriendsHandler, deleteFriendRequestHandler } = require('../controllers/users/socialController.js');

//Solicitudes de amistad de usuarios (middleware de validacion)
//Cadena de responsabilidad: primero se validan las entradas, luego se trata la solicitud
//enviar solicitud de amistad o aceptar solicitud de amistad (enviar inversa)
socialRouter.post('/friends', validation.friendRequestValidation, friendRequestHandler);
//obtener solicitudes para un usuario
socialRouter.put('/friends/:id_usuario', validation.urlUserValidation, getFriendRequestsHandler);
//obtener amigos de un usuario
socialRouter.get('/friends/:id_usuario', validation.urlUserValidation, getFriendsHandler);
//rechazar solicitud de amistad
socialRouter.delete('/friends', validation.deletefriendRequestValidation, deleteFriendRequestHandler);
module.exports = socialRouter