const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100; // control de plausibilidad: detecta fechas mal tipeadas

const validaciones = {
  esVacio(valor) {
    return !valor || String(valor).trim() === "";
  },

  tieneLongitud(texto, minimo, maximo) {
    return texto.length >= minimo && texto.length <= maximo;
  },

  esMailValido(mail) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  },

  esDniValido(dni) {
    return /^\d{7,8}$/.test(dni);
  },

  // Letras (con tildes y ñ), espacios, apóstrofes y guiones: "María José", "O'Connor", "Pérez-Gómez".
  esNombreValido(texto) {
    return /^\p{L}[\p{L}' -]*$/u.test(texto) && this.tieneLongitud(texto, 2, 50);
  },

  // Admite formatos como "+54 11 5555-1234" o "(011) 5555 1234"; exige entre 8 y 15 dígitos.
  esTelefonoValido(texto) {
    const cantidadDigitos = texto.replace(/\D/g, "").length;
    return /^[\d\s+()-]+$/.test(texto) && cantidadDigitos >= 8 && cantidadDigitos <= 15;
  },

  // --- Limpieza mientras se escribe (las usa la vista para bloquear caracteres inválidos) ---
  limpiarDni(texto) { return texto.replace(/\D/g, "").slice(0, 8); },
  limpiarNombre(texto) { return texto.replace(/[^\p{L}' -]/gu, "").slice(0, 50); },
  limpiarTelefono(texto) { return texto.replace(/[^\d\s+()-]/g, "").slice(0, 20); },

  // --- Fechas ---
  // Se arma con componentes locales: new Date("aaaa-mm-dd") se interpreta en UTC y puede correrse un día.
  parsearFechaIso(fechaIso) {
    const [anio, mes, dia] = String(fechaIso).split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  },

  edadEnAnios(fechaIso) {
    const nacimiento = this.parsearFechaIso(fechaIso);
    if (!nacimiento) return null;
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleEsteAnio = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    return hoy < cumpleEsteAnio ? edad - 1 : edad;
  },

  // Fecha aaaa-mm-dd de hace N años; sirve para los atributos min/max del campo de fecha.
  fechaHaceAnios(anios) {
    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() - anios);
    const dosDigitos = numero => String(numero).padStart(2, "0");
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  },

  // Coordenadas: aceptan coma o punto decimal y un rango máximo (90 latitud, 180 longitud).
  parsearCoordenada(texto, limite) {
    const numero = Number(String(texto).trim().replace(",", "."));
    return String(texto).trim() !== "" && Number.isFinite(numero) && Math.abs(numero) <= limite ? numero : null;
  }
};
