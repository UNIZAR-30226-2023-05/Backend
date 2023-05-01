// Import the shufflePlayers function
const { shufflePlayers } = require("./eleccionTurno");

// Sample players dictionary
const players = {
  player1: { nickname: "player1", socket: "socket1" },
  player2: { nickname: "player2", socket: "socket2" },
  player3: { nickname: "player3", socket: "socket3" },
  player4: { nickname: "player4", socket: "socket4" },
};

// Specify the desired length for the shuffled players
const length = 3;

// Call the shufflePlayers function
const shuffledPlayers = shufflePlayers(players, length);

// Display the shuffled players
console.log("Shuffled Players:");
console.log(shuffledPlayers);
