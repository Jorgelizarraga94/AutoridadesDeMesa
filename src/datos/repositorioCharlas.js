// Único lugar que sabe que las charlas viven en localStorage.
const repositorioCharlas = {
  CLAVE: "charlas",

  leerDatos() {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.CLAVE));
      if (Array.isArray(guardado)) return guardado;
    } catch (error) {
      // dato corrupto: se vuelve a los datos de ejemplo
    }
    this.escribirDatos(CHARLAS_INICIALES); // primera vez: precarga de ejemplo
    return CHARLAS_INICIALES;
  },

  escribirDatos(datos) {
    localStorage.setItem(this.CLAVE, JSON.stringify(datos));
  },

  obtenerTodas() {
    return this.leerDatos().map(datos => new Charla(datos));
  },

  buscarPorId(id) {
    return this.obtenerTodas().find(charla => charla.id === id) || null;
  },

  // Alta o modificación según exista o no una charla con ese id.
  guardar(charla) {
    const datos = this.leerDatos();
    const posicion = datos.findIndex(existente => existente.id === charla.id);
    if (posicion >= 0) datos[posicion] = charla;
    else datos.push(charla);
    this.escribirDatos(datos);
  },

  eliminar(id) {
    this.escribirDatos(this.leerDatos().filter(charla => charla.id !== id));
  }
};
