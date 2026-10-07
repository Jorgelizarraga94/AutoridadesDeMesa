const servicioGeocodificacion = (() => {
  const URL_API = "https://nominatim.openstreetmap.org/search";
  const INTERVALO_MINIMO_MS = 1100;
  const cache = new Map();
  let ultimaSolicitud = 0;

  function normalizarTexto(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\bavda?\b/g, "avenida")
      .replace(/\bpres\b/g, "presidente")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function coincideCalle(calleIngresada, calleEncontrada) {
    const genericos = new Set(["avenida", "calle", "diagonal", "pasaje", "ruta"]);
    const palabrasIngresadas = normalizarTexto(calleIngresada)
      .split(/\s+/)
      .filter(palabra => palabra && !genericos.has(palabra));
    const palabrasEncontradas = new Set(normalizarTexto(calleEncontrada).split(/\s+/));
    return palabrasIngresadas.length > 0
      && palabrasIngresadas.every(palabra => palabrasEncontradas.has(palabra));
  }

  function coincideLocalidad(direccion, localidad) {
    const nombres = [
      direccion.city,
      direccion.town,
      direccion.village,
      direccion.municipality,
      direccion.suburb,
      direccion.county,
      direccion.state_district
    ].filter(Boolean).map(normalizarTexto);
    const localidadNormalizada = normalizarTexto(localidad);
    return nombres.some(nombre => ` ${nombre} `.includes(` ${localidadNormalizada} `));
  }

  function coincideProvincia(provinciaEncontrada, provinciaIngresada) {
    const encontrada = normalizarTexto(provinciaEncontrada || "");
    const ingresada = normalizarTexto(provinciaIngresada);
    return encontrada.length > 0
      && ingresada.length > 0
      && (encontrada === ingresada || encontrada.includes(ingresada) || ingresada.includes(encontrada));
  }

  async function esperarIntervaloMinimo() {
    const espera = INTERVALO_MINIMO_MS - (Date.now() - ultimaSolicitud);
    if (espera > 0) await new Promise(resolve => setTimeout(resolve, espera));
    ultimaSolicitud = Date.now();
  }

  return {
    async normalizar({ calle, numero, localidad, provincia }) {
      const clave = [calle, numero, localidad, provincia].map(normalizarTexto).join("|");
      if (cache.has(clave)) return cache.get(clave);

      const url = new URL(URL_API);
      url.searchParams.set("street", `${numero} ${calle}`);
      url.searchParams.set("city", localidad);
      url.searchParams.set("state", provincia);
      url.searchParams.set("country", "Argentina");
      url.searchParams.set("countrycodes", "ar");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      url.searchParams.set("accept-language", "es");

      await esperarIntervaloMinimo();
      let respuesta;
      try {
        respuesta = await fetch(url);
      } catch {
        return { ok: false, error: "No se pudo conectar con OpenStreetMap. Revisá tu conexión e intentá de nuevo." };
      }
      if (!respuesta.ok) {
        return { ok: false, error: "El servicio de ubicación no está disponible en este momento. Intentá de nuevo más tarde." };
      }

      let resultados;
      try {
        resultados = await respuesta.json();
      } catch {
        return { ok: false, error: "El servicio de ubicación devolvió una respuesta inválida." };
      }
      if (!Array.isArray(resultados)) {
        return { ok: false, error: "El servicio de ubicación devolvió una respuesta inválida." };
      }

      const resultado = resultados.find(opcion => {
        const direccion = opcion.address || {};
        const coordenadasValidas = opcion.lat !== null
          && opcion.lat !== undefined
          && opcion.lon !== null
          && opcion.lon !== undefined
          && Number.isFinite(Number(opcion.lat))
          && Number.isFinite(Number(opcion.lon))
          && Math.abs(Number(opcion.lat)) <= 90
          && Math.abs(Number(opcion.lon)) <= 180
          && direccion.country_code === "ar";
        const alturaCoincide = !direccion.house_number
          || normalizarTexto(direccion.house_number) === normalizarTexto(numero);
        return coordenadasValidas
          && alturaCoincide
          && coincideCalle(calle, direccion.road || "")
          && coincideLocalidad(direccion, localidad)
          && coincideProvincia(direccion.state, provincia);
      });

      if (!resultado) {
        return {
          ok: false,
          error: "No se encontró una coincidencia confiable para esa calle y localidad. Revisá la dirección o probá con otra forma de escribirla."
        };
      }

      const ubicacion = {
        ok: true,
        coordenadas: {
          latitud: Number(resultado.lat),
          longitud: Number(resultado.lon)
        },
        aproximada: !resultado.address.house_number
      };
      cache.set(clave, ubicacion);
      return ubicacion;
    }
  };
})();
