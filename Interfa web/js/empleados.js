// ===== Configuración =====
const token = localStorage.getItem("token");
const rol   = localStorage.getItem("rol");

if (!token) {
  window.location.href = "login.html";
}

// ===== Estado =====
let empleados = [];
let listaAerolineas = [];

// ===== Referencias del DOM =====
const cuerpoTabla      = document.getElementById("cuerpoTablaEmpleados");
const mensajeVacio     = document.getElementById("mensajeVacio");
const filtroNombre     = document.getElementById("filtroNombre");
const filtroNumero     = document.getElementById("filtroNumero");
const filtroPuesto     = document.getElementById("filtroPuesto");
const filtroAerolinea  = document.getElementById("filtroAerolinea");
const btnLimpiar       = document.getElementById("btnLimpiar");
const btnNuevo         = document.getElementById("btnNuevo");

const usuarioSesion    = document.getElementById("usuarioSesion");
const btnSalir         = document.getElementById("btnSalir");

// Modal
const fondoModal          = document.getElementById("fondoModal");
const formularioEmpleado  = document.getElementById("formularioEmpleado");
const tituloModal         = document.getElementById("tituloModal");
const errorFormulario     = document.getElementById("errorFormulario");
const btnCerrar           = document.getElementById("btnCerrar");
const btnCancelar         = document.getElementById("btnCancelar");

const campoNumero    = document.getElementById("campoNumero");
const campoPuesto    = document.getElementById("campoPuesto");
const campoNombre    = document.getElementById("campoNombre");
const campoApellido  = document.getElementById("campoApellido");
const campoAerolinea = document.getElementById("campoAerolinea");

let idEditando = null;

// ===== Etiquetas de puesto =====
const nombresPuesto = {
  piloto:          "Piloto",
  copiloto:        "Copiloto",
  sobrecargo:      "Sobrecargo",
  personal_tierra: "Personal de tierra",
  seguridad:       "Seguridad"
};

// ===== Sesión =====
if (usuarioSesion) usuarioSesion.textContent = localStorage.getItem("nombre") || rol || "";
if (btnSalir) {
  btnSalir.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ===== Cargar empleados =====
async function cargarEmpleados() {
  try {
    empleados = await obtenerEmpleados();
    aplicarFiltros();
  } catch (error) {
    cuerpoTabla.innerHTML = "";
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "Error al cargar empleados: " + error.message;
  }
}

// ===== Cargar aerolíneas (para los selects) =====
async function cargarAerolineas() {
  try {
    listaAerolineas = await obtenerAerolineas();

    // Llenar el filtro de aerolínea
    const opcionesFiltro = listaAerolineas
      .map(a => `<option value="${a.nombre}">${a.nombre}</option>`)
      .join("");
    filtroAerolinea.innerHTML = `<option value="">Todas</option>${opcionesFiltro}<option value="sin">Sin aerolínea</option>`;

    // Llenar el select del formulario
    const opcionesForm = listaAerolineas
      .map(a => `<option value="${a._id}">${a.nombre}</option>`)
      .join("");
    campoAerolinea.innerHTML = `<option value="">Sin aerolínea</option>${opcionesForm}`;

  } catch (error) {
    console.error("No se pudieron cargar aerolíneas:", error.message);
  }
}

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "No hay empleados que coincidan con los filtros.";
    return;
  }
  mensajeVacio.classList.add("oculto");

  lista.forEach(e => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="codigo-iata">${e.numeroEmpleado}</span></td>
      <td>${e.nombre}</td>
      <td>${e.apellido}</td>
      <td><span class="etiqueta-estado puesto-${e.puesto}">${nombresPuesto[e.puesto]}</span></td>
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

// ===== Abrir / cerrar modal =====
function abrirModal(empleado) {
  errorFormulario.classList.add("oculto");

  if (empleado) {
    idEditando = empleado._id;
    tituloModal.textContent = `Editar empleado ${empleado.numeroEmpleado}`;
    campoNumero.value    = empleado.numeroEmpleado;
    campoPuesto.value    = empleado.puesto;
    campoNombre.value    = empleado.nombre;
    campoApellido.value  = empleado.apellido;
    campoAerolinea.value = empleado.aerolinea ? empleado.aerolinea.id : "";
  } else {
    idEditando = null;
    tituloModal.textContent = "Nuevo empleado";
    formularioEmpleado.reset();
    campoPuesto.value = "piloto";
    campoAerolinea.value = "";
  }

  fondoModal.classList.remove("oculto");
  campoNumero.focus();
}

function cerrarModal() {
  fondoModal.classList.add("oculto");
  idEditando = null;
}

function mostrarError(mensaje) {
  errorFormulario.textContent = mensaje;
  errorFormulario.classList.remove("oculto");
}

// ===== Guardar =====
async function guardar(evento) {
  evento.preventDefault();

  const numeroEmpleado = campoNumero.value.trim().toUpperCase();
  const nombre         = campoNombre.value.trim();
  const apellido       = campoApellido.value.trim();

  if (!numeroEmpleado) return mostrarError("El número de empleado es obligatorio.");
  if (!nombre)         return mostrarError("El nombre es obligatorio.");
  if (!apellido)       return mostrarError("El apellido es obligatorio.");

  const cuerpo = {
    numeroEmpleado,
    nombre,
    apellido,
    puesto: campoPuesto.value
  };

  // La aerolínea es opcional
  if (campoAerolinea.value) {
    cuerpo.aerolineaId = campoAerolinea.value;
  }

  try {
    if (idEditando) {
      await actualizarEmpleado(idEditando, cuerpo);
    } else {
      await agregarEmpleado(cuerpo);
    }
    cerrarModal();
    await cargarEmpleados();
  } catch (error) {
    mostrarError(error.message);
  }
}

// ===== Acciones de fila =====
async function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id       = boton.dataset.id;
  const empleado = empleados.find(emp => emp._id === id);

  if (boton.dataset.accion === "editar") {
    abrirModal(empleado);
  }

  if (boton.dataset.accion === "eliminar") {
    if (confirm(`¿Eliminar al empleado ${empleado.nombre} ${empleado.apellido}?`)) {
      try {
        await eliminarEmpleado(id);
        await cargarEmpleados();
      } catch (error) {
        alert("No se pudo eliminar: " + error.message);
      }
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

btnNuevo.addEventListener("click",    () => abrirModal(null));
btnCerrar.addEventListener("click",   cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);
formularioEmpleado.addEventListener("submit", guardar);

fondoModal.addEventListener("click", e => {
  if (e.target === fondoModal) cerrarModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModal.classList.contains("oculto")) cerrarModal();
});

// ===== Inicio =====
cargarAerolineas();
cargarEmpleados();