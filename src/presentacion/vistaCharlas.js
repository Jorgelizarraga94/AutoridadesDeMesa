const vistaCharlas = {
  mostrar() {
    const contenedor = document.getElementById("lista-charlas");
    const mensaje = document.getElementById("mensaje-charlas");
    const charlas = servicioCharlas.consultarCharlas();

    contenedor.replaceChildren();
    mensaje.textContent = charlas.length === 0 ? "Todavía no hay charlas programadas. Volvé a mirar pronto." : "";
    mensaje.className = charlas.length === 0 ? "mensaje mensaje--ok" : "mensaje";
    charlas.forEach(charla => contenedor.appendChild(this.crearTarjeta(charla)));
  },

  // Toda la tarjeta es un enlace al mapa, que muestra esta charla destacada junto con las demás.
  crearTarjeta(charla) {
    const tarjeta = document.createElement("a");
    tarjeta.className = "tarjeta";
    tarjeta.href = servicioMapa.urlVerEnMapa(charla);

    const crear = (etiqueta, clase, texto) => {
      const elemento = document.createElement(etiqueta);
      if (clase) elemento.className = clase;
      elemento.textContent = texto;
      return elemento;
    };

    const sede = crear("p", "tarjeta__sede", charla.sede.nombre);
    sede.appendChild(crear("small", "", charla.sede.direccionCompleta()));

    tarjeta.append(
      crear("span", "tarjeta__fecha", `${charla.fechaLegible()} - ${charla.horario} hs`),
      crear("h2", "", charla.nombre),
      crear("p", "tarjeta__tema", charla.tema),
      sede,
      crear("span", "tarjeta__enlace", "Ver ubicación en el mapa")
    );
    return tarjeta;
  }
};
