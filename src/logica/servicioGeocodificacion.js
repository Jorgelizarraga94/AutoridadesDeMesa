const servicioGeocodificacion = (() => {
  const URL_API = "https://servicios.usig.buenosaires.gob.ar/normalizar/";
  const solicitudes = new Map();

  function normalizarTexto(texto) {
    return String(texto || "")
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

  function contieneLocalidad(resultado, localidad) {
    const buscada = normalizarTexto(localidad);
    if (!buscada) return true;
    return [resultado.nombre_localidad, resultado.nombre_partido]
      .filter(Boolean)
      .some(nombre => ` ${normalizarTexto(nombre)} `.includes(` ${buscada} `));
  }

  function coordenadasValidas(coordenadas) {
    if (!coordenadas || Number(coordenadas.srid) !== 4326) return false;
    const longitud = Number(coordenadas.x);
    const latitud = Number(coordenadas.y);
    return Number.isFinite(latitud)
      && Number.isFinite(longitud)
      && Math.abs(latitud) <= 90
      && Math.abs(longitud) <= 180;
  }

  async function consultarUSIG(direccion) {
    const url = new URL(URL_API);
    url.searchParams.set("direccion", `${direccion.calle} ${direccion.numero}`);
    url.searchParams.set("geocodificar", "true");
    url.searchParams.set("srid", "4326");
    url.searchParams.set("maxOptions", "50");

    let respuesta;
    try {
      respuesta = await fetch(url);
    } catch {
      return {
        ok: false,
        error: "No se pudo conectar con el normalizador de direcciones USIG. Revisá tu conexión e intentá de nuevo."
      };
    }
    if (!respuesta.ok) {
      return {
        ok: false,
        error: "El normalizador de direcciones USIG no está disponible en este momento. Intentá de nuevo más tarde."
      };
    }

    let datos;
    try {
      datos = await respuesta.json();
    } catch {
      return { ok: false, error: "USIG devolvió una respuesta inválida." };
    }
    if (!datos || !Array.isArray(datos.direccionesNormalizadas)) {
      return { ok: false, error: "USIG devolvió una respuesta inválida." };
    }

    const localidad = direccion.localidad || "San Miguel";
    const numeroIngresado = String(direccion.numero).trim();
    const resultado = datos.direccionesNormalizadas.find(opcion =>
      String(opcion.altura).trim() === numeroIngresado
      && coincideCalle(direccion.calle, opcion.nombre_calle || "")
      && contieneLocalidad(opcion, localidad)
      && coordenadasValidas(opcion.coordenadas)
    );

    if (!resultado) {
      return {
        ok: false,
        error: `USIG no encontró una ubicación para ${direccion.calle} ${direccion.numero} en ${localidad}. Revisá la dirección.`
      };
    }

    return {
      ok: true,
      coordenadas: {
        longitud: Number(resultado.coordenadas.x),
        latitud: Number(resultado.coordenadas.y)
      }
    };
  }

  return {
    normalizar(direccion) {
      const localidad = direccion.localidad || "San Miguel";
      const clave = [
        direccion.calle,
        direccion.numero,
        localidad,
        direccion.provincia || "Buenos Aires"
      ].map(normalizarTexto).join("|");

      if (!solicitudes.has(clave)) {
        solicitudes.set(clave, consultarUSIG({ ...direccion, localidad }));
      }
      const solicitud = solicitudes.get(clave);
      return solicitud.then(resultado => {
        if (!resultado.ok && solicitudes.get(clave) === solicitud) solicitudes.delete(clave);
        return resultado;
      });
    }
  };
})();
