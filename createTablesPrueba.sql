CREATE TABLE Usuarios (
    idUsuario SERIAL NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    PRIMARY KEY (idUsuario)
);