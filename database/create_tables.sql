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
    
    FOREIGN KEY (id_usuario1) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_usuario2) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_usuario1, id_usuario2)
);

-- Tabla de solicitudes de amistad
CREATE TABLE Solicitud(
    id_usuario_envia INTEGER,
    id_usuario_recibe INTEGER,
    
    FOREIGN KEY (id_usuario_envia) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_recibe) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_usuario_envia, id_usuario_recibe)
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
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de ficha
CREATE TABLE Ficha(
    id_ficha serial, 
    id_skin INTEGER,

    PRIMARY KEY (id_ficha),
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de posee
CREATE TABLE Posee(
    usuario INTEGER,
    id_skin INTEGER,

    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_skin) REFERENCES Skin(id_skin) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (usuario, id_skin)
);

-- Tabla de mensaje
CREATE TABLE Mensaje(
    id_mensaje serial,
    fecha VARCHAR(10) NOT NULL, -- estilo DD/MM/AAAA
    hora VARCHAR(8) NOT NULL, -- estilo HH:MM:SS
    contenido TEXT NOT NULL,
    emisor INTEGER NOT NULL, --emisor
    destinatario INTEGER NOT NULL, --destinatario

    FOREIGN KEY (emisor) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (destinatario) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_mensaje)
);

-- Tabla de estadisticasAcumuladas 
CREATE TABLE EstadisticasAcumuladas(
    usuario INTEGER, -- usuario al que pertenecen las estadísticas
    vecesOca INTEGER NOT NULL, -- veces que ha caído en la oca
    vecesSeis INTEGER NOT NULL, -- veces que ha tocado 6
    partidasJugadas INTEGER NOT NULL, -- número de partidas jugadas
    partidasGanadas INTEGER NOT NULL, -- número de partidas ganadas
    vecesCalavera INTEGER NOT NULL, -- veces que ha caído en la calavera

    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (usuario)
);

-- Tabla de logros. Cada logro es un booleano que indica si el usuario lo ha conseguido o no.
-- True lo ha conseguido, false no lo ha conseguido.
CREATE TABLE Logros(
    usuario INTEGER,
    juegaUnaPartida BOOLEAN NOT NULL,
    ganaUnaPartida BOOLEAN NOT NULL,
    ganaDiezPartidas BOOLEAN NOT NULL,
    ganaCincuentaPartidas BOOLEAN NOT NULL,
    caeEnDiezOcas BOOLEAN NOT NULL,
    caeEnSeisSeises BOOLEAN NOT NULL,

    FOREIGN KEY (usuario) REFERENCES Usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (usuario)
)
