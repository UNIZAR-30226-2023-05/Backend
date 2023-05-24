/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\utils\eleccionTurno.js
 * Descripción: Funciones para barajar los usuarios antes de comenzar una partida.
 */
function shufflePlayers(users, numUsers) {
  let ordenTurnos = [];

  //Se barajan los jugadores
  while (numUsers > 0) {
    let random = Math.floor(Math.random() * numUsers);
    ordenTurnos.push(users[random]);
    users.splice(random, 1);
    numUsers--;
  }

  return ordenTurnos;
}

module.exports = {
  shufflePlayers,
};
