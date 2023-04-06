const register = require("../../controllers/userController").registerHandler;
const login = require("../../controllers/userController").loginHandler;

const request = require("supertest");
const { app } = require("../../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../middleware/auth.js");
const prisma = new PrismaClient();

function regTest(nickname, email, password, expected) {
  return (
    request(app)
      //.post tenemos que poner la ruta a la que queremos acceder
      .post("/users/register")
      .set("Accept", "application/json") //set headers
      .send({ nickname: nickname, email: email, password: password }) //set body
      .then(async (response) => {
        await expected(response);
      })
  );
}

function logTest(email, password,expected) {
    return (
        request(app)
            .post("/users/login")
            .set("Accept", "application/json")
            .send({ email: email, password: password })
            .then(async (response) => {
                await expected(response);
            })

    );
}

const delTestUser = async () => {
    await prisma.usuario
        .delete({
            where: {
                nickname: "test",
            },
        })
        .catch((err) => {
            console.log(err);
        });
};


const testRegistro = () => {
  //test de registro
  describe("Test de Usuarios", () => {
    describe("Test de registro", () => {
      describe("Test de registro con datos correctos", () => {
        test("Registro con datos correctos", async () => {
          return regTest(
            "test",
            "traspas@gmail.com",
            "AAinolosecontrasena!!!!!33",
            async (response) => {
              //La respuesta esperada tiene que ser un 201
              expect(response.statusCode).toBe(StatusCodes.CREATED);
            }
          );
        });
      });

      describe("Test de registro con datos incorrectos", () => {
        test("Registro con nickname vacío", async () => {
          return regTest(
            "",
            "yoskun@gmail.com",
            "AAinolosecontrasena!!!!!33",
            async (response) => {
              //La respuesta esperada tiene que ser un 400
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Registro con contraseña vacío", async () => {
          return regTest("AAAAA", "yoskun@gmail.com", "", async (response) => {
            //La respuesta esperada tiene que ser un 400
            expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          });
        });

        test("Registro con email vacío", async () => {
          return regTest(
            "AAAA",
            "",
            "AAinolosecontrasena!!!!!33",
            async (response) => {
              //La respuesta esperada tiene que ser un 400
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Registro con USUARIO ya existente", async () => {
          return regTest(
            "test",
            "traaaaaaspas@gmail.com",
            "AAinolosecontrasena!!!!!33",
            async (response) => {
              //La respuesta esperada tiene que ser un 201
              expect(response.statusCode).toBe(StatusCodes.CONFLICT);
            }
          );
        });

        test("Registro con EMAIL ya existente", async () => {
          return regTest(
            "testinho",
            "traspas@gmail.com",
            "AAinolosecontrasena!!!!!33",
            async (response) => {
              //La respuesta esperada tiene que ser un 201
              expect(response.statusCode).toBe(StatusCodes.CONFLICT);
            }
          );
        });

        test("Registro con constraseña corta", async () => {
          return regTest(
            "testinho",
            "traspas@gmail.com",
            ".aA3",
            async (response) => {
              //La respuesta esperada tiene que ser un 201
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Registro con constraseña mala", async () => {
          return regTest(
            "testinho",
            "traspas@gmail.com",
            "perroviejo",
            async (response) => {
              //La respuesta esperada tiene que ser un 201
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });
      });
    });
  });
};

const testLogin = () => {
    describe("Test de usuarios", () => {
      //Antes de ejecutar los test, creamos un usuario en la base de datos
      beforeAll(async () => {

        //Borramos todos los usuarios de la base de datos (De momento estos test no necesitan que persistan los datos)
        await prisma.usuario.deleteMany({});


        var sal = await bcrypt.genSalt(10); //encriptamos la contraseña
        var hash = await bcrypt.hash("AAinolosecontrasena!!!!!33", sal);

        //creamos un usuario en la base de datos
        await prisma.usuario.create({
            data: {
                nickname: "test",
                email: "traspas@gmail.com",
                password: hash,
                monedas: 0,
                profilephoto: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
            }
        });

      });

        describe("Test de login", () => {
            describe("Test de login con datos correctos", () => {
                test ("Login con datos correctos", async () => {
                    return logTest(
                        "traspas@gmail.com",
                        "AAinolosecontrasena!!!!!33",
                        async (response) => {
                            //La respuesta esperada tiene que ser un 201
                            expect(response.statusCode).toBe(StatusCodes.OK);
                        }
                    );
                });
            });

        });

        //Login con datos incorrectos
        describe("Test de login con datos incorrectos", () => {
            test("E-mail inexistente", async () => {
                return logTest(
                  //E-mail inexistente: no existe en la base de datos
                    "huevo@gmail.com",
                    "AAinolosecontrasena!!!!!33",
                    async (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    }
                );
                  });
            test("Contraseña incorrecta", async () => {
                return logTest(
                    "traspas@gmail.com",
                    "AAinolosecontrasena!!!!!33333",
                    async (response) => {
                        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
                    }
                );
            });

            test("E-mail vacío", async () => {
                return logTest(
                    "",
                    "AAinolosecontrasena!!!!!33",
                    async (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    }
                );
            });

            test("Contraseña inválida (consideramos cualquier caso erróneo)", async () => {
                return logTest(
                    "traspas@gmail.com",
                    "AAinolosecontrasena!!!!!",
                    async (response) => {
                        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                    }
                );
            });
        });

        afterAll(async () => {
            //Borramos todos los usuarios de la base de datos (De momento estos test no necesitan que persistan los datos)
            await prisma.usuario.deleteMany({});
        });

    });
};


                        

module.exports = { testRegistro, testLogin, delTestUser };
