// Limpieza aplicada mientras la persona escribe (o pega): los caracteres inválidos ni aparecen.
const LIMPIEZA_POR_CAMPO = {
  nombre: texto => validaciones.limpiarNombre(texto),
  apellido: texto => validaciones.limpiarNombre(texto),
  dni: texto => validaciones.limpiarDni(texto),
  telefono: texto => validaciones.limpiarTelefono(texto)
};

const vistaInscripcion = {
  iniciar() {
    this.formulario = document.getElementById("form-inscripcion");
    this.mensaje = document.getElementById("mensaje-inscripcion");
    this.descripcion = document.getElementById("descripcion-inscripcion");
    this.avisoObligatorio = document.getElementById("aviso-obligatorio");
    if (!servicioCharlas.estaDisponibleInscripcion()) {
      this.formulario.hidden = true;
      this.descripcion.hidden = true;
      this.avisoObligatorio.hidden = true;
      this.mensaje.className = "mensaje mensaje--info";
      const charlas = servicioCharlas.consultarCharlas();
      if (charlas.length === 0) {
        this.mensaje.textContent = "Las inscripciones se habilitarán cuando haya una charla programada.";
      } else {
        const primeraCharla = charlas[0];
        const ultimaCharla = charlas[charlas.length - 1];
        const apertura = new Date(`${primeraCharla.fecha}T${primeraCharla.horario}:00`);
        this.mensaje.textContent = new Date() < apertura
          ? `Las inscripciones abrirán el ${primeraCharla.fechaLegible()} a las ${primeraCharla.horario} hs, al comenzar la primera charla. Cerrarán al finalizar el día ${ultimaCharla.fechaLegible()}.`
          : `El período de inscripción finalizó al terminar el día ${ultimaCharla.fechaLegible()}.`;
      }
      return;
    }
    this.configurarLimpiezaAlEscribir();
    this.configurarPartido();

    this.formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      this.enviar();
    });
    // Al corregir un campo, su error desaparece.
    this.formulario.addEventListener("input", evento => this.limpiarError(evento.target));
  },

  configurarLimpiezaAlEscribir() {
    for (const [nombre, limpiar] of Object.entries(LIMPIEZA_POR_CAMPO)) {
      const campo = this.formulario.elements[nombre];
      campo.addEventListener("input", () => {
        const limpio = limpiar(campo.value);
        if (limpio !== campo.value) campo.value = limpio;
      });
    }
  },

  // El partido solo se pide (y se habilita) si la persona marca que está afiliada.
  configurarPartido() {
    const afiliado = this.formulario.elements.afiliado;
    const partido = this.formulario.elements.partidoPolitico;
    const actualizar = () => {
      partido.disabled = !afiliado.checked;
      partido.required = afiliado.checked;
      if (!afiliado.checked) partido.value = "";
    };
    afiliado.addEventListener("change", actualizar);
    this.formulario.addEventListener("reset", () => setTimeout(actualizar));
    actualizar();
  },

  enviar() {
    this.limpiarTodosLosErrores();
    const resultado = servicioInscripcion.inscribir(leerFormulario(this.formulario));
    if (resultado.ok) {
      mensajes.mostrarExito(this.mensaje, "¡Inscripción recibida! Quedó en estado Pendiente.");
      this.formulario.reset();
    } else {
      this.mostrarErrores(resultado.errores);
    }
  },

  mostrarErrores(errores) {
    const { general, ...porCampo } = errores;
    const nombresConError = Object.keys(porCampo);

    nombresConError.forEach(nombre => this.marcarError(this.formulario.elements[nombre], porCampo[nombre]));
    mensajes.mostrarErrores(this.mensaje, [general || "Revisá los campos marcados en rojo."]);
    if (nombresConError.length > 0) this.formulario.elements[nombresConError[0]].focus();
  },

  marcarError(campo, texto) {
    const etiqueta = campo.closest("label");
    let aviso = etiqueta.querySelector(".campo__error");
    if (!aviso) {
      aviso = document.createElement("span");
      aviso.className = "campo__error";
      etiqueta.appendChild(aviso);
    }
    aviso.textContent = texto;
    campo.setAttribute("aria-invalid", "true");
  },

  limpiarError(campo) {
    if (!campo.name || campo.type === "checkbox") return;
    campo.removeAttribute("aria-invalid");
    const aviso = campo.closest("label").querySelector(".campo__error");
    if (aviso) aviso.remove();
  },

  limpiarTodosLosErrores() {
    for (const campo of this.formulario.elements) this.limpiarError(campo);
    mensajes.limpiar(this.mensaje);
  }
};
