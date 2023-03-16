-- Tablas para la base de datos del juego de la oca

-- Tabla de usuario
CREATE TABLE Usuario(
    nickname VARCHAR(20) NOT NULL,
    contrasena VARCHAR(128) NOT NULL,
    monedas INTEGER,
    correoElectronico VARCHAR(128) NOT NULL UNIQUE,
    fotoPerfil TEXT,
    amigo_de VARCHAR(128) REFERENCES Usuario(correoElectronico),

    PRIMARY KEY (correoElectronico)
);

-- Tabla de sala
CREATE TABLE Sala(
    id_sala serial,
    correoElectronico VARCHAR(128),
    modo INTEGER NOT NULL, -- 0 clásico, 1 alternativo (también se puede con un text y check)
    nombre VARCHAR(50) NOT NULL,

    PRIMARY KEY (id_sala),
    FOREIGN KEY (correoElectronico) REFERENCES Usuario(correoElectronico)
);

-- Tabla de partida
CREATE TABLE Partida(
    id_partida serial,
    id_sala serial,

    PRIMARY KEY (id_partida),
    FOREIGN KEY (id_sala) REFERENCES Sala(id_sala)
);

-- Tabla de skin
CREATE TABLE Skin(
    id_skin serial,
    imagen TEXT NOT NULL,
    precio INTEGER NOT NULL,

    PRIMARY KEY (id_skin)
);

-- Tabla de tablero
CREATE TABLE Tablero(
    id_tablero serial,
    id_skin serial,

    PRIMARY KEY (id_tablero),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin)
);

-- Tabla de ficha
CREATE TABLE Ficha(
    id_ficha serial, 
    id_skin serial,

    PRIMARY KEY (id_ficha),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin)
);

-- Tabla de posee
CREATE TABLE Posee(
    correoElectronico VARCHAR(128),
    id_skin serial,

    PRIMARY KEY (correoElectronico, id_skin),
    FOREIGN KEY (correoElectronico) REFERENCES Usuario(correoElectronico),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin)
);

-- Tabla chat
CREATE TABLE Chat(
    id_chat serial,

    PRIMARY KEY (id_chat)
);

-- Tabla de mensaje
CREATE TABLE Mensaje(
    id_mensaje serial,
    fecha VARCHAR(10) NOT NULL,
    hora VARCHAR(8) NOT NULL,
    contenido TEXT NOT NULL,
    id_chat serial, -- pertenece a un chat
    correoElectronico VARCHAR(128) NOT NULL UNIQUE, --remitente

    PRIMARY KEY (id_mensaje),
    FOREIGN KEY (id_chat) REFERENCES Chat(id_chat),
    FOREIGN KEY (correoElectronico) REFERENCES Usuario(correoElectronico)
);

-- Tabla de privado
CREATE TABLE chatPrivado(
    id_chatPrivado serial,
    correoElectronico1 VARCHAR(128),
    correoElectronico2 VARCHAR(128),
    
    PRIMARY KEY (id_chatPrivado),    
    FOREIGN KEY (id_chatPrivado) REFERENCES Chat(id_chat),
    FOREIGN KEY (correoElectronico1) REFERENCES Usuario(correoElectronico),
    FOREIGN KEY (correoElectronico2) REFERENCES Usuario(correoElectronico)
);

-- Tabla de partida
CREATE TABLE chatPartida(
    id_chatPartida serial,
    id_partida serial,

    PRIMARY KEY (id_chatPartida),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida)
);

-- Tabla de estadisticasAcumuladas 
CREATE TABLE EstadisticasAcumuladas(
    correoElectronico VARCHAR(128), -- usuario al que pertenecen las estadísticas
    vecesCaido INTEGER NOT NULL, -- veces que ha caído en la oca
    tiros INTEGER NOT NULL,
    veces6 INTEGER NOT NULL, -- veces que ha tocado 6
    partidasGanadas INTEGER NOT NULL, 
    vecesCalavera INTEGER NOT NULL, -- veces que ha caído en la calavera

    PRIMARY KEY (correoElectronico),
    FOREIGN KEY (correoElectronico) REFERENCES Usuario(correoElectronico)
);

-- Tabla situacion (N:M)
CREATE TABLE Situacion(
    correoElectronico VARCHAR(128),
    id_partida serial,
    casilla INTEGER NOT NULL,
    turno INTEGER NOT NULL, -- booleano
    
    PRIMARY KEY (correoElectronico, id_partida),
    FOREIGN KEY (correoElectronico) REFERENCES Usuario(correoElectronico),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida)
);
