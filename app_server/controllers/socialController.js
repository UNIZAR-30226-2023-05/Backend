const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');    //importamos jwt para generar el token de autenticacion del usuario 
const bcrypt = require("bcryptjs");     //bcrypt es una libreria que nos permite encriptar contraseñas

const { StatusCodes } = require("http-status-codes");
//importamos express (require)
const express = require("express");

//importamos el paquete http-status-codes para manejar los codigos de estado de las respuestas   
const { Console } = require("winston/lib/winston/transports");

//Definimos una función asíncrona para manejar el registro de usuarios (y que no se quede colgado el servidor mientras accede a la base de datos)
async function registerHandler(req, res) {

    //Las comprobaciones se han validado correctamente, se procede a registrar al usuario

    //tomamos los parametros
    const { nickname, email, password } = req.body;


    console.log("VALIDACION CORRECTA")

    //Encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Creamos el usuario en la base de datos
    const user = await prisma.usuario.create({
        data: {
            nickname: nickname,
            email: email,
            password: hashedPassword,
            monedas: 0,
            profilephoto: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
        }
    }).then(async function () {
        res.statusCode = StatusCodes.CREATED;
        res.send({
            ok: true,
            message: "Usuario registrado correctamente."
        })
    }).catch( e => {
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });

        console.log(e);
    });

}

/* Si el login es correcto se devuelve un token de jwt (JSON Web Token) porque 
 * es un estandar para la creacion de tokens de autenticación.
 * Además de ser un estandar, es un estandar que se puede usar en cualquier 
 * lenguaje de programacion */
async function loginHandler(req, res){
    //Recogemos los datos del usuario
    //MISMOS NOMBRES QUE EN LAS TABLAS DE LA BASE DE DATOS
    const { email, password } = req.body;

    // Obtener el usuario de la base de datos utilizando Prisma
    const user = await prisma.usuario.findUnique({ where: { email } });

    // Comparar la contraseña proporcionada con la contraseña almacenada utilizando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if ( passwordMatch ) {
        //Las contraseñas coinciden
        //Creamos el token:
        //El token se usa para que el usuario no tenga que estar introduciendo sus credenciales cada vez que quiera hacer algo
        //El token lo generamos con el nombre de usuario
        //Y si en 720h no se ha entrado en la cuenta, se vuelve a pedir el login
        var token = jwt.sign({ name : email}, process.env.TOKEN_SECRET, { expiresIn: '720h' });

        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            msg: "Logged successfuly",
            token,
        })
        return;
    }
    else {
        //Las contraseñas no coinciden
        res.statusCode = StatusCodes.UNAUTHORIZED;
        res.send({
            ok: false,
            //no se muestra el mensaje de error concreto para no dar pistas a los hackers
            msg: "Invalid email or password"
        })
        return;
    }
}

