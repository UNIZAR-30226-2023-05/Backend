#  * Autores: Iker Morán, Jaime Berruete, Leonor Murphy
#  * Fecha: Mayo 2023
#  * Path: Dockerfile
#  * Descripción: Instrucciones para construir la imagen de Docker
FROM node:18.14.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
