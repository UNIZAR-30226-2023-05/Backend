const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwt = require("jsonwebtoken"); //importamos jwt para generar el token de autenticacion del usuario
const bcrypt = require("bcryptjs"); //bcrypt es una libreria que nos permite encriptar contraseñas

const { StatusCodes } = require("http-status-codes");
//importamos express (require)
const express = require("express");

//importamos el paquete http-status-codes para manejar los codigos de estado de las respuestas
const { Console } = require("winston/lib/winston/transports");

var { usrToken } = require("../../middleware/auth");

//Función de registro de usuarios
// Parameters: req, res
// Returns: void

//req{
//  body: {
//    nickname: string,
//    email: string,
//    password: string
//}

//res{
//  status: number,
//  body: {
//    message: string
//  }

//  }

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
async function loginHandler(req, res) {
  //Recogemos los datos del usuario
  //MISMOS NOMBRES QUE EN LAS TABLAS DE LA BASE DE DATOS
  const { email, password } = req.body;

  // Obtener el usuario de la base de datos utilizando Prisma
  const user = await prisma.usuario.findUnique({ where: { email } });

  // Comparar la contraseña proporcionada con la contraseña almacenada utilizando bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    //Las contraseñas coinciden
    //Creamos el token:
    //El token se usa para que el usuario no tenga que estar introduciendo sus credenciales cada vez que quiera hacer algo
    //El token lo generamos con el nombre de usuario
    //Y si en 72h no se ha entrado en la cuenta, se vuelve a pedir el login
    var token = usrToken(user.email);

    res.statusCode = StatusCodes.OK;
    res.send({
      ok: true,
      msg: "Logged successfuly",
      token,
    });
    return;
  } else {
    //Las contraseñas no coinciden
    res.statusCode = StatusCodes.UNAUTHORIZED;
    res.send({
      ok: false,
      //no se muestra el mensaje de error concreto para no dar pistas a los hackers
      msg: "Invalid email or password",
    });
    return;
  }
}

//Definimos una función asíncrona para manejar el registro de usuarios (y que no se quede colgado el servidor mientras accede a la base de datos)
async function updateUserHandler(req, res) {
    console.log("VALIDACION CORRECTA updateUserHandler")

    //Las comprobaciones se han validado correctamente, se procede a actualizar la info del usuario

    //tomamos los parametros que haya en el body
    const { id_usuario, nickname, password, monedas, profilephoto } = req.body;

    const datosActualizados = {};

    if (nickname !== undefined) {
        datosActualizados.nickname = nickname;
    }

    if (password !== undefined) {
        //Encriptamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        datosActualizados.password = hashedPassword;
    }

    if (monedas !== undefined) {
        datosActualizados.monedas = monedas;
    }

    if (profilephoto !== undefined) {
        datosActualizados.profilephoto = profilephoto;
    }

    const usuarioActualizado = await prisma.usuario.update({
        where: { id_usuario: id_usuario },
        data: datosActualizados,
    }).then(async function () {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Usuario actualizado correctamente."
        })
        return;
    }).catch( e => {
        console.log("UPDATE ERROR DEL SERVIDOR")
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });

        console.log(e);
    });
}

//Definimos una función asíncrona para eliminar un usuario (y que no se quede colgado el servidor mientras accede a la base de datos)
async function deleteUserHandler(req, res) {
    console.log("VALIDACION CORRECTA deleteUserHandler")

    //Las comprobaciones se han validado correctamente, se procede a eliminar el usuario

    //Tomamos los parametros que haya en la URL
    const id_usuario = parseInt(req.params.id_usuario);

    const usuarioEliminado = await prisma.usuario.delete({
        where: { id_usuario: id_usuario },
    }).then(async function () {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Usuario eliminado correctamente."
        })
        return;
    }).catch( e => {
        console.log("DELETE ERROR DEL SERVIDOR")
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });

        console.log(e);
    });
}

//Definimos una función asíncrona para eliminar un usuario (y que no se quede colgado el servidor mientras accede a la base de datos)
async function getUserIdHandler(req, res) {
    console.log("VALIDACION CORRECTA getUserIdHandler")

    //Las comprobaciones se han validado correctamente, se procede a eliminar el usuario

    //Tomamos los parametros que haya en el body
    const { nickname, email } = req.body;

    const whereClause = {};

    if (nickname !== undefined) {
        whereClause.nickname = nickname;
    }

    if (email !== undefined) {
        whereClause.email = email;
    }

    let consultaId;

    try {
        consultaId = await prisma.usuario.findUnique({
            where: whereClause,
        });
    } catch (error) {
        console.log("GETID ERROR DEL SERVIDOR")
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });
        console.log(error);
        return;
    }

    res.statusCode = StatusCodes.OK;
    res.send({
        ok: true,
        id_usuario: consultaId.id_usuario,
        message: "Usuario existente."
    })
}

async function getUserHandler(req, res, next) {
    console.log("VALIDACION CORRECTA getUserHandler")

    //Las comprobaciones se han validado correctamente, se procede a obtener la info del usuario

    //Tomamos los parametros que haya en la URL
    const id_usuario = parseInt(req.params.id_usuario);

    const datos = await prisma.usuario.findMany({
        select: {
            id_usuario: true,
            nickname: true,
            monedas: true,
            email: true,
            profilephoto: true
          },
        where: { id_usuario: id_usuario },
    }).then(async function (datos) {
        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Petición correcta.",
            datos
        })
        return;
    }).catch( e => {
        console.log("getUserHandler ERROR DEL SERVIDOR")
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });

        console.log(e);
    });
}

async function getLogrosHandler(req, res, next) {
    console.log("VALIDACION CORRECTA getLogrosHandler")

    //Tomamos los parametros que haya en la URL
    const id_usuario = parseInt(req.params.id_usuario);

    const datos = await prisma.logros.findUnique({
        select: {
            juegaunapartida: true,
            ganaunapartida: true,
            ganadiezpartidas: true,
            ganacincuentapartidas: true,
            caeendiezocas: true,
            caeenseisseises: true
        },
        where: { usuario: id_usuario },
    }).then(async function (datos) {
        console.log("Datos: "+datos);
        if (datos === null) {
            datos = {
                "juegaunapartida": false,
                "ganaunapartida": false,
                "ganadiezpartidas": false,
                "ganacincuentapartidas": false,
                "caeendiezocas": false,
                "caeenseisseises": false
            };

            console.log("No hay logros para este usuario"+datos);
        }

        res.statusCode = StatusCodes.OK;
        res.send({
            ok: true,
            message: "Logros recuperados.",
            logros: datos
        })
        return;
    }).catch( e => {
        console.log("getUserHandler ERROR DEL SERVIDOR")
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
            ok: false,
            msg: "Internal error"
        });

        console.log(e);
    });
}

module.exports = { registerHandler, loginHandler, updateUserHandler, 
    deleteUserHandler, getUserIdHandler, getUserHandler, getLogrosHandler};
