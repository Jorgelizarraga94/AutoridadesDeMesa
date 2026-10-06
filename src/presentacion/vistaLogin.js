const vistaLogin = {
  iniciar() {
    // Si ya hay sesión, no tiene sentido mostrar el login.
    if (servicioAutenticacion.haySesionActiva()) {
      window.location.replace("dashboardAdmin.html");
      return;
    }
    const formulario = document.getElementById("form-login");
    const mensaje = document.getElementById("mensaje-login");

    formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      const { usuario, clave } = leerFormularioSinRecortar(formulario);
      const resultado = servicioAutenticacion.iniciarSesion(usuario, clave);
      if (resultado.ok) {
        sessionStorage.setItem("avisoPanel", "Sesión iniciada correctamente.");
        window.location.href = "dashboardAdmin.html";
      }
      else mensajes.mostrarErrores(mensaje, [resultado.error]);
    });
  }
};

// La contraseña no se recorta: los espacios podrían ser parte de ella.
function leerFormularioSinRecortar(formulario) {
  return { usuario: formulario.elements.usuario.value, clave: formulario.elements.clave.value };
}
