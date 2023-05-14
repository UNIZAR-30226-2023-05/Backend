// Clase player
class Player {
  //Por ahora no necesitamos nada mas

  //--Atributos
  estadisticas = {
    vecesOca: 0,
    vecesSeis: 0,
    vecesCalavera: 0,
  };

  //--Constructor
  constructor(nickname, socket) {
    this.nickname = nickname;
    this.socket = socket;
    this.currentCell = 1; // rectángulo inicial
    this.turnosPendientes = 0;
  }

  //--Métodos
  getNickname() {
    return this.nickname;
  }

  getSocket() {
    return this.socket;
  }

  getCurrentCell() {
    return this.currentCell;
  }

  getTurnosPendientes() {
    return this.turnosPendientes;
  }

  setCurrCell(cell) {
    this.currentCell = cell;
  }

  //--Métodos para estadísticas
  sumaOca() {
    this.estadisticas.vecesOca++;
  }

  sumaSeis() {
    this.estadisticas.vecesSeis++;
  }

  sumaCalavera() {
    this.estadisticas.vecesCalavera++;
  }

  async actualizarEstadisticas(haGanado) {
    // Se asume que el jugador existe
    try {
      // Obtener id de usuario
      const user = await prisma.usuario.findUnique({
        where: { nickname: this.nickname },
      });

      const id_usuario = user.id_usuario;

      // Comprobar si tiene registro en estadísticas
      let estadisticas = await prisma.estadisticasacumuladas.findUnique({
        where: { usuario: id_usuario },
      });

      if (haGanado) {
        partidasGanadas = 1;
      } else {
        partidasGanadas = 0;
      }

      // Actualizar estadísticas
      if (estadisticas == null) {
        // Si no tiene registro, se crea
        await prisma.estadisticasacumuladas.create({
          data: {
            usuario: id_usuario,
            veces_oca: this.estadisticas.vecesOca,
            veces_seis: this.estadisticas.vecesSeis,
            partidasJugadas: 1,
            partidasGanadas: partidasGanadas,
            veces_calavera: this.estadisticas.vecesCalavera,
          },
        });
      } else {
        // Si tiene registro, se actualiza
        await prisma.estadisticasacumuladas.update({
          where: { usuario: id_usuario },
          data: {
            vecesOca: {
              increment: this.estadisticas.vecesOca,
            },
            vecesSeis: {
              increment: this.estadisticas.vecesSeis,
            },
            partidasJugadas: {
              increment: 1,
            },
            partidasGanadas: {
              increment: partidasGanadas,
            },
            vecesCalavera: {
              increment: this.estadisticas.vecesCalavera,
            },
          },
        });
      }

      // Comprobar logros
      // Obtener datos de estadísticas
      estadisticas = await prisma.estadisticasacumuladas.findUnique({
        where: { usuario: id_usuario },
      });

      // Crear valores de logros según estadísticas
      const datalogros = {
        usuario: id_usuario,
        juegaunapartida: true,
        ganaunapartida: estadisticas.partidasGanadas >= 1,
        ganadiezpartidas: estadisticas.partidasGanadas >= 10,
        ganacincuentapartidas: estadisticas.partidasGanadas >= 50,
        caeendiezocas: estadisticas.vecesOca >= 10,
        caeenseisseises: estadisticas.vecesSeis >= 6,
      };

      // Ver si tiene registro en logros
      const logros = await prisma.logros.findUnique({
        where: { usuario: id_usuario },
      });

      // Si no tiene registro, se crea
      if (logros == null) {
        await prisma.logros.create({
          data: datalogros,
        });

        // Cobrar logros conseguidos
        cobrarLogrosNuevos(id_usuario, datalogros);
      } else {
        // Si tiene registro, se actualiza
        await prisma.logros.update({
          where: { usuario: id_usuario },
          data: datalogros,
        });

        // Cobrar logros conseguidos
        cobrarLogrosActualizado(id_usuario, logros, datalogros);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async cobrarLogrosNuevos(id_usuario, datalogros) {
    let monedasSumar = 10; // 10 por jugar una partida
    if (datalogros.ganaunapartida) {
      monedasSumar += 50; // 50 por ganar una partida
    }
    if (datalogros.ganadiezpartidas) {
      monedasSumar += 100; // 100 por ganar 10 partidas
    }
    if (datalogros.ganacincuentapartidas) {
      monedasSumar += 500; // 500 por ganar 50 partidas
    }
    if (datalogros.caeendiezocas) {
      monedasSumar += 20; // 20 por caer en 10 ocas
    }
    if (datalogros.caeenseisseises) {
      monedasSumar += 10; // 10 por caer en 6 seis
    }

    // Sumar monedas al usuario
    await prisma.usuario.update({
      where: { id_usuario: id_usuario },
      data: {
        monedas: {
          increment: monedasSumar,
        },
      },
    });
  }

  async cobrarLogrosActualizado(id_usuario, logros, datalogros) {
    let monedasSumar = 0;
    if (datalogros.ganaunapartida && !logros.ganaunapartida) {
      monedasSumar += 50; // 50 por ganar una partida
    }
    if (datalogros.ganadiezpartidas && !logros.ganadiezpartidas) {
      monedasSumar += 100; // 100 por ganar 10 partidas
    }
    if (datalogros.ganacincuentapartidas && !logros.ganacincuentapartidas) {
      monedasSumar += 500; // 500 por ganar 50 partidas
    }
    if (datalogros.caeendiezocas && !logros.caeendiezocas) {
      monedasSumar += 20; // 20 por caer en 10 ocas
    }
    if (datalogros.caeenseisseises && !logros.caeenseisseises) {
      monedasSumar += 10; // 10 por caer en 6 seis
    }

    // Sumar monedas al usuario
    await prisma.usuario.update({
      where: { id_usuario: id_usuario },
      data: {
        monedas: {
          increment: monedasSumar,
        },
      },
    });
  }

  printPlayerInfo() {
    console.log("Nickname: " + this.nickname);
    console.log("Celda Actual: " + this.currentCell);
    console.log("turnosPendientes: " + this.turnosPendientes);
  }
}

module.exports = Player;
