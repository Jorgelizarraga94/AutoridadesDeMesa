class Sede {
  constructor({ id, nombre, direccion }) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion; // { calle, numero, localidad, provincia }
  }

  direccionCompleta() {
    return `${this.direccion.calle} ${this.direccion.numero}`;
  }
}
