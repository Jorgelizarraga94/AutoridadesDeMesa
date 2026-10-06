// Único lugar que conoce la clave de auditorías en localStorage.
const repositorioAuditorias = {
  CLAVE: "auditorias",

  obtenerTodas() {
    try {
      const auditorias = JSON.parse(localStorage.getItem(this.CLAVE));
      return Array.isArray(auditorias) ? auditorias : [];
    } catch (error) {
      return [];
    }
  },

  buscarPorRegistroId(registroId) {
    return this.obtenerTodas().find(auditoria => Number(auditoria.registroId) === Number(registroId)) || null;
  },

  guardar(auditoria) {
    const auditorias = this.obtenerTodas();
    const indice = auditorias.findIndex(item => Number(item.registroId) === Number(auditoria.registroId));
    if (indice >= 0) auditorias[indice] = auditoria;
    else auditorias.push(auditoria);
    localStorage.setItem(this.CLAVE, JSON.stringify(auditorias));
  }
};