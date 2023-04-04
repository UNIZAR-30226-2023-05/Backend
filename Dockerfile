FROM node

#copiar <origem> <destino>
COPY ./package.json .
COPY ./package-lock.json .

COPY . .

#Antes de exponer el puerto instalar las dependencias y generar el cliente de prisma
RUN npm install && npx prisma generate

#Exponer el puerto del servidor para ser consumido por otros
EXPOSE 5000

#Ejecutar el comando para iniciar el servidor (para iniciar el backend)
CMD npm run start
