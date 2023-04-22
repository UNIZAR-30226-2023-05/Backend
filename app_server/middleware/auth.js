const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

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

module.exports = { usrToken, webSocketAuth };
