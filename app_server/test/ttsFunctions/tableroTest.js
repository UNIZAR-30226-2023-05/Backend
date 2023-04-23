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

      test("Test de puentes", async () => {
          let res = tablero.execute(6);
          expect(res).toStrictEqual([12, true, 0]);
          res = tablero.execute(12);
          expect(res).toStrictEqual([6, true, 0]);
      });

      test("Test de posada", async () => {
          const res = tablero.execute(19);
          expect(res).toStrictEqual([19, false, 1]);
      });

      test("Test de pozo", async () => {
          const res = tablero.execute(31);
          expect(res).toStrictEqual([31, false, 2]);
      });

      test("Test de laberinto", async () => {
          const res = tablero.execute(42);
          expect(res).toStrictEqual([42, false, 3]);
      });

      test("Test de carcel", async () => {
          const res = tablero.execute(56);
          expect(res).toStrictEqual([56, false, 4]);
      });

      test("Test de dados", async () => {
          let res = tablero.execute(26);
          expect(res).toStrictEqual([53, true, 0]);
          res = tablero.execute(53);
          expect(res).toStrictEqual([26, true, 0]);
      });

      test("Test de calavera", async () => {
          const res = tablero.execute(58);
          expect(res).toStrictEqual([1, false, 0]);
      });

      test("Test de casilla normal", async () => {
          const casillasNormales = [1, 2, 3, 4, 7, 8, 10, 11, 13, 15, 16, 17,
            20, 21, 22, 24, 25, 28, 29, 30, 33, 34, 35, 37, 38, 39, 40, 43, 44,
            46, 47, 48, 49, 51, 52, 55, 57, 60, 61, 62, 63];

          for (let i = 0; i < casillasNormales.length; i++) {
              const res = tablero.execute(casillasNormales[i]);
              expect(res).toStrictEqual([casillasNormales[i], false, 0]);
          }
      });
    });
  });
};

module.exports = { testTablero };