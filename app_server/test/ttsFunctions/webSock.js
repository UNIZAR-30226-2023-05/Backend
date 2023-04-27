//Test para comprobar:
//1. OpenSession de un usuario
//2. CloseSession de un usuario
//3. Crear Sala
//4. Unirse a una sala
//5. Mandar mensaje a la sala
//6. Mandar mensaje a un usuario

//Y mas adelante casos erróneos

const io = require("socket.io-client");
const { usrToken } = require("../../middleware/auth");

//Puerto
const port = process.env.PORT || 5000;

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
      }
    });

    socket.on("connect", () => {
      numUsers++;
      // console.log('Usuario conectado');
      //Si se han conectado todos los usuarios se termina la función
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

    //Añadimos el socket al array de usuarios
    usuarios[i] = socket;
  }

  return usuarios;
}

//Desconectamos a todos los usuarios
function desconectarGente(usuarios) {
  for (let user in usuarios) {
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
        console.log(data.message);
        throw data.message;
      } else {
        console.log(data.message);
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

    describe("Test correctos de solo un usuario", () => {
      beforeAll((done) => {
        usuarios = simFrontend(8, done);
      });

      test("Crear sala", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("createRoom", user, "Sala1", 6, "normal", (data) => {
          expect(data).toHaveProperty("id");
          expect(data).toHaveProperty("message");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Sala creada correctamente, comparte el ID con tus amigos"
          );
          done();
        });
      });

      test ("Unirse a una sala que no existe", (done) => {
        const user = { nickname: "Usuario_1" };

        usuarios[1].emit("joinRoom", 5, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          expect(data.status).toBe("error");
          expect(data.message).toBe("La sala no existe");

          done();

        });

      });

      test("Unirse a una sala estando ya en ella", (done) => {
        const user = { nickname: "Usuario_0" };

        usuarios[0].emit("joinRoom", 0, user, (data) => {
          expect(data).toHaveProperty("status");
          expect(data).toHaveProperty("message");

          expect(data.status).toBe("error");
          expect(data.message).toBe("Ya estás en la sala");

          done();

        });

      });


      test("Unirse a una sala", (done) => {
        unirUsuariosSala(usuarios, 0, 5, done);
      });


      test("Mandar mensaje a la sala", (done) => {
        const texto = "Hola a todos";
        usuarios[0].emit("sendMessage", 0, texto, (data) => {
          expect(data).toHaveProperty("msg");
          expect(data).toHaveProperty("status");
          //Verificamos que el mensaje sea el correcto
          expect(data.msg).toBe("message sent");
          expect(data.status).toBe("ok");

          done();
        });
      });

      test("Eliminar a un usuario de la sala -> siendo líder", (done) => {
        const user = "Usuario_1"
        usuarios[0].emit("removePlayerFromRoom", 0, user, (data) => {
          expect(data).toHaveProperty("message");
          expect(data).toHaveProperty("status");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("El jugador ha sido eliminado de la sala");
          expect(data.status).toBe("ok");

          done();
        });
      });

      test("Comenzar partida", (done) => {
        usuarios[0].emit("startGame", 0, 12000, (data) => {
          expect(data).toHaveProperty("message");
          expect(data).toHaveProperty("status");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe(
            "Partida iniciada"
          );
          expect(data.status).toBe("ok");
          done();
        });
      });

      test("Borrar sala", (done) => {
        usuarios[0].emit("destroyRoom", 0, (data) => {
          expect(data).toHaveProperty("message");
          expect(data).toHaveProperty("status");
          //Verificamos que el mensaje sea el correcto
          expect(data.message).toBe("Sala destruida correctamente");
          expect(data.status).toBe("ok");

          done();
        });
      });
    });
  });
};

module.exports = { testSalas };
