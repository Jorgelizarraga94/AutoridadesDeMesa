const componenteFooter = {
  mostrar() {
    const footer = document.getElementById("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="footer__interior contenedor">
        <div class="footer__identidad">
          <span class="footer__bandera" aria-hidden="true"></span>
          <div>
            <span class="footer__etiqueta">República Argentina</span>
            <strong>Autoridades de mesa</strong>
          </div>
        </div>
        <p class="footer__descripcion">Información para la participación electoral y la capacitación ciudadana.</p>
        <nav class="footer__enlaces" aria-label="Enlaces institucionales">
          <a href="charlas.html">Charlas</a>
          <a href="mapa.html">Mapa de sedes</a>
          <a href="inscripcion.html">Inscripción</a>
        </nav>
      </div>
      <div class="footer__base">
        <div class="contenedor">Información electoral para la ciudadanía</div>
      </div>`;
  }
};