CREATE TABLE Usuarios (
    idUsuario SERIAL NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    PRIMARY KEY (idUsuario)
);