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
        usuarios = simFrontend(5, done);
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

      test("Unirse a una sala", (done) => {
        unirUsuariosSala(usuarios, 0, 3, done);
      });
    });

    //Fin por ahora de los test de salas
  });
};

module.exports = { testSalas };