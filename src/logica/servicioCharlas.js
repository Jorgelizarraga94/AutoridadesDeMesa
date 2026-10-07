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

  estaDisponibleInscripcion() {
    const charlas = this.consultarCharlas();
    if (charlas.length === 0) return false;

    const primeraCharla = charlas[0];
    const ultimaCharla = charlas[charlas.length - 1];
    const apertura = new Date(`${primeraCharla.fecha}T${primeraCharla.horario}:00`);
    const cierre = new Date(`${ultimaCharla.fecha}T23:59:59.999`);
    const ahora = new Date();
    return ahora >= apertura && ahora <= cierre;
  },

  buscarPorId(id) { return repositorioCharlas.buscarPorId(id); },

  validar(datos) {
    const errores = [];
    for (const [campo, etiqueta] of Object.entries(CAMPOS_OBLIGATORIOS_CHARLA)) {
      if (validaciones.esVacio(datos[campo])) errores.push(`${etiqueta} es obligatorio.`);
    }
    if (!validaciones.esVacio(datos.fecha) && !validaciones.parsearFechaIso(datos.fecha)) {
      errores.push("Ingresá una fecha válida con formato dd/mm/aaaa.");
    }
    if (validaciones.parsearCoordenadaDms(datos.latitud, 90, ["N", "S"]) === null) {
      errores.push('La latitud debe estar en grados, minutos y segundos (por ejemplo, 34° 32\' 33.72" S) y dentro del rango de 90°.');
    }
    if (validaciones.parsearCoordenadaDms(datos.longitud, 180, ["E", "O", "W"]) === null) {
      errores.push('La longitud debe estar en grados, minutos y segundos (por ejemplo, 58° 42\' 43.20" O) y dentro del rango de 180°.');
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
          latitud: validaciones.parsearCoordenadaDms(datos.latitud, 90, ["N", "S"]),
          longitud: validaciones.parsearCoordenadaDms(datos.longitud, 180, ["E", "O", "W"])
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
