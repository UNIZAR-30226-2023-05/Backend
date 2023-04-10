// Token de autenticación

const jwt = require("jsonwebtoken");

// Función para generar el token
function signToken(email) {
  return jwt.sign({ email }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  });
}

module.exports = { signToken };