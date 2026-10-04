// Navbar compartido por todas las páginas. Contenido estático: no incluye datos del usuario.
const componenteNavbar = {
  mostrar(paginaActual) {
    const sesionActiva = servicioAutenticacion.haySesionActiva();
    const enlace = (clave, url, texto) =>
      `<a class="navbar__enlace" href="${url}" ${clave === paginaActual ? 'aria-current="page"' : ""}>${texto}</a>`;

    const acceso = sesionActiva
      ? `${enlace("panel", "dashboardAdmin.html", "Panel")}<button class="boton boton--chico" id="boton-salir" type="button">Cerrar sesión</button>`
      : `<a class="boton boton--chico" href="login.html">Login</a>`;

    const navbar = document.getElementById("navbar");
    navbar.className = "navbar";
    navbar.innerHTML = `
      <nav class="contenedor navbar__interior" aria-label="Principal">
        <a class="navbar__marca" href="index.html">Mesa<span>Electoral</span></a>
        <div class="navbar__enlaces">
          ${enlace("inicio", "index.html", "Inicio")}
          ${enlace("charlas", "charlas.html", "Charlas")}
          ${enlace("inscripcion", "inscripcion.html", "Inscripción")}
          ${acceso}
        </div>
      </nav>`;

    const botonSalir = document.getElementById("boton-salir");
    if (botonSalir) {
      botonSalir.addEventListener("click", () => {
        servicioAutenticacion.cerrarSesion();
        window.location.href = "index.html";
      });
    }
  }
};
