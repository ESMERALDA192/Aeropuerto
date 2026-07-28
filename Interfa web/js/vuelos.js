// ===== Configuración =====
const API = "http://localhost:3001";
const token = localStorage.getItem("token");
const rol   = localStorage.getItem("rol");

// Si no hay sesión, regresar al login
if (!token) {
  window.location.href = "login.html";
}

// ===== Estado =====
let vuelos = [];

// ===== Referencias del DOM =====
const cuerpoTabla    = document.getElementById("cuerpoTablaVuelos");
const mensajeVacio   = document.getElementById("mensajeVacio");
const filtroEstado   = document.getElementById("filtroEstado");
const filtroOrigen   = document.getElementById("filtroOrigen");
const filtroDestino  = document.getElementById("filtroDestino");
const filtroFecha    = document.getElementById("filtroFecha");
const btnLimpiar     = document.getElementById("btnLimpiar");
const btnNuevo       = document.getElementById("btnNuevo");

const usuarioSesion  = document.getElementById("usuarioSesion");
const btnSalir       = document.getElementById("btnSalir");

// ===== Referencias del modal / formulario =====
const fondoModal       = document.getElementById("fondoModal");
const formularioVuelo  = document.getElementById("formularioVuelo");
const tituloModal      = document.getElementById("tituloModal");
const errorFormulario  = document.getElementById("errorFormulario");
const btnCerrar        = document.getElementById("btnCerrar");
const btnCancelar      = document.getElementById("btnCancelar");

const campoNumero    = document.getElementById("campoNumero");
const campoAerolinea = document.getElementById("campoAerolinea");
const campoOrigen    = document.getElementById("campoOrigen");
const campoDestino   = document.getElementById("campoDestino");
const campoSalida    = document.getElementById("campoSalida");
const campoLlegada   = document.getElementById("campoLlegada");
const campoEstado    = document.getElementById("campoEstado");

let idEditando = null;
let listaAerolineas  = [];
let listaAeropuertos = [];

// ===== Sesión =====
if (usuarioSesion) {
  usuarioSesion.textContent = localStorage.getItem("nombre") || rol || "";
}
if (btnSalir) {
  btnSalir.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ===== Helper para peticiones con token =====
async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(opciones.headers || {})
    }
  });

  if (respuesta.status === 401) {
    localStorage.clear();
    window.location.href = "login.html";
    throw new Error("Sesión expirada");
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error en la petición");
  }

  return datos;
}

