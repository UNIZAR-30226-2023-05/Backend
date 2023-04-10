const register = require("../../controllers/userController").registerHandler;
const login = require("../../controllers/userController").loginHandler;

const request = require("supertest");
const { app } = require("../../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../middleware/auth.js");
const prisma = new PrismaClient();

function solicitudTest(id_usuario_envia, id_usuario_recibe, expected) {
  return (
    request(app)
      //.post tenemos que poner la ruta a la que queremos acceder
      .post("/social/friends")
      .set("Accept", "application/json") //set headers
      .send({
        id_usuario_envia: id_usuario_envia,
        id_usuario_recibe: id_usuario_recibe
      }) //set body
      .then(async (response) => {
        await expected(response);
        console.log(response.body);
      })
  );
}

const testSolicitud = () => {
  describe("Test de social", () => {
    describe("Test de solicitudes de amistad", () => {
      beforeAll(async () => {
        var sal = await bcrypt.genSalt(10); //encriptamos la contraseña
        var hash = await bcrypt.hash("AAinolosecontrasena!!!!!33", sal);
        //creamos dos usuarios en la base de datos
        await prisma.usuario.create({
          data: {
              id_usuario: 1,
              nickname: "test",
              email: "traspas@gmail.com",
              password: hash,
              monedas: 0,
              profilephoto: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
          }
        });

        await prisma.usuario.create({
          data: {
              id_usuario: 2,
              nickname: "test2",
              email: "traspas2@gmail.com",
              password: hash,
              monedas: 0,
              profilephoto: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
          }
        });
      });

      describe("Test de solicitud de amistad con datos correctos", () => {
        test("Test de solicitud de amistad con datos correctos", async () => {
          return solicitudTest(
            1, 2, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.OK);
            }
          );
        });

        test("Test de solicitud de amistad inversa que acepta solicitud", async () => {
          return solicitudTest(
            2, 1, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.OK);
            }
          );
        });
      });

      describe("Test de solicitud de amistad con datos incorrectos", () => {
        test("Test de solicitud de amistad que no existe el que envia", async () => {
          return solicitudTest(
            3, 2, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Test de solicitud de amistad que no existe el que recibe", async () => {
          return solicitudTest(
            1, 3, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Test de solicitud de amistad a uno mismo", async () => {
          return solicitudTest(
            1, 1, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        test("Test de solicitud de amistad a un amigo actual", async () => {
          return solicitudTest(
            1, 2, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });

        //Borramos todos los amigos de la base de datos (De momento estos test no necesitan que persistan los datos)
        prisma.amigos.deleteMany({});

        //Creamos solicitud de amistad que luego repetiremos
        prisma.amigos.create({
          data: {
            id_usuario_envia: 1,
            id_usuario_recibe: 2
          }
        });

        test("Test de solicitud de amistad repetida", async () => {
          return solicitudTest(
            1, 2, async (response) => {
              expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
            }
          );
        });
      });

      afterAll(async () => {
        //Borramos todos los amigos de la base de datos (De momento estos test no necesitan que persistan los datos)
        await prisma.usuario.deleteMany({});
        await prisma.solicitud.deleteMany({});
      });

    });
  });
};       

module.exports = {testSolicitud};