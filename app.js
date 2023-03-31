const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() // Prisma Client
var http = require('http'); 
var bodyParser = require('body-parser');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//swagger
const swaggerUi = require('swagger-ui-express');
//winston logger
const winston = require('winston');
const cors = require('cors');

const fs = require("fs")
const YAML = require('yaml')

const file  = fs.readFileSync('./public/swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//El css de swagger
app.use('/swagger-ui.css', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist', 'swagger-ui.css')));


app.use("/users", require("./app_server/routes/users"));

module.exports = { app };