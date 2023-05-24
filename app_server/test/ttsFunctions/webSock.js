/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app_server\test\ttsFunctions\socialTest.js
 * Descripción: Tests para comprobar:
  1. OpenSession de un usuario
  2. CloseSession de un usuario
  3. Crear Sala
  4. Unirse a una sala
  5. Mandar mensaje a la sala
  6. Mandar mensaje a un usuario

  Y mas adelante casos erróneos
 */
const io = require("socket.io-client");
const { usrToken } = require("../../middleware/auth");

//Puerto
const port = process.env.PORT || 5001;

//URL
const url = "http://localhost:" + port;
const { server } = require("../../../app");

//Simulación de frontend
function simFrontend(n, done) {
  //Se van a conectar n usuarios al servidor (sin necesidad de login (generamos token))

  let usuarios = {};
  let numUsers = 0;

  for (let i = 0; i < n; i++) {
    //Creamos socket del usuario
    let socket = io.connect(url, {
      auth: {
        token: usrToken("us" + i + "@gmail.com", "Usuario_" + i),
      },
    });

    socket.on("connect", () => {
      numUsers++;

      if (numUsers == n) {
        done();
      }
    });

    socket.on("connect_error", (err) => {
      console.log("Error de conexión: " + err);
      throw err;
    });

    //nickname
    socket.nickname = "Usuario_" + i;

    // socket.emit("openSession", socket.nickname, (data) => {
    //   if (data.ok == true) {
    //     console.log(data.message);
    //   }
    // });

    //Añadimos el socket al array de usuarios
    usuarios[i] = socket;
  }

  // usuarios[0].emit("eliminarSalas");
  // usuarios[0].emit("eliminarSalas");
  return usuarios;
}

//Desconectamos a todos los usuarios
function desconectarGente(usuarios) {
  for (let user in usuarios) {
    // console.log("Desconectando a " + usuarios[user].nickname);
    // usuarios[user].emit("closeSession", usuarios[user].nickname, (data) => {
    //   if (data.ok == true) {
    //     console.log(data.message);
    //   }
    // });

    // console.log("Desconectando a " + usuarios[user].nickname);
    // usuarios[user].emit("closeSession", usuarios[user].nickname, (data) => {
    //   if (data.ok == true) {
    //     console.log(data.message);
    //   }
    // });

    usuarios[user].disconnect();
  }
}

//funcion unir N usuarios a una sala Y
function unirUsuariosSala(usuarios, sala, n, done) {
  numConnected = 1; //El creador de la sala ya esta conectado --> principalmente para los test es el usuario 0
  for (let i = 1; i < n; i++) {
    const user = { nickname: "Usuario_" + i };
    usuarios[i].emit("joinRoom", sala, user, (data) => {
      if (data.status == "error") {
        // console.log(data.message);
        // console.log(data.message);
        throw data.message;
      } else {
        // console.log(data.message);
        // console.log(data.message);
        numConnected++;
      }
      if (numConnected == n) {
        done();
      }
    });
  }
}

/**
 * Test de salas::
 * De momento son tests bastante básicos, se pueden mejorar pero hasta el momento
 * (6/4/2023) falta autenticación y mas comprobaciones de errores
 * -->Cualquier caso de error que se quiera comprobar se puede añadir en el test (es bienvendio)
 */

