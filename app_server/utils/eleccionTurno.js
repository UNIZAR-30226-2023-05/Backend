

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
    shufflePlayers
};