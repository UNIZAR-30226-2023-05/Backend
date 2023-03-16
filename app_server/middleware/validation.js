//Fichero para validar los datos de entrada de cualquier request

const Joi = require("joi");
//El registro consta de 3 campos:
//Nombre de usuario, email y contraseña
//El nombre de usuario debe ser unico y no puede estar vacio (no puede ser null)
//El email debe ser unico y no puede estar vacio (no puede ser null)
//La contraseña debe tener al menos 8 caracteres, una mayuscula, una minuscula y un numero
//La contraseña no puede estar vacia (no puede ser null)

//Usamos el paquete JOI para validar los datos de entrada:co
//https://joi.dev/api/?v=17.4.0

//importamos el paquete http-status-codes para manejar los codigos de estado de las respuestas
const { StatusCodes } = require("http-status-codes");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* Comprueba:
 * - Que el nombre del usuario y el email no estén ya en uso
 */
async function registerValidation(req, res, next) {
  //Creamos un objeto de validacion
  const schema = Joi.object({
    nickname: Joi.string().min(3).max(50).required(),
    //.email() comprueba que el string sea un email valido
    correoelectronico: Joi.string().email().required(),
    contrasena: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"))
      .required(),
  });

  //Validamos el objeto de entrada
  const { error } = schema.validate(req.body);

  //Si hay algun error, se devuelve un mensaje de error
  if (error) {
    res.statusCode = StatusCodes.BAD_REQUEST;
    res.send({
      ok: false,
      msg: "Lo sentimos, los datos introducidos no son validos.",
    });
  } else {
    //Despues de validar los datos, se comprueba que el nombre de usuario y el email no esten ya en uso
    const { nickname, correoelectronico } = req.body;
    console.log(req.body);

    console.log("Datos validos");

    //Comprobamos que el nombre de usuario no este en uso
    const usernametInUse = await prisma.usuario
      .findUnique({
        where: {
          nickname: nickname,
        },
      })
      .then(async function (usernameInUse) {
        //Si no es nulo, el nombre de usuario esta en uso
        if (usernameInUse !== null) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          res.send({
            ok: false,
            msg: "Lo sentimos, el nombre de usuario ya esta en uso.",
          });
        } else {
          //Comprobamos que el email no este en uso
          const emailInUse = await prisma.usuario
            .findUnique({
              where: {
                correoelectronico: correoelectronico,
              },
            })
            .then(async function (emailInUse) {
              if (emailInUse !== null) {
                res.statusCode = StatusCodes.BAD_REQUEST;
                res.send({
                  ok: false,
                  msg: "Lo sentimos, el email ya esta en uso.",
                });
              } else {
                //Si no hay errores, se pasa al siguiente middleware
                next();
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
}

/* Comprueba:
 * - Que el email existe
 * - Que la contraseña tiene un formato válido
 */
async function loginValidation(req, res, next) {
  //Creamos un objeto de validacion
  const schema = Joi.object({
    correoelectronico: Joi.string().email().required(),
    contrasena: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"))
      .required(),
  });

  //Validamos el objeto de entrada
  const { error } = schema.validate(req.body);

  //Si hay algun error, se devuelve un mensaje de error
  if (error) {
    res.statusCode = StatusCodes.BAD_REQUEST;
    res.send({
      ok: false,
      msg: "Lo sentimos, los datos introducidos no son validos.",
    });
  } else {
    //Despues de validar los datos, se comprueba que el email ya está en uso
    const { correoelectronico } = req.body;

    //Comprobamos que el email se usa solo una vez
    const emailInUse = await prisma.usuario
      .findUnique({
        where: {
          correoelectronico: correoelectronico,
        },
      })
      .then(async function (emailInUse) {
        //Si es nulo, el email no está en uso
        if (emailInUse == null) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          res.send({
            ok: false,
            msg: "Lo sentimos, ese email no tiene asociada ninguna cuenta.",
          });
        } else {
          //Si no hay errores, se pasa al siguiente middleware
          next();
        }
      })
      .catch((e) => {
        //Error de servidor
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send({
          ok: false,
          msg: "Internal error",
        });
      });
  }
}

module.exports = { registerValidation, loginValidation };
