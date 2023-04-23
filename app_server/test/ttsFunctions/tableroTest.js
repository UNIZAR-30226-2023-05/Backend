const predefinidos = require('../../../game_logic/predefinidos');

const tablero = predefinidos.tableroClasico();

const testTablero = () => {
  describe("Test del tablero", () => {
    describe("Test de casillas", () => {
      test("Test de ocas", async () => {
        const ocas = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 63];
        for (let i = 0; i < 13; i++) {
            const res = tablero.execute(ocas[i]);
            expect(res).toStrictEqual([ocas[i+1], true, 0]);
          }
      });
    });
  });
};

module.exports = { testTablero };