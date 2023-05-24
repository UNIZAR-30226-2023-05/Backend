/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: app.js
 * Descripción: Archivo principal del back-end del proyecto de la Oca.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // Prisma Client
var http = require("http");
var bodyParser = require("body-parser");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

//swagger
const swaggerUi = require("swagger-ui-express");
//winston logger
const winston = require("winston");

const fs = require("fs");
const YAML = require("yaml");

const file = fs.readFileSync("./public/swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
//Socket.io
const { Server } = require("socket.io");
const cors = require("cors");
//jwt
const jwt = require("jsonwebtoken");

// express instance
var app = express();

// http server instance to attach Socket.io handlers
const server = http.createServer(app);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//El css de swagger
app.use(
  "/swagger-ui.css",
  express.static(
    path.join(__dirname, "node_modules/swagger-ui-dist", "swagger-ui.css")
  )
);

//controladores websocket
//rutas
var userRouter = require("./app_server/routes/users");
var socialRouter = require("./app_server/routes/social");

app.use("/users", userRouter);
app.use("/social", socialRouter);

numUsers = 0; //numero de usuarios conectados

//Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    port: 3000,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//Token (es un middleware)
io.use((socket, next) => {
  //Antes de empezar, se autentica el usuario
  // console.log(socket.handshake.auth)
  if (socket.handshake.auth && socket.handshake.auth.token) {
    jwt.verify(
      socket.handshake.auth.token,
      process.env.TOKEN_SECRET,
      function (err, decoded) {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        //En socket.decoded tenemos el jwt decodificado (entonces de ahi se pueden sacar los datos del usuario)
        next();
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
});

//Controllers
roomHandler = require("./app_server/controllers/online/roomHandler");
chatHandler = require("./app_server/controllers/chat/roomChatHandler");
gameHandler = require("./app_server/controllers/online/gameHandler");
gameSessionHandler = require("./app_server/controllers/online/gameSessionHandler");
RoomController = require("./app_server/controllers/online/roomController");
GameSessionController = require("./app_server/controllers/online/gameSessionController");
GameControllerClass = require("./app_server/controllers/online/gameController");
privateChatHandler = require("./app_server/controllers/chat/privChatHandler");
privateChatController = require("./app_server/controllers/chat/privChatController");

roomController = new RoomController(); //Instancia del controlador de las salas
gameSessionStorage = new GameSessionController(); //Instancia del controlador de las sesiones
privChat = new privateChatController(io, gameSessionStorage); //Instancia del controlador de los chats privados
// gameController = new GameControllerClass(io, gameSessionStorage); //Instancia del controlador de los juegos

//Socket.io

io.on("connection", async (socket) => {
  // console.log('a user connected');
  numUsers++;

  //Invocamos al controlador de las salas (involved functions...)
  roomHandler(socket, roomController, io);

  //Controlador de los mensajes //por el momento lo dejamos así
  chatHandler(socket);

  //Controlador de las sesiones
  gameSessionHandler(socket, gameSessionStorage, io);

  //Controlador de los chats privados
  privateChatHandler(socket, privChat, io);

  //Controlador de los juegos
  gameHandler(socket, roomController, io);

  //Aquí se pueden añadir más controladores de eventos (WebSockets)

  socket.on("disconnect", () => {
    // console.log('user disconnected');
    numUsers--;
  });
});

module.exports = { app, server, io };
