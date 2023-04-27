const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//...

// Función para generar el token
function usrToken(email, nickname) {
  return jwt.sign({ email, nickname }, process.env.TOKEN_SECRET, {
    expiresIn: "720h",
  });
}

//websocket middleware
async function webSocketAuth(socket, next) {
  // console.log('socket', socket.handshake.query);

  //1. get token from query string
  const token = socket.socket.handshake.auth;
  if (!token) {
    //if no token, return error
    return next(new Error("Authentication error"));
  }
  try {
    //2. verify the token, first parameter is token, second is secret
    const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
    socket.decoded = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
}

// Función para comprobar que un token es de un usuario dado su id
// Usarla en las funciones de API que los usuarios ofrecen un id
// Devuelve false si no está autorizado y true en caso contrario
async function tokenAuth(token, id_usuario) {
  try {
    const user = await prisma.usuario.findUnique({ where: { id_usuario } });
    if (!user) {
      return false; // No se encontró un usuario con el id proporcionado
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (decoded.email !== user.email) {
      return false; // El email del token no coincide con el email del usuario
    }

    return true; // El token pertenece al usuario
  } catch (error) {
    console.error(error);
    return false; // Error al verificar el token o encontrar el usuario
  }
}

module.exports = { usrToken, webSocketAuth, tokenAuth };