const testSalas = () => {
  let usuarios = {};

  describe("Test de salas", () => {
    //Dejamos el servidor en escucha
    beforeAll((done) => {
      server.listen(port, () => {
        console.log("Server en escucha en el puerto " + port);
        done();
      });
    });

    //Desconectamos el servidor (tras terminar todos los test)
    afterAll((done) => {
      desconectarGente(usuarios);
      server.close();
      done();
    });

    describe("Test creación de salas", () => {
      beforeAll((done) => {
        usuarios = simFrontend(5, done);
      });

      afterAll((done) => {
        desconectarGente(usuarios);
        done();
      });

      test("Crear sala", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 3, "normal", (data) => {
          expect(data).toHaveProperty("id");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Sala creada correctamente, comparte el ID con tus amigos"
          );

          console.log("ID de la sala: " + data.id);
          done();
        });
      });

      test("Crear sala (habiendo creado una)", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala2", 6, "normal", (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Ya estás en una sala");
          expect(data.status).toBe("error");

          done();
        });
      });

      // Test de crear una sala con menos de dos jugadores
      test("Crear sala (con menos de 2 jugadores)", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala2", 1, "normal", (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "El número de jugadores es menor que el mínimo permitido"
          );
          expect(data.status).toBe("error");

          done();
        });
      });

      // Test de crear una sala con mas de 6 jugadores
      test("Crear sala (con mas de 6 jugadores)", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala2", 7, "normal", (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "El número de jugadores es mayor que el máximo permitido"
          );
          expect(data.status).toBe("error");

          done();
        });
      });

      // Test de crear una sala cuyo nombre ya existe
      test("Crear sala (con nombre ya existente)", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 3, "normal", (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Ya existe una sala con ese nombre");
          expect(data.status).toBe("error");

          done();
        });
      });
    });

    describe("Test unirse a sala", () => {
      beforeAll((done) => {
        usuarios = simFrontend(10, done);
        //Debug, user0 deletes all the rooms in order to restart new tests
        usuarios[0].emit("eliminarSalas");
      });

      afterAll((done) => {
        desconectarGente(usuarios);
        done();
      });

      //Primero hay que crear almenos 2 salas para hacer las pruebas { usuario 0 crea sala 1 y usuario 1 crea sala 2}
      test("Crear salas", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 2, "normal", (data) => {
          expect(data).toHaveProperty("id");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Sala creada correctamente, comparte el ID con tus amigos"
          );

          console.log("ID de la sala: " + data.id);

          const user = { nickname: "Usuario_1" };

          usuarios[1].emit("createRoom", user, "Sala2", 6, "normal", (data) => {
            expect(data).toHaveProperty("id");
            expect(data).toHaveProperty("message");
            //Verificamos que el mensaje sea el correcto
            expect(data.message).toBe(
              "Sala creada correctamente, comparte el ID con tus amigos"
            );

            console.log("ID de la sala: " + data.id);
            done();
          });
        });
      });

      //Test de unirse a una sala correctamente
      test("Unirse a sala correctamente", (done) => {
        const user = { nickname: "Usuario_2" };

        usuarios[2].emit("joinRoom", 1, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Te has unido a la sala " + 1);
          done();
        });
      });

      //Test de unirse a una sala que no existe
      test("Unirse a sala que no existe", (done) => {
        const user = { nickname: "Usuario_2" };

        usuarios[2].emit("joinRoom", 5, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("La sala no existe");
          done();
        });
      });

      //Test de unirse a una sala que ya está llena
      test("Unirse a sala llena", (done) => {
        const user = { nickname: "Usuario_3" };

        usuarios[3].emit("joinRoom", 1, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("La sala está llena");
          done();
        });
      });

      //Estando en la propia sala
      test("Unirse a sala estando en la propia sala", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("joinRoom", 2, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Ya estás en otra sala");
          done();
        });
      });

      //Estando en otra sala
      test("Unirse a sala estando en otra sala", (done) => {
        const user = { nickname: "Usuario_2" };

        usuarios[2].emit("joinRoom", 2, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Ya estás en otra sala");
          done();
        });
      });
    });

    describe("Test abandonar sala", () => {
      beforeAll((done) => {
        usuarios = simFrontend(5, done);
        //Debug, user0 deletes all the rooms in order to restart new tests
        usuarios[0].emit("eliminarSalas");
      });

      afterAll((done) => {
        desconectarGente(usuarios);
        done();
      });

      //Primero hay que crear almenos 2 salas para hacer las pruebas { usuario 0 crea sala 1 y usuario 1 crea sala 2}
      test("Crear salas", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 2, "normal", (data) => {
          expect(data).toHaveProperty("id");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Sala creada correctamente, comparte el ID con tus amigos"
          );

          console.log("ID de la sala: " + data.id);

          const user = { nickname: "Usuario_1" };

          usuarios[1].emit("createRoom", user, "Sala2", 6, "normal", (data) => {
            expect(data).toHaveProperty("id");
            expect(data).toHaveProperty("message");
            //Verificamos que el mensaje sea el correcto
            expect(data.message).toBe(
              "Sala creada correctamente, comparte el ID con tus amigos"
            );

            console.log("ID de la sala: " + data.id);
            done();
          });
        });
      });

      //Test de unirse a una sala correctamente
      test("Abandonar sala correctamente sin ser líder", (done) => {
        const user = { nickname: "Usuario_2" };

        //Primero se une a la sala
        usuarios[2].emit("joinRoom", 4, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Te has unido a la sala " + 4);

          //Ahora abandona la sala
          usuarios[2].emit("leaveTheRoom", 4, (data) => {
            expect(data).toHaveProperty("status");
            expect(data).toHaveProperty("message");
            //Verificamos que el mensaje sea el correcto
            expect(data.message).toBe("Has abandonado la sala " + 4);
            expect(data.status).toBe("ok");
            done();
          });
        });
      }, 10000);

      //volver a unirse a la sala
      test("Volver a unirse a la sala abandonada", (done) => {
        const user = { nickname: "Usuario_2" };

        //Primero se une a la sala
        usuarios[2].emit("joinRoom", 4, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Te has unido a la sala " + 4);

          done();
        });
      });

      //abandonar sala + unirme a otra sala
      test("Abandonar sala sin ser líder + unirme a otra sala activa", (done) => {
        const user = { nickname: "Usuario_2" };

        //Primero se une a la sala

        //Ahora abandona la sala
        usuarios[2].emit("leaveTheRoom", 4, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          expect(data).toHaveProperty("players");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Has abandonado la sala " + 4);
          expect(data.status).toBe("ok");

          //Ahora se une a la sala 5
          usuarios[2].emit("joinRoom", 3, user, (data) => {
            expect(data).toHaveProperty("status");
            expect(data).toHaveProperty("message");
            expect(data).toHaveProperty("players");
            //Verificamos que el mensaje sea el correcto
            expect(data.message).toBe("Te has unido a la sala " + 3);

            done();
          });
        });
      });

      test("Abandonar sala siendo el líder de la misma", (done) => {
        usuarios[0].emit("leaveTheRoom", 3, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Sala destruida correctamente");
          expect(data.status).toBe("ok");
          done();
        });
      });

      test("Unirme a sala que el líder ha abandonado", (done) => {
        const user = { nickname: "Usuario_0" };

        //Como el usuario 0 no está en ninguna sala se ha tenido que implementar una función que busque por socket
        usuarios[0].emit("joinRoom", 3, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("La sala no existe");
          expect(data.status).toBe("error");
          done();
        });
      });

      test("Abandonar sala que no existe", (done) => {
        usuarios[0].emit("leaveTheRoom", 3, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("La sala no existe");
          expect(data.status).toBe("error");
          done();
        });
      });

      test("Abandonar sala no estando en ella", (done) => {
        usuarios[0].emit("leaveTheRoom", 4, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("No estas en ninguna sala");
          expect(data.status).toBe("error");
          done();
        });
      });

      //Test para ver si ya no quedan mas salas
      test("Abandonar sala restante", (done) => {
        usuarios[1].emit("leaveTheRoom", 4, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          // expect(data).toHaveProperty("players");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Sala destruida correctamente");
          expect(data.status).toBe("ok");
          done();
        });
      });
    });

    describe("Test de expulsión de jugador", () => {
      beforeAll((done) => {
        usuarios = simFrontend(10, done);
        //Debug, user0 deletes all the rooms in order to restart new tests
        usuarios[0].emit("eliminarSalas");
      });

      afterAll((done) => {
        desconectarGente(usuarios);
        done();
      });

      //1. Crear sala
      //2. Unirse a sala
      //3. Expulsar a jugador

      test("Crear salas", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 2, "normal", (data) => {
          expect(data).toHaveProperty("id");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Sala creada correctamente, comparte el ID con tus amigos"
          );

          console.log("ID de la sala: " + data.id);

          done();
        });
      });

      //Test de expulsar a un jugador correctamente
      test("Unión correcta a sala", (done) => {
        const user = { nickname: "Usuario_1" };

        //Primero se une a la sala
        usuarios[1].emit("joinRoom", 5, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");
          expect(data).toHaveProperty("players");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Te has unido a la sala " + 5);

          done();
        });
      });

      test("Expulsar a jugador correctamente (líder expulsa a jugador 1)", (done) => {
        const user = { nickname: "Usuario_1" };

        usuarios[0].emit("removePlayerFromRoom", 5, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          //Verificamos que el mensaje sea el correcto
          expect(data.status).toBe("ok");
          expect(data.message).toBe("El jugador ha sido eliminado de la sala");

          done();
        });
      });

      //Fin por ahora de los test de salas
    });
  });
};

module.exports = { testSalas };
