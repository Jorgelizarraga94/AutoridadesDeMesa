const CAMPOS_OBLIGATORIOS_CHARLA = {
  nombre: "El nombre",
  tema: "El tema",
  fecha: "La fecha",
  horario: "El horario",
  nombreSede: "El nombre de la sede",
  calle: "La calle",
  numero: "El número",
  localidad: "La localidad",
  provincia: "La provincia"
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

  validarFormulario(datos) {
    const errores = [];
    for (const [campo, etiqueta] of Object.entries(CAMPOS_OBLIGATORIOS_CHARLA)) {
      if (validaciones.esVacio(datos[campo])) errores.push(`${etiqueta} es obligatorio.`);
    }
    if (!validaciones.esVacio(datos.fecha) && !validaciones.parsearFechaIso(datos.fecha)) {
      errores.push("Ingresá una fecha válida con formato dd/mm/aaaa.");
    }
    return errores;
  },

  // Alta si los datos no traen id; modificación si lo traen.
  guardar(datos) {
    const errores = this.validarFormulario(datos);
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
          localidad: datos.localidad,
          provincia: datos.provincia
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
