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
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaIso));
    if (!partes) return null;
    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
    return fecha;
  },

  parsearFechaDdMmAaaa(fecha) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(fecha).trim());
    if (!partes) return null;
    const fechaIso = `${partes[3]}-${partes[2]}-${partes[1]}`;
    return this.parsearFechaIso(fechaIso) ? fechaIso : null;
  },

  formatearFechaDdMmAaaa(fechaIso) {
    return this.parsearFechaIso(fechaIso) ? fechaIso.split("-").reverse().join("/") : "";
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

  parsearCoordenadaDms(texto, limite, direcciones) {
    const partes = /^\s*([+-]?\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:[.,]\d+)?)\s*["″]\s*([NSEOW])?\s*$/i
      .exec(String(texto));
    if (!partes) return null;

    const gradosConSigno = Number(partes[1]);
    const grados = Math.abs(gradosConSigno);
    const minutos = Number(partes[2]);
    const segundos = Number(partes[3].replace(",", "."));
    const direccion = partes[4]?.toUpperCase() || "";
    const tieneSignoExplicito = /^[+-]/.test(partes[1]);
    if (
      grados > limite
      || minutos >= 60
      || segundos >= 60
      || (grados === limite && (minutos > 0 || segundos > 0))
      || (direccion && !direcciones.includes(direccion))
      || (!direccion && !tieneSignoExplicito)
    ) return null;

    const signoExplicito = gradosConSigno < 0 ? -1 : 1;
    const signoDireccion = ["S", "O", "W"].includes(direccion) ? -1 : 1;
    if (direccion && tieneSignoExplicito && signoDireccion !== signoExplicito) return null;

    const signo = direccion ? signoDireccion : signoExplicito;
    return signo * (grados + minutos / 60 + segundos / 3600);
  },

  formatearCoordenadaDms(coordenada, direccionPositiva, direccionNegativa) {
    const centesimasDeSegundo = Math.round(Math.abs(coordenada) * 360000);
    const grados = Math.floor(centesimasDeSegundo / 360000);
    const minutos = Math.floor((centesimasDeSegundo % 360000) / 6000);
    const segundos = (centesimasDeSegundo % 6000) / 100;
    const direccion = coordenada < 0 ? direccionNegativa : direccionPositiva;
    return `${grados}° ${minutos}' ${segundos.toFixed(2)}" ${direccion}`;
  }
};
