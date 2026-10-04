// Credenciales iniciales de la prueba de concepto (usuario: admin / contraseña: admin).
// En un sistema real irían en un servidor y con la contraseña cifrada.
const ADMINISTRADOR_INICIAL = { usuario: "admin", clave: "admin" };

const repositorioAdministradores = {
  CLAVE: "administradores",

  obtenerTodos() {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.CLAVE));
      if (Array.isArray(guardado) && guardado.length > 0) return guardado;
    } catch (error) {
      // dato corrupto: se restablece el administrador inicial
    }
    const iniciales = [ADMINISTRADOR_INICIAL];
    localStorage.setItem(this.CLAVE, JSON.stringify(iniciales));
    return iniciales;
  },

  buscarPorUsuario(usuario) {
    return this.obtenerTodos().find(admin => admin.usuario === usuario) || null;
  }
};
