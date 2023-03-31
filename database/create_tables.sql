-- Tablas para la base de datos del juego de la oca

-- Tabla de usuario
CREATE TABLE Usuario(
    id_usuario serial,
    nickname VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    monedas INTEGER NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    profilePhoto TEXT,

    PRIMARY KEY (id_usuario)
);

-- Tabla de amigos
CREATE TABLE Amigos(
    id_usuario1 INTEGER,
    id_usuario2 INTEGER,
    
    FOREIGN KEY (id_usuario1) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_usuario2) REFERENCES Usuario(id_usuario),
    PRIMARY KEY (id_usuario1, id_usuario2)
);

-- Tabla de Sala
CREATE TABLE Sala(
    id_sala serial,
    modo INTEGER NOT NULL, -- 0 clásico, 1 alternativo
    nombre VARCHAR(50) NOT NULL,

    PRIMARY KEY (id_sala)
);

-- Tabla de Forma Parte
CREATE TABLE FormaParte(
    usuario INTEGER,
    sala INTEGER,
    
    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (sala) REFERENCES Sala(id_sala),
    PRIMARY KEY (usuario, sala)
);

-- Tabla de Partida
CREATE TABLE Partida(
    id_partida serial,
    id_sala INTEGER,

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
    id_skin INTEGER,

    PRIMARY KEY (id_tablero),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin)
);

-- Tabla de ficha
CREATE TABLE Ficha(
    id_ficha serial, 
    id_skin INTEGER,

    PRIMARY KEY (id_ficha),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin)
);

-- Tabla de posee
CREATE TABLE Posee(
    usuario INTEGER,
    id_skin INTEGER,

    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin),
    PRIMARY KEY (usuario, id_skin)
);

-- Tabla chat
CREATE TABLE Chat(
    id_chat serial,

    PRIMARY KEY (id_chat)
);

-- Tabla de mensaje
CREATE TABLE Mensaje(
    id_mensaje serial,
    fecha VARCHAR(10) NOT NULL, -- estilo DD/MM/AAAA
    hora VARCHAR(8) NOT NULL, -- estilo HH:MM:SS
    contenido TEXT NOT NULL,
    chat INTEGER NOT NULL, -- pertenece a un chat
    remitente INTEGER NOT NULL, --remitente

    FOREIGN KEY (chat) REFERENCES Chat(id_chat),
    FOREIGN KEY (remitente) REFERENCES Usuario(id_usuario),
    PRIMARY KEY (id_mensaje)
);

-- Tabla de privado
CREATE TABLE chatPrivado(
    id_chatPrivado INTEGER,
    usuario1 INTEGER,
    usuario2 INTEGER,
        
    FOREIGN KEY (id_chatPrivado) REFERENCES Chat(id_chat),
    FOREIGN KEY (usuario1) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (usuario2) REFERENCES Usuario(id_usuario),
    PRIMARY KEY (id_chatPrivado)
);

-- Tabla de partida
CREATE TABLE chatPartida(
    id_chatPartida INTEGER,
    id_partida INTEGER,
    
    FOREIGN KEY (id_chatPartida) REFERENCES Chat(id_chat),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    PRIMARY KEY (id_chatPartida)
);

-- Tabla de estadisticasAcumuladas 
CREATE TABLE EstadisticasAcumuladas(
    usuario INTEGER, -- usuario al que pertenecen las estadísticas
    vecesCaido INTEGER NOT NULL, -- veces que ha caído en la oca
    tiros INTEGER NOT NULL,
    veces6 INTEGER NOT NULL, -- veces que ha tocado 6
    partidasGanadas INTEGER NOT NULL, 
    vecesCalavera INTEGER NOT NULL, -- veces que ha caído en la calavera

    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario),
    PRIMARY KEY (usuario)
);

-- Tabla situacion (N:M)
CREATE TABLE Situacion(
    usuario INTEGER,
    id_partida INTEGER,
    casilla INTEGER NOT NULL,
    turno INTEGER NOT NULL, -- booleano
    
    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    PRIMARY KEY (usuario, id_partida)
);