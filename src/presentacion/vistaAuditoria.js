const vistaAuditoria = {
  iniciar() {
    this.revision = document.getElementById("revision-auditoria");
    this.sinPendientes = document.getElementById("sin-pendientes");
    this.panelPendientes = document.getElementById("panel-pendientes");
    this.panelFinalizadas = document.getElementById("panel-finalizadas");
    this.sinFinalizadas = document.getElementById("sin-finalizadas");
    this.tablaFinalizadas = document.getElementById("tabla-auditorias-finalizadas");
    this.tabPendientes = document.getElementById("tab-auditorias-pendientes");
    this.tabFinalizadas = document.getElementById("tab-auditorias-finalizadas");
    this.posicion = document.getElementById("auditoria-posicion");
    this.estado = document.getElementById("auditoria-estado");
    this.detalles = document.getElementById("datos-inscripto");
    this.descripcion = document.getElementById("descripcion-auditoria");
    this.mensaje = document.getElementById("mensaje-auditoria");
    this.registros = servicioAuditoria.consultarPendientes();
    this.indice = 0;

    this.tabPendientes.addEventListener("click", () => this.cambiarVista("pendientes"));
    this.tabFinalizadas.addEventListener("click", () => this.cambiarVista("finalizadas"));
    document.getElementById("auditoria-anterior").addEventListener("click", () => this.mover(-1));
    document.getElementById("auditoria-siguiente").addEventListener("click", () => this.mover(1));
    document.getElementById("auditoria-validar").addEventListener("click", () => this.resolver(ESTADOS_REGISTRO.APROBADO));
    document.getElementById("auditoria-rechazar").addEventListener("click", () => this.resolver(ESTADOS_REGISTRO.RECHAZADO));
    this.renderizar();
  },

  cambiarVista(vista) {
    const mostrarFinalizadas = vista === "finalizadas";
    this.tabPendientes.setAttribute("aria-selected", String(!mostrarFinalizadas));
    this.tabPendientes.tabIndex = mostrarFinalizadas ? -1 : 0;
    this.tabFinalizadas.setAttribute("aria-selected", String(mostrarFinalizadas));
    this.tabFinalizadas.tabIndex = mostrarFinalizadas ? 0 : -1;
    this.panelPendientes.hidden = mostrarFinalizadas;
    this.panelFinalizadas.hidden = !mostrarFinalizadas;
    mensajes.limpiar(this.mensaje);
    if (mostrarFinalizadas) this.renderizarFinalizadas();
    else this.renderizar();
  },

  mover(direccion) {
    this.indice = Math.max(0, Math.min(this.registros.length - 1, this.indice + direccion));
    mensajes.limpiar(this.mensaje);
    this.renderizar();
  },

  renderizar() {
    this.registros = servicioAuditoria.consultarPendientes();
    const hayRegistros = this.registros.length > 0;
    this.revision.hidden = !hayRegistros;
    this.sinPendientes.hidden = hayRegistros;
    if (!hayRegistros) {
      this.indice = 0;
      return;
    }

    this.indice = Math.min(this.indice, this.registros.length - 1);
    const registro = this.registros[this.indice];
    const ciudadano = registro.ciudadano || {};
    this.posicion.textContent = `${this.indice + 1} de ${this.registros.length}`;
    this.estado.textContent = `Estado: ${registro.estado}`;
    this.descripcion.value = registro.descripcionAuditoria;
    document.getElementById("auditoria-anterior").disabled = this.indice === 0;
    document.getElementById("auditoria-siguiente").disabled = this.indice === this.registros.length - 1;

    this.detalles.replaceChildren();
    [
      ["Nombre y apellido", [ciudadano.nombre, ciudadano.apellido].filter(Boolean).join(" ")],
      ["DNI", ciudadano.dni],
      ["Fecha de nacimiento", this.fechaLegible(ciudadano.fechaNacimiento)],
      ["Teléfono", ciudadano.telefono],
      ["Mail", ciudadano.mail],
      ["Dirección", ciudadano.direccion],
      ["Distrito electoral", registro.distritoElectoral],
      ["Ya fue autoridad de mesa", this.siNo(registro.fueAutoridad)],
      ["Cumplió la capacitación", this.siNo(registro.cumploCapacitacion)],
      ["Afiliado a un partido", this.siNo(registro.afiliado)],
      ["Partido político", registro.partidoPolitico],
      ["Interés en participar", this.siNo(registro.interes)],
      ["Última revisión", registro.fechaAuditoria ? new Date(registro.fechaAuditoria).toLocaleString("es-AR") : "Sin revisar"]
    ].forEach(([etiqueta, valor]) => this.agregarDetalle(etiqueta, valor));
  },

  renderizarFinalizadas() {
    const auditorias = servicioAuditoria.consultarFinalizadas();
    this.tablaFinalizadas.replaceChildren();
    this.sinFinalizadas.hidden = auditorias.length > 0;
    auditorias.forEach(registro => {
      const fila = this.tablaFinalizadas.insertRow();
      fila.insertCell().textContent = [registro.ciudadano.nombre, registro.ciudadano.apellido].filter(Boolean).join(" ") || "-";
      fila.insertCell().textContent = registro.ciudadano.dni || "-";
      fila.insertCell().textContent = registro.estado;
      fila.insertCell().textContent = registro.descripcionAuditoria || "Sin descripción";
      fila.insertCell().textContent = registro.fechaAuditoria
        ? new Date(registro.fechaAuditoria).toLocaleString("es-AR")
        : "-";
    });
  },

  agregarDetalle(etiqueta, valor) {
    const contenedor = document.createElement("div");
    const termino = document.createElement("dt");
    const descripcion = document.createElement("dd");
    termino.textContent = etiqueta;
    descripcion.textContent = valor || "-";
    contenedor.append(termino, descripcion);
    this.detalles.appendChild(contenedor);
  },

  fechaLegible(fecha) {
    return fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha.split("-").reverse().join("/") : fecha;
  },

  siNo(valor) {
    return valor ? "Sí" : "No";
  },

  async resolver(estado) {
    const registro = this.registros[this.indice];
    const nombre = [registro.ciudadano.nombre, registro.ciudadano.apellido].filter(Boolean).join(" ");
    const aprobado = estado === ESTADOS_REGISTRO.APROBADO;
    const confirmado = await mensajes.confirmar({
      titulo: aprobado ? "Validar inscripción" : "Rechazar inscripción",
      texto: `¿Confirmás ${aprobado ? "la validación" : "el rechazo"} de ${nombre}? La descripción ingresada quedará guardada en la auditoría.`,
      confirmarTexto: aprobado ? "Sí, validar" : "Sí, rechazar",
      peligro: !aprobado
    });
    if (!confirmado) return;

    const resultado = servicioAuditoria.resolver(registro.id, estado, this.descripcion.value);
    if (!resultado.ok) {
      mensajes.mostrarErrores(this.mensaje, [resultado.mensaje]);
      return;
    }

    this.indice = Math.min(this.indice, this.registros.length - 1);
    this.renderizar();
    const resultadoTexto = estado === ESTADOS_REGISTRO.APROBADO
      ? "Inscripción aprobada."
      : "Inscripción rechazada.";
    const avisoPendientes = this.registros.length === 0 ? " No hay auditorías pendientes." : "";
    mensajes.mostrarExito(this.mensaje, resultadoTexto + avisoPendientes);
  }
};