//Definimos una función asíncrona para registrar solicitudes de amistad (y que no se quede colgado el servidor mientras accede a la base de datos)
//TODO: Comprobar que no se pueda enviar una solicitud a uno mismo (debe hacerse en el front)
async function friendRequestHandler(req, res) {
    console.log("VALIDACION CORRECTA friendRequestHandler")

    //tomamos los parametros que haya en el body
    const { id_usuario_envia, id_usuario_recibe } = req.body;

    //Si existe una solicitud inversa se añaden como amigos automáticamente y se borra dicha solicitud
    const requestExists = await prisma.solicitud
        .findFirst({
            where: {
                AND: [
                    { id_usuario_envia: id_usuario_recibe },
                    { id_usuario_recibe: id_usuario_envia },
                  ],
            },
        })
        .then(async function (requestExists) {
            //Si es nulo, la solicitud inversa no existe
            if (requestExists == null) {
                await prisma.solicitud.create({
                    data: {
                        id_usuario_envia: id_usuario_envia,
                        id_usuario_recibe: id_usuario_recibe
                    }
                }).then(async function () {
                    res.statusCode = StatusCodes.OK;
                    res.send({
                        ok: true,
                        message: "Solicitud enviada correctamente."
                    })
                    return;
                }).catch( e => {
                    console.log("FRIENDREQUEST ERROR DEL SERVIDOR")
                    //Error de servidor
                    res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                    res.send({
                        ok: false,
                        msg: "Internal error"
                    });
            
                    console.log(e);
                });
            }
            else{
                await prisma.$transaction([
                    prisma.amigos.create({
                      data: {
                        id_usuario1: id_usuario_envia,
                        id_usuario2: id_usuario_recibe
                      }
                    }),
                    //WARNING: ESTO PUEDE BORRAR MÁS SOLICITUDES DE LAS QUE DEBERÍA
                    //Se supone que solo se borra la solicitud inversa y ninguna más
                    //No deja hacer delete con un AND y es obligatorio hacer deleteMany para satisfacer ambas condiciones
                    //Es probable que borre también otras solicitudes, pero en la comprobación ha funcionado bien
                    //Seguir echándole un ojo al funcionamiento de esto por si acaso funciona mal
                    prisma.solicitud.deleteMany({
                      where: {
                        id_usuario_envia: id_usuario_recibe,
                        id_usuario_recibe: id_usuario_envia
                      }
                    })
                  ]).then(async function () {
                    res.statusCode = StatusCodes.OK;
                    res.send({
                        ok: true,
                        message: "Se añaden como amigos porque existía solicitud inversa."
                    })
                    return;
                }).catch( e => {
                    console.log("FRIENDREQUEST ERROR DEL SERVIDOR")
                    //Error de servidor
                    res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                    res.send({
                        ok: false,
                        msg: "Internal error"
                    });
            
                    console.log(e);
                });
            }
        })
        .catch((e) => {
            //Error de servidor
            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            res.send({
            ok: false,
            msg: "Internal error",
            });
            console.log(e, "Error en la base de datos");
        });
}

/*Devuelve lista de nicknames de usuarios que han enviado una solicitud de 
amistad al usuario que se ha pasado en la URL*/
async function getFriendRequestsHandler(req, res) {
    console.log("VALIDACION CORRECTA getFriendRequestsHandler")

    //Tomamos los parametros que hay en la URL
    const id_usuario = parseInt(req.params.id_usuario);

    const solicitudes = await prisma.solicitud.findMany({
        select: {
            usuario_solicitud_id_usuario_enviaTousuario: {
                select: { nickname: true }
            }
        },
        where: {
            id_usuario_recibe: id_usuario
        }
    })
    .then(async function (solicitudes) {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Solicitudes para el usuario:",
            solicitudes
        })
        return;
    })
    .catch((e) => {
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error",
        });
        console.log(e, "Error en la base de datos");
    });    
}

/*Devuelve lista de nicknames de usuarios amigos del usuario que se ha pasado en la URL*/
async function getFriendsHandler(req, res) {
    console.log("VALIDACION CORRECTA getFriendsHandler");

    const id_usuario = parseInt(req.params.id_usuario);
    try {
        //Ejecutar la primera consulta
        const amigos = await prisma.amigos.findMany({
          select: {
            usuario_amigos_id_usuario1Tousuario: {
              select: { nickname: true }
            }
          },
          where: {
            id_usuario2: id_usuario
          }
        });
        
        //Ejecutar la segunda consulta
        const amigos2 = await prisma.amigos.findMany({
          select: {
            usuario_amigos_id_usuario2Tousuario: {
              select: { nickname: true }
            }
          },
          where: {
            id_usuario1: id_usuario
          }
        });
        
        //Concatenar los resultados de ambas consultas
        const listaAmigos = amigos.concat(amigos2);
        
        //Extraer solo los nicknames de la lista de amigos
        const nombresAmigos = listaAmigos.map((amigo) => {
            const usuario1 = amigo.usuario_amigos_id_usuario1Tousuario;
            const usuario2 = amigo.usuario_amigos_id_usuario2Tousuario;
            
            if (usuario1 && usuario1.nickname) {
            return usuario1.nickname;
            } else if (usuario2 && usuario2.nickname) {
            return usuario2.nickname;
            } else {
            return null;
            }
        }).filter(Boolean);
        
        //Enviar respuesta
        res.statusCode = StatusCodes.OK;
        res.send({
          ok: true,
          message: "Amigos del usuario:",
          amigos: nombresAmigos
        });
    } catch (e) {
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
          ok: false,
          msg: "Internal error",
        });
        console.log(e, "Error en la base de datos");
    }
      

}

module.exports = { friendRequestHandler, getFriendRequestsHandler, getFriendsHandler};