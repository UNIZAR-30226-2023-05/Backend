const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');    //importamos jwt para generar el token de autenticacion del usuario 
const bcrypt = require("bcryptjs");     //bcrypt es una libreria que nos permite encriptar contraseñas

const { StatusCodes } = require("http-status-codes");
//importamos express (require)
const express = require("express");

//importamos el paquete http-status-codes para manejar los codigos de estado de las respuestas   
const { Console } = require("winston/lib/winston/transports");

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

async function deleteFriendRequestHandler(req, res) {
    console.log("VALIDACION CORRECTA deleteFriendRequestHandler")

    //tomamos los parametros que haya en el body
    const { id_usuario_envia, id_usuario_recibe } = req.body;

        //WARNING: ESTO PUEDE BORRAR MÁS SOLICITUDES DE LAS QUE DEBERÍA
        //Se supone que solo se borra la solicitud inversa y ninguna más
        //No deja hacer delete con un AND y es obligatorio hacer deleteMany para satisfacer ambas condiciones
        //Es probable que borre también otras solicitudes, pero en la comprobación ha funcionado bien
        //Seguir echándole un ojo al funcionamiento de esto por si acaso funciona mal
    await prisma.solicitud.deleteMany({
          where: {
            id_usuario_envia: id_usuario_envia,
            id_usuario_recibe: id_usuario_recibe
          }
        })
    .then(async function () {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Se ha rechazado y eliminado la solicitud de amistad."
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

module.exports = { friendRequestHandler, getFriendRequestsHandler, getFriendsHandler, deleteFriendRequestHandler };