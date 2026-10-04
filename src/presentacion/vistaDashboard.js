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

    this.formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      this.guardar();
    });
    this.botonCancelar.addEventListener("click", () => this.salirDeEdicion());
    this.mostrarCharlas();
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
    mensajes.limpiar(this.mensaje);
    this.formulario.scrollIntoView({ behavior: "smooth" });
  },

  eliminar(charla) {
    if (!window.confirm(`¿Eliminar la charla "${charla.nombre}"?`)) return;
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
