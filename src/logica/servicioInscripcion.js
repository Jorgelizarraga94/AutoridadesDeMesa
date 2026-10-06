const servicioInscripcion = {
  // Devuelve { campo: mensaje } con un error por campo; objeto vacío si todo está bien.
  validar(datos) {
    const errores = {};
    const campoCompleto = campo => {
      if (validaciones.esVacio(datos[campo])) errores[campo] = "Este campo es obligatorio.";
      return !errores[campo];
    };

    if (campoCompleto("nombre") && !validaciones.esNombreValido(datos.nombre)) {
      errores.nombre = "Usá solo letras, entre 2 y 50 caracteres.";
    }
    if (campoCompleto("apellido") && !validaciones.esNombreValido(datos.apellido)) {
      errores.apellido = "Usá solo letras, entre 2 y 50 caracteres.";
    }
    if (campoCompleto("dni") && !validaciones.esDniValido(datos.dni)) {
      errores.dni = "El DNI debe tener 7 u 8 números, sin puntos.";
    }
    if (campoCompleto("fechaNacimiento")) {
      const edad = validaciones.edadEnAnios(datos.fechaNacimiento);
      if (edad === null || edad > EDAD_MAXIMA) errores.fechaNacimiento = "Revisá la fecha de nacimiento.";
      else if (edad < EDAD_MINIMA) errores.fechaNacimiento = `Tenés que ser mayor de ${EDAD_MINIMA} años.`;
    }
    if (campoCompleto("telefono") && !validaciones.esTelefonoValido(datos.telefono)) {
      errores.telefono = "Ingresá entre 8 y 15 números (podés usar +, espacios y guiones).";
    }
    if (campoCompleto("mail") &&
        !(validaciones.esMailValido(datos.mail) && datos.mail.length <= 100)) {
      errores.mail = "Ingresá un mail válido, por ejemplo nombre@correo.com.";
    }
    if (campoCompleto("direccion") && !validaciones.tieneLongitud(datos.direccion, 5, 100)) {
      errores.direccion = "La dirección debe tener entre 5 y 100 caracteres.";
    }
    if (campoCompleto("distritoElectoral") &&
        !validaciones.tieneLongitud(datos.distritoElectoral, 2, 60)) {
      errores.distritoElectoral = "El distrito debe tener entre 2 y 60 caracteres.";
    }
    if (datos.afiliado && campoCompleto("partidoPolitico") &&
        !validaciones.tieneLongitud(datos.partidoPolitico, 2, 60)) {
      errores.partidoPolitico = "El partido debe tener entre 2 y 60 caracteres.";
    }
    return errores;
  },

  // Cada persona puede inscribirse una sola vez: se controla por DNI y por mail.
  detectarDuplicados(datos) {
    const errores = {};
    if (repositorioRegistros.buscarPorDni(datos.dni)) errores.dni = "Ya existe una inscripción con ese DNI.";
    if (repositorioRegistros.buscarPorMail(datos.mail)) errores.mail = "Ya existe una inscripción con ese mail.";
    return errores;
  },

  inscribir(datos) {
    if (!servicioCharlas.estaDisponibleInscripcion()) {
      return { ok: false, errores: { general: "Las inscripciones no se encuentran abiertas. Se abrirán luego de la última charla programada." } };
    }

    const errores = this.validar(datos);
    if (Object.keys(errores).length === 0) Object.assign(errores, this.detectarDuplicados(datos));
    if (Object.keys(errores).length > 0) return { ok: false, errores };

    try {
      const datosNormalizados = { ...datos, mail: datos.mail.toLowerCase() };
      const registro = new Registro({ ...datosNormalizados, ciudadano: new Ciudadano(datosNormalizados) });
      repositorioRegistros.guardar(registro);
      return { ok: true, errores: {} };
    } catch (error) {
      return { ok: false, errores: { general: "No se pudo guardar la inscripción. Revisá el espacio del navegador." } };
    }
  }
};
