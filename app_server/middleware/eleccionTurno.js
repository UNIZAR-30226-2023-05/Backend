//Dado un diccionario {player.nickname, player.socket} y una longitud
//devuelve el mismo diccionario pero con los jugadores aleatorios (shuffle de turnos)

function shuffleArray(array) {
    //Se crea un array vacío
    let newArray = [];
    //Se recorre el array pasado por parámetro
    for (let i = 0; i < array.length; i++) {
      //Se añade un elemento aleatorio del array pasado por parámetro al array vacío
      newArray.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
    }
    //Se devuelve el array vacío
    return newArray;
  }
  
  function shufflePlayers(players, length) {
    //Se crea un array de jugadores
    let playersArray = [];
    //Se recorre el diccionario de jugadores
    for (let player in players) {
      //Se añade el jugador al array
      playersArray.push(players[player]);
    }
    //Se baraja el array de jugadores
    playersArray = shuffleArray(playersArray);
    //Se crea un diccionario de jugadores
    let playersDic = {};
    //Se recorre el array de jugadores
    for (let i = 0; i < length; i++) {
      //Se añade el jugador al diccionario
      playersDic[playersArray[i].nickname] = playersArray[i];
    }
    //Se devuelve el diccionario de jugadores
    return playersDic;
  }
  
  module.exports = {shufflePlayers};
  