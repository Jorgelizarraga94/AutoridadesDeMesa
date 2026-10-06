const servicioAuditoria = {
  consultarTodos() {
    const auditorias = new Map(repositorioAuditorias.obtenerTodas()
      .map(auditoria => [Number(auditoria.registroId), auditoria]));

    return repositorioRegistros.obtenerTodos().map(registro => {
      const auditoria = auditorias.get(Number(registro.id));
      return {
        ...registro,
        estado: auditoria ? auditoria.estado : registro.estado || ESTADOS_REGISTRO.PENDIENTE,
        descripcionAuditoria: auditoria ? auditoria.descripcion : "",
        fechaAuditoria: auditoria ? auditoria.fechaRevision : ""
      };
    });
  },

  consultarPendientes() {
    return this.consultarTodos().filter(registro =>
      ![ESTADOS_REGISTRO.APROBADO, ESTADOS_REGISTRO.RECHAZADO].includes(registro.estado));
  },

  consultarFinalizadas() {
    return this.consultarTodos().filter(registro =>
      [ESTADOS_REGISTRO.APROBADO, ESTADOS_REGISTRO.RECHAZADO].includes(registro.estado));
  },

  resolver(registroId, estado, descripcion) {
    if (![ESTADOS_REGISTRO.APROBADO, ESTADOS_REGISTRO.RECHAZADO].includes(estado)) {
      return { ok: false, mensaje: "Elegí validar o rechazar la inscripción." };
    }

    const registro = repositorioRegistros.obtenerTodos()
      .find(item => Number(item.id) === Number(registroId));
    if (!registro) return { ok: false, mensaje: "No se encontró la inscripción seleccionada." };

    const texto = String(descripcion || "").trim();
    if (texto.length > 500) return { ok: false, mensaje: "La descripción no puede superar los 500 caracteres." };

    try {
      repositorioAuditorias.guardar({
        registroId: Number(registroId),
        estado,
        descripcion: texto,
        fechaRevision: new Date().toISOString()
      });
      repositorioRegistros.actualizarEstado(registroId, estado);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensaje: "No se pudo guardar la auditoría en el navegador." };
    }
  }
};