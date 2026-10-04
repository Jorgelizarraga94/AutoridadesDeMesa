// Único archivo que conoce Leaflet y OpenStreetMap (el sistema externo de información geográfica).
const vistaMapa = {
  ZOOM_ELEGIDA: 15,
  ZOOM_SEDE: 16,
  ZOOM_MAXIMO_AL_ENCUADRAR: 15,

  mostrar() {
    const aviso = document.getElementById("mensaje-mapa");
    const contenido = document.getElementById("contenido-mapa");

    if (typeof L === "undefined") {
      this.mostrarAviso(aviso, "error", "No se pudo cargar el mapa. Verificá tu conexión a internet y recargá la página.");
      contenido.hidden = true;
      return;
    }
    this.charlas = servicioCharlas.consultarCharlas();
    if (this.charlas.length === 0) {
      this.mostrarAviso(aviso, "ok", "Todavía no hay charlas para mostrar en el mapa.");
      contenido.hidden = true;
      return;
    }

    const idElegida = Number(new URLSearchParams(window.location.search).get("charla"));
    this.crearMapa();
    this.marcadores = new Map();
    this.botonesLista = new Map();
    this.charlas.forEach(charla => this.agregarMarcador(charla, charla.id === idElegida));
    this.charlas.forEach(charla => this.agregarItemLista(charla));
    document.getElementById("boton-ver-todas").addEventListener("click", () => this.verTodas());

    const elegida = this.charlas.find(charla => charla.id === idElegida);
    if (elegida) this.enfocar(elegida, this.ZOOM_ELEGIDA);
    else this.verTodas();
  },

  mostrarAviso(contenedor, tipo, texto) {
    contenedor.className = `mensaje mensaje--${tipo}`;
    contenedor.textContent = texto;
  },

  crearMapa() {
    this.mapa = L.map("mapa");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap"
    }).addTo(this.mapa);
  },

  agregarMarcador(charla, esElegida) {
    const { latitud, longitud } = charla.sede.direccion;
    const icono = L.divIcon({
      className: esElegida ? "pin pin--elegida" : "pin",
      html: '<span class="pin__forma"></span>',
      iconSize: [30, 34],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28]
    });
    const marcador = L.marker([latitud, longitud], {
      icon: icono,
      title: charla.nombre,
      zIndexOffset: esElegida ? 1000 : 0 // la elegida queda por encima si hay sedes superpuestas
    }).addTo(this.mapa);

    marcador.bindPopup(this.crearPopup(charla));
    marcador.on("click", () => this.marcarActiva(charla.id));
    this.marcadores.set(charla.id, marcador);
  },

  // Se arma con elementos del DOM (no con texto HTML) para que los datos de la charla nunca se interpreten como código.
  crearPopup(charla) {
    const crear = (etiqueta, texto) => {
      const elemento = document.createElement(etiqueta);
      elemento.textContent = texto;
      return elemento;
    };
    const popup = document.createElement("div");
    popup.className = "popup-charla";

    const enlace = crear("a", "Abrir en OpenStreetMap");
    enlace.href = servicioMapa.urlOpenStreetMap(charla.sede);
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    popup.append(
      crear("strong", charla.nombre),
      crear("p", `${charla.fechaLegible()} - ${charla.horario} hs`),
      crear("p", `${charla.sede.nombre} (${charla.sede.direccionCompleta()})`),
      enlace
    );
    return popup;
  },

  agregarItemLista(charla) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "item-mapa";
    const nombre = document.createElement("strong");
    nombre.textContent = charla.nombre;
    const detalle = document.createElement("small");
    detalle.textContent = `${charla.fechaLegible()} - ${charla.sede.nombre}`;
    boton.append(nombre, detalle);
    boton.addEventListener("click", () => this.enfocar(charla, this.ZOOM_SEDE));

    const item = document.createElement("li");
    item.appendChild(boton);
    document.getElementById("lista-mapa").appendChild(item);
    this.botonesLista.set(charla.id, boton);
  },

  enfocar(charla, zoom) {
    const marcador = this.marcadores.get(charla.id);
    this.mapa.setView(marcador.getLatLng(), zoom);
    marcador.openPopup();
    this.marcarActiva(charla.id);
  },

  // Encuadra todas las sedes en la pantalla, para ver las charlas a la vez.
  verTodas() {
    const puntos = this.charlas.map(({ sede }) => [sede.direccion.latitud, sede.direccion.longitud]);
    this.mapa.fitBounds(L.latLngBounds(puntos).pad(0.25), { maxZoom: this.ZOOM_MAXIMO_AL_ENCUADRAR });
    this.mapa.closePopup();
    this.marcarActiva(null);
  },

  marcarActiva(idCharla) {
    this.botonesLista.forEach((boton, id) => {
      boton.classList.toggle("activa", id === idCharla);
      if (id === idCharla) boton.setAttribute("aria-current", "true");
      else boton.removeAttribute("aria-current");
    });
  }
};
