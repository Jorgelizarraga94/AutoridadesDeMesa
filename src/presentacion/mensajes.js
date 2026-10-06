// Mensajes de éxito y error compartidos por todos los formularios.
const mensajes = {
  mostrarExito(contenedor, texto) {
    contenedor.className = "mensaje mensaje--ok";
    contenedor.textContent = texto;
  },

  mostrarErrores(contenedor, errores) {
    contenedor.className = "mensaje mensaje--error";
    contenedor.replaceChildren();
    const lista = document.createElement("ul");
    errores.forEach(texto => {
      const item = document.createElement("li");
      item.textContent = texto;
      lista.appendChild(item);
    });
    contenedor.appendChild(lista);
  },

  limpiar(contenedor) {
    contenedor.className = "mensaje";
    contenedor.textContent = "";
  },

  confirmar({ titulo, texto, confirmarTexto = "Confirmar", peligro = false }) {
    return new Promise(resolve => {
      const dialogo = document.createElement("dialog");
      dialogo.className = "dialogo-confirmacion";
      dialogo.setAttribute("aria-labelledby", "titulo-confirmacion");

      const encabezado = document.createElement("h2");
      encabezado.id = "titulo-confirmacion";
      encabezado.textContent = titulo;
      const detalle = document.createElement("p");
      detalle.textContent = texto;

      const acciones = document.createElement("div");
      acciones.className = "dialogo-confirmacion__acciones";
      const cancelar = document.createElement("button");
      cancelar.type = "button";
      cancelar.className = "boton boton--secundario";
      cancelar.textContent = "Cancelar";
      cancelar.addEventListener("click", () => dialogo.close("cancelar"));

      const aceptar = document.createElement("button");
      aceptar.type = "button";
      aceptar.className = peligro ? "boton boton--peligro" : "boton";
      aceptar.textContent = confirmarTexto;
      aceptar.addEventListener("click", () => dialogo.close("confirmar"));
      acciones.append(cancelar, aceptar);
      dialogo.append(encabezado, detalle, acciones);

      dialogo.addEventListener("close", () => {
        const confirmado = dialogo.returnValue === "confirmar";
        dialogo.remove();
        resolve(confirmado);
      }, { once: true });
      document.body.appendChild(dialogo);
      dialogo.showModal();
      aceptar.focus();
    });
  }
};

// Lee un formulario como objeto: checkbox => booleano, el resto => texto sin espacios sobrantes.
function leerFormulario(formulario) {
  const datos = {};
  for (const campo of formulario.elements) {
    if (!campo.name) continue;
    datos[campo.name] = campo.type === "checkbox" ? campo.checked : campo.value.trim();
  }
  return datos;
}
