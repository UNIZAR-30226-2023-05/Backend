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
    email: Joi.string().email().required(),
    password: Joi.string()
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
    const { nickname, email } = req.body;
    console.log(req.body);

    console.log("Datos validos");

    //Comprobamos que el nombre de usuario no este en uso
    const usernameInUse = await prisma.usuario
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
                email: email,
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
    email: Joi.string().email().required(),
    password: Joi.string()
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
    const { email } = req.body;

    //Comprobamos que el email se usa solo una vez
    const emailInUse = await prisma.usuario
      .findUnique({
        where: {
          email: email,
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

/* Comprueba:
 * - Que se le pasa un id de usuario que existe
 * - Que se le pasa un nickname que no está en uso (opcional)
 * - Que se le pasa una contraseña que cumpla el formato (opcional)
 * - Que se le pasa un numero de monedas positivo (opcional)
 * - Que se le pasa una foto de perfil (opcional)
 */
async function updateUserValidation(req, res, next) {
  //Creamos un objeto de validacion
  const schema = Joi.object({
    id_usuario: Joi.number().required(),
    nickname: Joi.string().min(3).max(50),
    //email: Joi.string().email(), no permite cambiar email
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")),
    monedas: Joi.number().min(0),
    profilephoto: Joi.string(),
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
    //Despues de validar los datos, se comprueba que el id de usuario existe
    const { id_usuario, nickname } = req.body;
    console.log(req.body);

    //Comprobamos que el id de usuario existe
    const userExists = await prisma.usuario
      .findUnique({
        where: {
          id_usuario: id_usuario,
        },
      })
      .then(async function (userExists) {
        //Si es nulo, el id de usuario no esta en uso (debe existir para poder hacer cambios)
        if (userExists == null) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          res.send({
            ok: false,
            msg: "Lo sentimos, el id del usuario al que quiere cambiar sus datos no existe.",
          });
        } else {
          //Comprobamos que el nombre de usuario no este en uso si se ha recibido
          if (nickname !== undefined) {
            const usernameInUse = await prisma.usuario
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
          else{
            //No hay que comprobar nada de nickname y schema correcto: se pasa al siguiente middleware
            next();
          }
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

    console.log("Datos validos");
  }
}

/*
  * Comprueba:
  * - Que se le pasa un id de usuario que existe
*/
async function deleteUserValidation(req, res, next) {
  //Creamos un objeto de validacion
  if (req.params.id_usuario == undefined || isNaN(req.params.id_usuario)) {
    res.statusCode = StatusCodes.BAD_REQUEST;
    res.send({
      ok: false,
      msg: "Lo sentimos, los datos introducidos no son validos.",
    });
  } else {
    const id_usuario = parseInt(req.params.id_usuario);
    //Despues de validar los datos, se comprueba que el id de usuario existe
    const userExists = await prisma.usuario
      .findUnique({
        where: {
          id_usuario: id_usuario,
        },
      })
      .then(async function (userExists) {
        //Si es nulo, el id de usuario no esta en uso (debe existir para poder hacer cambios)
        if (userExists == null) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          res.send({
            ok: false,
            msg: "Lo sentimos, el id del usuario que quiere eliminar no existe.",
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
    console.log("Datos validos");
  }
}

/* Comprueba:
 * - Que se le pasa un nickname que está en uso (opcional)
 * - Que se le pasa un email que está en uso (opcional)
 * - Que se le pasa un parámetro
 */
async function getUserIdValidation(req, res, next) {
  //Creamos un objeto de validacion
  const schema = Joi.object({
    nickname: Joi.string().min(3).max(50),
    email: Joi.string().email(),
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
    //Despues de validar los datos, se comprueba que el id de usuario existe
    const { nickname, email } = req.body;
    console.log(req.body);

    //Comprobamos que se ha recibido un parametro
    if ((nickname == undefined && email !== undefined) || (nickname !== undefined && email == undefined)) {
      if (nickname !== undefined) { //Se ha recibido nickname
        const usernameInUse = await prisma.usuario
        .findUnique({
           where: {
               nickname: nickname,
           },
        })
        .then(async function (usernameInUse) {
           //Si es nulo, el nombre de usuario no existe
           if (usernameInUse == null) {
              res.statusCode = StatusCodes.BAD_REQUEST;
              res.send({
              ok: false,
              msg: "Lo sentimos, el nombre de usuario no existe.",
            });
            return;
          }
          else{
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
      else { //Se ha recibido email
        const emailInUse = await prisma.usuario
        .findUnique({
           where: {
               email: email,
           },
        })
        .then(async function (emailInUse) {
           //Si es nulo, el email de usuario no existe
           if (emailInUse == null) {
              res.statusCode = StatusCodes.BAD_REQUEST;
              res.send({
              ok: false,
              msg: "Lo sentimos, el email de usuario no existe.",
            });
            return;
          }
          else{
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
    } else {
      res.statusCode = StatusCodes.BAD_REQUEST;
      res.send({
          ok: false,
          msg: "Lo sentimos, debe proporcionar un parámetro.",
        });
      return;
    }
    console.log("Datos validos");
  }
}

//SOCIAL

/* Comprueba:
 * - Que se le pasan dos id de usuario que existen
 */
async function friendRequestValidation(req, res, next) {
  //Creamos un objeto de validacion
  const schema = Joi.object({
    id_usuario_envia: Joi.number().required(),
    id_usuario_recibe: Joi.number().required(),
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
    //Despues de validar los datos, se comprueba que los id de usuario existen
    const { id_usuario_envia, id_usuario_recibe } = req.body;
    console.log(req.body);

    //Comprobamos que se ha recibido un parametro
    if (id_usuario_envia !== undefined && id_usuario_recibe !== undefined && id_usuario_envia !== id_usuario_recibe) {
      //Comprobamos que existe el usuario que envia la solicitud
      const userExists = await prisma.usuario
        .findUnique({
          where: {
            id_usuario: id_usuario_envia,
          },
        })
        .then(async function (userExists) {
          //Si es nulo, el id de usuario no esta en uso (debe existir para poder hacer cambios)
          if (userExists == null) {
            res.statusCode = StatusCodes.BAD_REQUEST;
            res.send({
              ok: false,
              msg: "Lo sentimos, el id del usuario que manda la petición no existe.",
            });
            return;
          }
          else{
            //Comprobamos que existe el usuario que recibe la solicitud
            const userExists2 = await prisma.usuario
              .findUnique({
                where: {
                  id_usuario: id_usuario_recibe,
                },
              })
              .then(async function (userExists2) {
                //Si es nulo, el id de usuario no esta en uso (debe existir para poder hacer cambios)
                if (userExists2 == null) {
                  res.statusCode = StatusCodes.BAD_REQUEST;
                  res.send({
                    ok: false,
                    msg: "Lo sentimos, el id del usuario que recibiría la petición no existe.",
                  });
                  return;
                }
                else{
                  //Comprobamos que la petición no existe en la BBDD
                  const requestExists = await prisma.solicitud
                    .findUnique({
                      where: {
                        id_usuario_envia: id_usuario_envia,
                        id_usuario_recibe: id_usuario_recibe,
                      },
                    })
                    .then(async function (requestExists) {
                      //Si es nulo, la solicitud no existe
                      if (requestExists !== null) {
                        res.statusCode = StatusCodes.BAD_REQUEST;
                        res.send({
                          ok: false,
                          msg: "Lo sentimos, ya existe una solicitud entre estos dos usuarios.",
                        });
                        return;
                      }
                      const friendExists = await prisma.amigos.findFirst({
                        where: {
                          OR: [
                            {
                              id_usuario1: id_usuario_envia,
                              id_usuario2: id_usuario_recibe,
                            },
                            {
                              id_usuario1: id_usuario_recibe,
                              id_usuario2: id_usuario_envia,
                            },
                          ],
                        },
                      });
                      if (friendExists !== null) {
                        res.statusCode = StatusCodes.BAD_REQUEST;
                        res.send({
                          ok: false,
                          msg: "Lo sentimos, ya existe una relación de amigos entre estos dos usuarios.",
                        });
                        return;
                      }
                      //Si no hay errores, se pasa al siguiente middleware
                      next();
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
    } else {
      res.statusCode = StatusCodes.BAD_REQUEST;
      res.send({
          ok: false,
          msg: "Lo sentimos, debe proporcionar dos id de usuarios distintos.",
        });
      return;
    }
    console.log("Datos validos friend request validation");
  }
}


//exportamos las funciones de validacion
module.exports = { registerValidation, loginValidation, updateUserValidation, deleteUserValidation, getUserIdValidation, friendRequestValidation };
