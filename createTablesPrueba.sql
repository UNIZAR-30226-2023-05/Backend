/* Autores: Iker Morán, Jaime Berruete, Leonor Murphy
 * Fecha: Mayo 2023
 * Path: createTablesPrueba.sql
 * Descripción: Tabla de prueba para la base de datos del juego de la Oca.
 */
CREATE TABLE Usuarios (
    idUsuario SERIAL NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    PRIMARY KEY (idUsuario)
);