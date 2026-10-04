// Único lugar que sabe que los registros se guardan en localStorage.
const repositorioRegistros = {
  CLAVE: "registros",

  obtenerTodos() {
    try {
      return JSON.parse(localStorage.getItem(this.CLAVE)) || [];
    } catch (error) {
      return []; // dato corrupto: se trata como vacío en lugar de romper la app
    }
  },

  buscarPorDni(dni) {
    return this.obtenerTodos().find(registro => registro.ciudadano.dni === dni) || null;
  },

  buscarPorMail(mail) {
    return this.obtenerTodos().find(registro => registro.ciudadano.mail.toLowerCase() === mail.toLowerCase()) || null;
  },

  guardar(registro) {
    const registros = this.obtenerTodos();
    registros.push(registro);
    localStorage.setItem(this.CLAVE, JSON.stringify(registros));
  }
};
