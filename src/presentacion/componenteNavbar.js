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
        <a class="navbar__marca" href="index.html"><span class="navbar__marca-etiqueta">Gestión electoral</span><strong>Autoridades de mesa</strong></a>
        <div class="navbar__enlaces">
          ${enlace("inicio", "index.html", "Inicio")}
          ${enlace("charlas", "charlas.html", "Charlas")}
          ${enlace("proceso", "index.html#como-participar", "Cómo participar")}
          ${acceso}
        </div>
      </nav>`;

    const botonSalir = document.getElementById("boton-salir");
    if (botonSalir) {
      botonSalir.addEventListener("click", async () => {
        const confirmado = await mensajes.confirmar({
          titulo: "Cerrar sesión",
          texto: "¿Querés salir del panel de administración?",
          confirmarTexto: "Cerrar sesión",
          peligro: true
        });
        if (!confirmado) return;
        servicioAutenticacion.cerrarSesion();
        sessionStorage.setItem("avisoInicio", "Sesión cerrada correctamente.");
        window.location.href = "index.html";
      });
    }
  }
};
