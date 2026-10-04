const CAMPOS_OBLIGATORIOS_CHARLA = {
  nombre: "El nombre",
  tema: "El tema",
  fecha: "La fecha",
  horario: "El horario",
  nombreSede: "El nombre de la sede",
  calle: "La calle",
  numero: "El número"
};

const servicioCharlas = {
  // Ordenadas por fecha y horario: las más próximas primero.
  consultarCharlas() {
    return repositorioCharlas.obtenerTodas()
      .sort((a, b) => (a.fecha + a.horario).localeCompare(b.fecha + b.horario));
  },

  buscarPorId(id) { return repositorioCharlas.buscarPorId(id); },

  validar(datos) {
    const errores = [];
    for (const [campo, etiqueta] of Object.entries(CAMPOS_OBLIGATORIOS_CHARLA)) {
      if (validaciones.esVacio(datos[campo])) errores.push(`${etiqueta} es obligatorio.`);
    }
    if (validaciones.parsearCoordenada(datos.latitud, 90) === null) {
      errores.push("La latitud debe ser un número entre -90 y 90.");
    }
    if (validaciones.parsearCoordenada(datos.longitud, 180) === null) {
      errores.push("La longitud debe ser un número entre -180 y 180.");
    }
    return errores;
  },

  // Alta si los datos no traen id; modificación si lo traen.
  guardar(datos) {
    const errores = this.validar(datos);
    if (errores.length > 0) return { ok: false, errores };

    const charla = new Charla({
      id: datos.id ? Number(datos.id) : Date.now(),
      nombre: datos.nombre,
      tema: datos.tema,
      fecha: datos.fecha,
      horario: datos.horario,
      sede: {
        nombre: datos.nombreSede,
        direccion: {
          calle: datos.calle,
          numero: datos.numero,
          latitud: validaciones.parsearCoordenada(datos.latitud, 90),
          longitud: validaciones.parsearCoordenada(datos.longitud, 180)
        }
      }
    });

    try {
      repositorioCharlas.guardar(charla);
      return { ok: true, errores: [] };
    } catch (error) {
      return { ok: false, errores: ["No se pudo guardar la charla. Revisá el espacio del navegador."] };
    }
  },

  eliminar(id) { repositorioCharlas.eliminar(id); }
};
