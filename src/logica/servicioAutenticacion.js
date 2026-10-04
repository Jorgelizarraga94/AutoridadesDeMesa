const servicioAutenticacion = {
  iniciarSesion(usuario, clave) {
    if (validaciones.esVacio(usuario) || validaciones.esVacio(clave)) {
      return { ok: false, error: "Completá usuario y contraseña." };
    }
    const administrador = repositorioAdministradores.buscarPorUsuario(usuario.trim());
    if (!administrador || administrador.clave !== clave) {
      return { ok: false, error: "Usuario o contraseña incorrectos." };
    }
    repositorioSesion.abrir(administrador.usuario);
    return { ok: true };
  },

  cerrarSesion() { repositorioSesion.cerrar(); },
  haySesionActiva() { return repositorioSesion.obtenerUsuario() !== null; }
};
