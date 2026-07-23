// ===== Datos de prueba =====
const empleados = [
  { _id: "e1",  numeroEmpleado: "EMP001", nombre: "Ricardo",  apellido: "Salazar Mendoza",  puesto: "piloto",          aerolinea: { nombre: "Aeroméxico" } },
  { _id: "e2",  numeroEmpleado: "EMP002", nombre: "Diana",    apellido: "Cortés Villalobos", puesto: "copiloto",       aerolinea: { nombre: "Aeroméxico" } },
  { _id: "e3",  numeroEmpleado: "EMP003", nombre: "Fernando", apellido: "Rojas Beltrán",     puesto: "sobrecargo",     aerolinea: { nombre: "Volaris" } },
  { _id: "e4",  numeroEmpleado: "EMP004", nombre: "Karla",    apellido: "Medina Sandoval",   puesto: "sobrecargo",     aerolinea: { nombre: "Volaris" } },
  { _id: "e5",  numeroEmpleado: "EMP005", nombre: "Óscar",    apellido: "Ibarra Guzmán",     puesto: "piloto",         aerolinea: { nombre: "Viva Aerobus" } },
  { _id: "e6",  numeroEmpleado: "EMP006", nombre: "Adriana",  apellido: "Lozano Ferrer",     puesto: "personal_tierra", aerolinea: null },
  { _id: "e7",  numeroEmpleado: "EMP007", nombre: "Martín",   apellido: "Cabrera Ríos",      puesto: "seguridad",      aerolinea: null },
  { _id: "e8",  numeroEmpleado: "EMP008", nombre: "Paola",    apellido: "Estrada Núñez",     puesto: "personal_tierra", aerolinea: null },
  { _id: "e9",  numeroEmpleado: "EMP009", nombre: "Héctor",   apellido: "Zamora Delgado",    puesto: "copiloto",       aerolinea: { nombre: "Viva Aerobus" } },
  { _id: "e10", numeroEmpleado: "EMP010", nombre: "Lucía",    apellido: "Navarro Peña",      puesto: "sobrecargo",     aerolinea: { nombre: "Aeroméxico" } },
  { _id: "e11", numeroEmpleado: "EMP011", nombre: "Emilio",   apellido: "Guerrero Ávila",    puesto: "seguridad",      aerolinea: null },
  { _id: "e12", numeroEmpleado: "EMP012", nombre: "Renata",   apellido: "Domínguez Cruz",    puesto: "piloto",         aerolinea: { nombre: "Volaris" } }
];

// ===== Referencias del DOM =====
const cuerpoTabla      = document.getElementById("cuerpoTablaEmpleados");
const mensajeVacio     = document.getElementById("mensajeVacio");
const filtroNombre     = document.getElementById("filtroNombre");
const filtroNumero     = document.getElementById("filtroNumero");
const filtroPuesto     = document.getElementById("filtroPuesto");
const filtroAerolinea  = document.getElementById("filtroAerolinea");
const btnLimpiar       = document.getElementById("btnLimpiar");
const btnNuevo         = document.getElementById("btnNuevo");

// ===== Etiquetas de puesto =====
const nombresPuesto = {
  piloto:          "Piloto",
  copiloto:        "Copiloto",
  sobrecargo:      "Sobrecargo",
  personal_tierra: "Personal de tierra",
  seguridad:       "Seguridad"
};

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    return;
  }
  mensajeVacio.classList.add("oculto");

  lista.forEach(e => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="codigo-iata">${e.numeroEmpleado}</span></td>
      <td>${e.nombre}</td>
      <td>${e.apellido}</td>
      <td>
        <span class="etiqueta-estado puesto-${e.puesto}">${nombresPuesto[e.puesto]}</span>
      </td>
      <td>${e.aerolinea ? e.aerolinea.nombre : '<span class="ciudad">Sin asignar</span>'}</td>
      <td class="columna-acciones">
        <button class="boton-icono" data-accion="editar" data-id="${e._id}">Editar</button>
        <button class="boton-icono peligro" data-accion="eliminar" data-id="${e._id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// ===== Filtros =====
function aplicarFiltros() {
  const nombre    = filtroNombre.value.trim().toUpperCase();
  const numero    = filtroNumero.value.trim().toUpperCase();
  const puesto    = filtroPuesto.value;
  const aerolinea = filtroAerolinea.value;

  const filtrados = empleados.filter(e => {
    if (nombre && !`${e.nombre} ${e.apellido}`.toUpperCase().includes(nombre)) return false;
    if (numero && !e.numeroEmpleado.toUpperCase().includes(numero)) return false;
    if (puesto && e.puesto !== puesto) return false;

    if (aerolinea === "sin" && e.aerolinea) return false;
    if (aerolinea && aerolinea !== "sin") {
      if (!e.aerolinea || e.aerolinea.nombre !== aerolinea) return false;
    }
    return true;
  });

  renderTabla(filtrados);
}

function limpiarFiltros() {
  filtroNombre.value    = "";
  filtroNumero.value    = "";
  filtroPuesto.value    = "";
  filtroAerolinea.value = "";
  renderTabla(empleados);
}

// ===== Acciones de fila =====
function manejarAccion(ev) {
  const boton = ev.target.closest("[data-accion]");
  if (!boton) return;

  const id       = boton.dataset.id;
  const empleado = empleados.find(e => e._id === id);
  const completo = `${empleado.nombre} ${empleado.apellido}`;

  if (boton.dataset.accion === "editar") {
    alert(`Editar empleado: ${completo}\n(Aquí abrirá el formulario)`);
  }

  if (boton.dataset.accion === "eliminar") {
    if (confirm(`¿Eliminar al empleado ${completo}?`)) {
      empleados.splice(empleados.findIndex(e => e._id === id), 1);
      aplicarFiltros();
    }
  }
}

// ===== Eventos =====
filtroNombre.addEventListener("input",     aplicarFiltros);
filtroNumero.addEventListener("input",     aplicarFiltros);
filtroPuesto.addEventListener("change",    aplicarFiltros);
filtroAerolinea.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click",       limpiarFiltros);
cuerpoTabla.addEventListener("click",      manejarAccion);

btnNuevo.addEventListener("click", () => {
  alert("Aquí abrirá el formulario de nuevo empleado");
});

// ===== Inicio =====
renderTabla(empleados);