// ===== Utilidades =====
function formatearHora(iso) {
  const f = new Date(iso);
  return f.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatearFecha(iso) {
  const f = new Date(iso);
  return f.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function soloFecha(iso) {
  return iso.slice(0, 10);
}

// ===== Cargar vuelos del backend =====
async function cargarVuelos() {
  try {
    vuelos = await pedir("/vuelos");
    aplicarFiltros();
  } catch (error) {
    cuerpoTabla.innerHTML = "";
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "Error al cargar vuelos: " + error.message;
  }
}

// ===== Cargar catálogos para el formulario =====
async function cargarCatalogos() {
  try {
    listaAerolineas  = await pedir("/aerolineas");
    listaAeropuertos = await pedir("/aeropuertos");
    llenarSelects();
  } catch (error) {
    console.error("No se pudieron cargar catálogos:", error.message);
  }
}

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "No hay vuelos que coincidan con los filtros.";
    return;
  }
  mensajeVacio.classList.add("oculto");

  lista.forEach(v => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="numero-vuelo">${v.numeroVuelo}</span></td>
      <td>
        ${v.aerolinea.nombre}
        <span class="ciudad">${v.aerolinea.codigoIata}</span>
      </td>
      <td>
        <span class="codigo-iata">${v.origen.codigoIata}</span>
        <span class="ciudad">${v.origen.ciudad}</span>
      </td>
      <td>
        <span class="codigo-iata">${v.destino.codigoIata}</span>
        <span class="ciudad">${v.destino.ciudad}</span>
      </td>
      <td>
        <span class="hora">${formatearHora(v.horaSalida)}</span>
        <span class="ciudad">${formatearFecha(v.horaSalida)}</span>
      </td>
      <td>
        <span class="hora">${formatearHora(v.horaLlegada)}</span>
        <span class="ciudad">${formatearFecha(v.horaLlegada)}</span>
      </td>
      <td>
        <span class="etiqueta-estado estado-${v.estado}">${v.estado}</span>
      </td>
      <td class="columna-acciones">
        <button class="boton-icono" data-accion="editar" data-id="${v._id}">Editar</button>
        <button class="boton-icono peligro" data-accion="eliminar" data-id="${v._id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// ===== Filtros =====
function aplicarFiltros() {
  const estado  = filtroEstado.value;
  const origen  = filtroOrigen.value.trim().toUpperCase();
  const destino = filtroDestino.value.trim().toUpperCase();
  const fecha   = filtroFecha.value;

  const filtrados = vuelos.filter(v => {
    if (estado && v.estado !== estado) return false;

    if (origen && !(
          v.origen.codigoIata.includes(origen) ||
          v.origen.ciudad.toUpperCase().includes(origen)
        )) return false;

    if (destino && !(
          v.destino.codigoIata.includes(destino) ||
          v.destino.ciudad.toUpperCase().includes(destino)
        )) return false;

    if (fecha && soloFecha(v.horaSalida) !== fecha) return false;

    return true;
  });

  renderTabla(filtrados);
}

function limpiarFiltros() {
  filtroEstado.value  = "";
  filtroOrigen.value  = "";
  filtroDestino.value = "";
  filtroFecha.value   = "";
  renderTabla(vuelos);
}

// ===== Llenar selects del formulario =====
function llenarSelects() {
  campoAerolinea.innerHTML = listaAerolineas
    .map(a => `<option value="${a._id}">${a.nombre} (${a.codigoIata})</option>`)
    .join("");

  const opcionesAeropuerto = listaAeropuertos
    .map(p => `<option value="${p._id}">${p.codigoIata} — ${p.ciudad}</option>`)
    .join("");

  campoOrigen.innerHTML  = opcionesAeropuerto;
  campoDestino.innerHTML = opcionesAeropuerto;
}

// ===== Abrir / cerrar modal =====
function abrirModal(vuelo) {
  errorFormulario.classList.add("oculto");

  if (vuelo) {
    idEditando = vuelo._id;
    tituloModal.textContent = `Editar vuelo ${vuelo.numeroVuelo}`;
    campoNumero.value    = vuelo.numeroVuelo;
    campoAerolinea.value = vuelo.aerolinea.id;
    campoOrigen.value    = vuelo.origen.id;
    campoDestino.value   = vuelo.destino.id;
    campoSalida.value    = vuelo.horaSalida.slice(0, 16);
    campoLlegada.value   = vuelo.horaLlegada.slice(0, 16);
    campoEstado.value    = vuelo.estado;
  } else {
    idEditando = null;
    tituloModal.textContent = "Nuevo vuelo";
    formularioVuelo.reset();
    if (listaAerolineas[0])  campoAerolinea.value = listaAerolineas[0]._id;
    if (listaAeropuertos[0]) campoOrigen.value    = listaAeropuertos[0]._id;
    if (listaAeropuertos[1]) campoDestino.value   = listaAeropuertos[1]._id;
    campoEstado.value    = "programado";
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

// ===== Guardar (crear o actualizar) =====
async function guardar(evento) {
  evento.preventDefault();

  const numero = campoNumero.value.trim().toUpperCase();

  if (!numero)             return mostrarError("El número de vuelo es obligatorio.");
  if (!campoSalida.value)  return mostrarError("La hora de salida es obligatoria.");
  if (!campoLlegada.value) return mostrarError("La hora de llegada es obligatoria.");

  if (campoOrigen.value === campoDestino.value) {
    return mostrarError("El origen y el destino no pueden ser el mismo aeropuerto.");
  }

  if (new Date(campoLlegada.value) <= new Date(campoSalida.value)) {
    return mostrarError("La llegada debe ser posterior a la salida.");
  }

  const cuerpo = {
    numeroVuelo: numero,
    aerolineaId: campoAerolinea.value,
    origenId:    campoOrigen.value,
    destinoId:   campoDestino.value,
    horaSalida:  campoSalida.value,
    horaLlegada: campoLlegada.value,
    estado:      campoEstado.value
  };

  try {
    if (idEditando) {
      await pedir(`/vuelos/${idEditando}`, {
        method: "PUT",
        body: JSON.stringify(cuerpo)
      });
    } else {
      await pedir("/vuelos", {
        method: "POST",
        body: JSON.stringify(cuerpo)
      });
    }
    cerrarModal();
    await cargarVuelos();
  } catch (error) {
    mostrarError(error.message);
  }
}

// ===== Acciones de fila =====
async function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id     = boton.dataset.id;
  const accion = boton.dataset.accion;
  const vuelo  = vuelos.find(v => v._id === id);

  if (accion === "editar") {
    abrirModal(vuelo);
  }

  if (accion === "eliminar") {
    if (confirm(`¿Eliminar el vuelo ${vuelo.numeroVuelo}?`)) {
      try {
        await pedir(`/vuelos/${id}`, { method: "DELETE" });
        await cargarVuelos();
      } catch (error) {
        alert("No se pudo eliminar: " + error.message);
      }
    }
  }
}

// ===== Eventos =====
filtroEstado.addEventListener("change", aplicarFiltros);
filtroOrigen.addEventListener("input",  aplicarFiltros);
filtroDestino.addEventListener("input", aplicarFiltros);
filtroFecha.addEventListener("change",  aplicarFiltros);
btnLimpiar.addEventListener("click",    limpiarFiltros);
cuerpoTabla.addEventListener("click",   manejarAccion);

btnNuevo.addEventListener("click",    () => abrirModal(null));
btnCerrar.addEventListener("click",   cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

formularioVuelo.addEventListener("submit", guardar);

fondoModal.addEventListener("click", e => {
  if (e.target === fondoModal) cerrarModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModal.classList.contains("oculto")) cerrarModal();
});

// ===== Inicio =====
cargarCatalogos();
cargarVuelos();