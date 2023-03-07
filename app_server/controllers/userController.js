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
    const { username, email, password } = req.body;

    //Encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Creamos el usuario en la base de datos
    const user = await prisma.usuario.create({
        data: {
            username: username,
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


module.exports = { registerHandler };