const vistaDashboard = {
  iniciar() {
    // Protege la página: sin sesión se vuelve al login.
    if (!servicioAutenticacion.haySesionActiva()) {
      window.location.replace("login.html");
      return;
    }
    this.formulario = document.getElementById("form-charla");
    this.tabla = document.getElementById("tabla-charlas");
    this.mensaje = document.getElementById("mensaje-dashboard");
    this.titulo = document.getElementById("titulo-formulario");
    this.botonCancelar = document.getElementById("boton-cancelar");
    const avisoSesion = sessionStorage.getItem("avisoPanel");
    if (avisoSesion) {
      mensajes.mostrarExito(this.mensaje, avisoSesion);
      sessionStorage.removeItem("avisoPanel");
    }
    this.configurarPestanas();
    vistaAuditoria.iniciar();

    this.formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      this.guardar();
    });
    this.botonCancelar.addEventListener("click", () => {
      this.salirDeEdicion();
      mensajes.mostrarExito(this.mensaje, "Edición cancelada. El formulario está listo para una nueva charla.");
    });
    this.mostrarCharlas();
  },

  configurarPestanas() {
    const pestanas = [
      { boton: document.getElementById("tab-charlas"), panel: document.getElementById("seccion-charlas") },
      { boton: document.getElementById("tab-auditoria"), panel: document.getElementById("seccion-auditoria") }
    ];
    pestanas.forEach(pestana => pestana.boton.addEventListener("click", () => {
      pestanas.forEach(actual => {
        const seleccionada = actual === pestana;
        actual.boton.setAttribute("aria-selected", String(seleccionada));
        actual.boton.tabIndex = seleccionada ? 0 : -1;
        actual.panel.hidden = !seleccionada;
      });
    }));
  },

  guardar() {
    const esEdicion = this.formulario.elements.id.value !== "";
    const resultado = servicioCharlas.guardar(leerFormulario(this.formulario));
    if (!resultado.ok) {
      mensajes.mostrarErrores(this.mensaje, resultado.errores);
      return;
    }
    this.salirDeEdicion();
    mensajes.mostrarExito(this.mensaje, esEdicion ? "Charla actualizada." : "Charla agregada.");
    this.mostrarCharlas();
  },

  mostrarCharlas() {
    this.tabla.replaceChildren();
    const charlas = servicioCharlas.consultarCharlas();
    if (charlas.length === 0) {
      const fila = this.tabla.insertRow();
      const celda = fila.insertCell();
      celda.colSpan = 4;
      celda.className = "vacio";
      celda.textContent = "No hay charlas. Agregá la primera con el formulario de abajo.";
      return;
    }
    charlas.forEach(charla => this.agregarFila(charla));
  },

  agregarFila(charla) {
    const fila = this.tabla.insertRow();
    const nombre = fila.insertCell();
    nombre.textContent = charla.nombre;
    const tema = document.createElement("small");
    tema.textContent = charla.tema;
    nombre.appendChild(tema);

    fila.insertCell().textContent = `${charla.fechaLegible()} - ${charla.horario} hs`;
    const sede = fila.insertCell();
    sede.textContent = charla.sede.nombre;
    const direccion = document.createElement("small");
    direccion.textContent = charla.sede.direccionCompleta();
    sede.appendChild(direccion);

    const acciones = fila.insertCell();
    acciones.className = "acciones-tabla";
    acciones.append(
      this.crearBoton("Editar", "boton boton--chico", () => this.editar(charla)),
      this.crearBoton("Eliminar", "boton boton--chico boton--peligro", () => this.eliminar(charla))
    );
  },

  crearBoton(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = clase;
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
  },

  editar(charla) {
    const campos = this.formulario.elements;
    const { calle, numero, latitud, longitud } = charla.sede.direccion;
    Object.assign(campos.id, { value: charla.id });
    campos.nombre.value = charla.nombre;
    campos.tema.value = charla.tema;
    campos.fecha.value = charla.fecha;
    campos.horario.value = charla.horario;
    campos.nombreSede.value = charla.sede.nombre;
    campos.calle.value = calle;
    campos.numero.value = numero;
    campos.latitud.value = latitud;
    campos.longitud.value = longitud;

    this.titulo.textContent = "Editar charla";
    this.formulario.classList.add("formulario--edicion");
    this.botonCancelar.hidden = false;
    mensajes.mostrarExito(this.mensaje, `Editando “${charla.nombre}”.`);
    this.formulario.scrollIntoView({ behavior: "smooth" });
  },

  async eliminar(charla) {
    const confirmado = await mensajes.confirmar({
      titulo: "Eliminar charla",
      texto: `¿Querés eliminar “${charla.nombre}”? Esta acción no se puede deshacer.`,
      confirmarTexto: "Eliminar charla",
      peligro: true
    });
    if (!confirmado) return;
    servicioCharlas.eliminar(charla.id);
    this.mostrarCharlas();
    mensajes.mostrarExito(this.mensaje, "Charla eliminada.");
  },

  salirDeEdicion() {
    this.formulario.reset();
    this.titulo.textContent = "Nueva charla";
    this.formulario.classList.remove("formulario--edicion");
    this.botonCancelar.hidden = true;
  }
};
