class Charla {
  constructor({ id, nombre, tema, fecha, horario, sede }) {
    this.id = id;
    this.nombre = nombre;
    this.tema = tema;
    this.fecha = fecha; // formato ISO (aaaa-mm-dd), que se ordena bien como texto
    this.horario = horario;
    this.sede = new Sede(sede);
  }

  fechaLegible() {
    return this.fecha.split("-").reverse().join("/");
  }
}
