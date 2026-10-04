// La sesión usa sessionStorage a propósito: se cierra sola al cerrar la pestaña.
const repositorioSesion = {
  CLAVE: "sesionAdmin",

  abrir(usuario) { sessionStorage.setItem(this.CLAVE, usuario); },
  cerrar() { sessionStorage.removeItem(this.CLAVE); },
  obtenerUsuario() { return sessionStorage.getItem(this.CLAVE); }
};
