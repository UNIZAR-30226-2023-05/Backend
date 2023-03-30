
const register = require('../../controllers/userController').registerHandler;
const login = require('../../controllers/userController').loginHandler;

const request = require("supertest");
const { app } = require("../../../app");
const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
//const { signToken } = ...
const prisma = new PrismaClient();


function regTest(nickname, email, password, expected) {
    return request(app)
        //.post tenemos que poner la ruta a la que queremos acceder
        .post("/users/register")
        .set("Accept", "application/json") //set headers
        .send({ nickname: nickname, email: email, password: password }) //set body
        .then(async (response) => {
            await expected(response);
        });

}       


const testRegistro = () => { //test de registro
    describe("Test de Usuarios", () => {
        beforeAll(async () => {
                //borramos el usuario de la base de datos para que no interfiera en los siguientes tests
                await prisma.usuario.delete({
                    where: {
                        nickname: "test"
                    }
                }).catch((err) => {
                    console.log(err);
                });
            });

    describe("Test de registro", () => {
        // beforeAll(async () => {
        //     var salt = await bcrypt.genSalt(10); //encriptamos la contraseña
        //     var hashedPassword = await bcrypt.hash("AAinolosecontrasena!!!!!33", salt);

        //     //creamos un usuario en la base de datos
        //     await prisma.usuario.create({
        //         data: {
        //             nickname: "Pre-test",
        //             email: "traspas@gmail.com",
        //             password: hashedPassword,
        //             monedas: 0,
        //             profilephoto: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
        //         }
        //     });
        // });
        describe("Test de registro con datos correctos", () => {
            // beforeAll(async () => {
            //     //borramos el usuario de la base de datos para que no interfiera en los siguientes tests
            //     await prisma.usuario.delete({
            //         where: {
            //             nickname: "test"
            //         }
            //     }).catch((err) => {
            //         console.log(err);
            //     });
            // });

            test("Registro con datos correctos", async () => {
                return regTest
                    (
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
            // afterAll(async () => {
            //     //borramos el usuario de la base de datos para que no interfiera en los siguientes tests
            //     await prisma.usuario.delete({
            //         where: {
            //             nickname: "test"
            //         }
            //     });
            // });

            //Casos erróneos:
            //1. Nickname vacío	
            //2. Email vacío
            //3. Password vacío
            //4. Nickname ya existente
            //5. Email ya existente
            //6. Password demasiado corta
            //7. Password incorrecta (no cumple los requisitos)

            test("Registro con nickname vacío", async () => {
                return regTest
                    (
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
                return regTest
                    (
                        "AAAAA",
                        "yoskun@gmail.com",
                        "",
                        async (response) => {
                            //La respuesta esperada tiene que ser un 400
                            expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
                        }
                    );
            });

            test("Registro con email vacío", async () => {
                return regTest
                    (
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
                return regTest
                    (
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
                return regTest
                    (
                        "testinho",
                        "traspas@gmail.com",
                        "AAinolosecontrasena!!!!!33",
                        async (response) => {
                            //La respuesta esperada tiene que ser un 201
                            expect(response.statusCode).toBe(StatusCodes.CONFLICT);
                        }
                    );
            });

            test("Registro con constraseña chicota", async () => {
                return regTest
                    (
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
                return regTest
                    (
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


module.exports = testRegistro;