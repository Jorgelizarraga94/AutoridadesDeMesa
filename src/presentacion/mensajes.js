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
