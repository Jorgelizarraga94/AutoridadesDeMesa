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
    this.botonGuardar = document.getElementById("boton-guardar");
    this.textoBotonGuardar = this.botonGuardar.textContent;
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

  async guardar() {
    const datos = leerFormulario(this.formulario);
    const erroresFormulario = servicioCharlas.validarFormulario(datos);
    if (erroresFormulario.length > 0) {
      mensajes.mostrarErrores(this.mensaje, erroresFormulario);
      return;
    }

    const esEdicion = this.formulario.elements.id.value !== "";
    this.botonGuardar.disabled = true;
    this.botonGuardar.textContent = "Buscando ubicación...";
    this.mensaje.className = "mensaje mensaje--info";
    this.mensaje.textContent = "Buscando la dirección en OpenStreetMap...";

    try {
      const resultadoUbicacion = await servicioGeocodificacion.normalizar(datos);
      if (!resultadoUbicacion.ok) {
        mensajes.mostrarErrores(this.mensaje, [resultadoUbicacion.error]);
        return;
      }

      const resultado = servicioCharlas.guardar({ ...datos, ...resultadoUbicacion.coordenadas });
      if (!resultado.ok) {
        mensajes.mostrarErrores(this.mensaje, resultado.errores);
        return;
      }
      this.salirDeEdicion();
      const detalleUbicacion = resultadoUbicacion.aproximada
        ? " La ubicación es aproximada al tramo de la calle."
        : "";
      mensajes.mostrarExito(
        this.mensaje,
        `${esEdicion ? "Charla actualizada." : "Charla agregada."}${detalleUbicacion}`
      );
      this.mostrarCharlas();
    } finally {
      this.botonGuardar.disabled = false;
      this.botonGuardar.textContent = this.textoBotonGuardar;
    }
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
    const { calle, numero, localidad, provincia } = charla.sede.direccion;
    Object.assign(campos.id, { value: charla.id });
    campos.nombre.value = charla.nombre;
    campos.tema.value = charla.tema;
    campos.fecha.value = validaciones.formatearFechaDdMmAaaa(charla.fecha);
    campos.horario.value = charla.horario;
    campos.nombreSede.value = charla.sede.nombre;
    campos.calle.value = calle;
    campos.numero.value = numero;
    campos.localidad.value = localidad || "San Miguel";
    campos.provincia.value = provincia || "Buenos Aires";

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
