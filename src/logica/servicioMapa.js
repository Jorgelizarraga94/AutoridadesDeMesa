// Direcciones relacionadas con el mapa. Si cambia el proveedor externo, solo se toca este archivo
// (y vistaMapa.js, que es el único que conoce la librería Leaflet).
const servicioMapa = {
  // Página propia que muestra todas las charlas y destaca la elegida.
  urlVerEnMapa(charla) {
    return `mapa.html?charla=${charla.id}`;
  },

  // Enlace a OpenStreetMap para abrir una ubicación obtenida desde USIG.
  urlOpenStreetMap({ latitud, longitud }) {
    return `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=17/${latitud}/${longitud}`;
  }
};
