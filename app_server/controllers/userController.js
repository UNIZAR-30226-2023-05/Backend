//PARA TODOS LOS CONTROLLERS SE IMPORTARAN PRISMA Y EXPRESS

//El user controller se encarga de manejar las peticiones que se hacen a la base de datos referentes a los usuarios (CRUD -> Create, Read, Update, Delete)
//Trataria login, registro, ver perfil (tanto de chef como de usuario)
//import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const jwt = require('jsonwebtoken');    //importamos jwt para generar el token de autenticacion del usuario 
const bcrypt = require("bcryptjs");     //bcrypt es una libreria que nos permite encriptar contraseñas

//importamos express (require)
const express = require("express");

//importamos el paquete http-status-codes para manejar los codigos de estado de las respuestas
const { StatusCodes } = require('http-status-codes');   



//Función de registro de usuarios
// Parameters: req, res
// Returns: void

//req{
//  body: {
//    username: string,
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
    const { nombre, email, password } = req.body;

    //Encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Creamos el usuario en la base de datos
    const user = await prisma.usuarios.create({
        data: {
            nombre: nombre,
            email: email,
            password: hashedPassword
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

module.exports = { registerHandler, loginHandler };