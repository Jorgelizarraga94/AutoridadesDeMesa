const ESTADOS_REGISTRO = Object.freeze({
  APROBADO: "Aprobado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado"
});

class Registro {
  constructor({ ciudadano, distritoElectoral, fueAutoridad, cumploCapacitacion, afiliado, partidoPolitico, interes }) {
    this.id = Date.now();
    this.ciudadano = ciudadano;
    this.distritoElectoral = distritoElectoral;
    this.fueAutoridad = fueAutoridad;
    this.cumploCapacitacion = cumploCapacitacion;
    this.afiliado = afiliado;
    this.partidoPolitico = afiliado ? partidoPolitico : "";
    this.interes = interes;
    this.estado = ESTADOS_REGISTRO.PENDIENTE; // toda inscripción nueva espera evaluación
  }
}
