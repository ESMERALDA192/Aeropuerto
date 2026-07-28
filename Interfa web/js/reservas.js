// ===== Configuración =====
const API = "http://localhost:3001";
const token = localStorage.getItem("token");
const rol   = localStorage.getItem("rol");

if (!token) {
  window.location.href = "login.html";
}

// ===== Estado =====
let reservas = [];
let listaPasajeros = [];
let listaVuelos = [];

// ===== Referencias del DOM =====
const cuerpoTabla       = document.getElementById("cuerpoTablaReservas");
const mensajeVacio      = document.getElementById("mensajeVacio");
const filtroVuelo       = document.getElementById("filtroVuelo");
const filtroPasajero    = document.getElementById("filtroPasajero");
const filtroClase       = document.getElementById("filtroClase");
const filtroRegistrado  = document.getElementById("filtroRegistrado");
const btnLimpiar        = document.getElementById("btnLimpiar");
const btnNueva          = document.getElementById("btnNueva");

const usuarioSesion     = document.getElementById("usuarioSesion");
const btnSalir          = document.getElementById("btnSalir");

// ===== Referencias del modal / formulario =====
const fondoModal         = document.getElementById("fondoModal");
const formularioReserva  = document.getElementById("formularioReserva");
const tituloModal        = document.getElementById("tituloModal");
const errorFormulario    = document.getElementById("errorFormulario");
const btnCerrar          = document.getElementById("btnCerrar");
const btnCancelar        = document.getElementById("btnCancelar");

const campoPasajero   = document.getElementById("campoPasajero");
const campoVuelo      = document.getElementById("campoVuelo");
const campoAsiento    = document.getElementById("campoAsiento");
const campoClase      = document.getElementById("campoClase");
const campoRegistrado = document.getElementById("campoRegistrado");

let idEditando = null;

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

// ===== Helper de peticiones =====
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
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short"
  });
}

const nombresClase = {
  economica: "Económica",
  ejecutiva: "Ejecutiva",
  primera:   "Primera"
};

// ===== Cargar reservas del backend =====
async function cargarReservas() {
  try {
    reservas = await pedir("/reservas");
    aplicarFiltros();
  } catch (error) {
    cuerpoTabla.innerHTML = "";
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "Error al cargar reservas: " + error.message;
  }
}

// ===== Cargar catálogos para el formulario =====
async function cargarCatalogos() {
  try {
    listaPasajeros = await pedir("/pasajeros");
    listaVuelos    = await pedir("/vuelos");
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
    mensajeVacio.textContent = "No hay reservas que coincidan con los filtros.";
    return;
  }
  mensajeVacio.classList.add("oculto");

  lista.forEach(r => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${r.pasajero.nombreCompleto}</td>
      <td><span class="codigo-iata">${r.pasajero.documento}</span></td>
      <td><span class="numero-vuelo">${r.vuelo.numeroVuelo}</span></td>
      <td>
        <span class="hora">${formatearHora(r.vuelo.horaSalida)}</span>
        <span class="ciudad">${formatearFecha(r.vuelo.horaSalida)}</span>
      </td>
      <td><span class="codigo-iata">${r.asiento}</span></td>
      <td>
        <span class="etiqueta-estado clase-${r.clase}">${nombresClase[r.clase]}</span>
      </td>
      <td>
        <span class="etiqueta-estado ${r.registrado ? 'estado-abordando' : 'estado-retrasado'}">
          ${r.registrado ? 'Registrado' : 'Pendiente'}
        </span>
      </td>
      <td class="columna-acciones">
        <button class="boton-icono" data-accion="checkin" data-id="${r._id}">
          ${r.registrado ? 'Cancelar check-in' : 'Check-in'}
        </button>
        <button class="boton-icono" data-accion="editar" data-id="${r._id}">Editar</button>
        <button class="boton-icono peligro" data-accion="eliminar" data-id="${r._id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// ===== Filtros =====
function aplicarFiltros() {
  const vuelo      = filtroVuelo.value.trim().toUpperCase();
  const pasajero   = filtroPasajero.value.trim().toUpperCase();
  const clase      = filtroClase.value;
  const registrado = filtroRegistrado.value;

  const filtradas = reservas.filter(r => {
    if (vuelo && !r.vuelo.numeroVuelo.toUpperCase().includes(vuelo)) return false;
    if (pasajero && !(
          r.pasajero.nombreCompleto.toUpperCase().includes(pasajero) ||
          r.pasajero.documento.toUpperCase().includes(pasajero)
        )) return false;
    if (clase && r.clase !== clase) return false;
    if (registrado && String(r.registrado) !== registrado) return false;
    return true;
  });

  renderTabla(filtradas);
}

function limpiarFiltros() {
  filtroVuelo.value      = "";
  filtroPasajero.value   = "";
  filtroClase.value      = "";
  filtroRegistrado.value = "";
  renderTabla(reservas);
}

// ===== Llenar selects =====
function llenarSelects() {
  campoPasajero.innerHTML = listaPasajeros
    .map(p => `<option value="${p._id}">${p.nombre} ${p.apellido} — ${p.documento}</option>`)
    .join("");

  campoVuelo.innerHTML = listaVuelos
    .map(v => `<option value="${v._id}">${v.numeroVuelo} — ${formatearFecha(v.horaSalida)} ${formatearHora(v.horaSalida)}</option>`)
    .join("");
}

// ===== Abrir / cerrar modal =====
function abrirModal(reserva) {
  errorFormulario.classList.add("oculto");

  if (reserva) {
    idEditando = reserva._id;
    tituloModal.textContent = `Editar reserva — ${reserva.pasajero.nombreCompleto}`;
    campoPasajero.value   = reserva.pasajero.id;
    campoVuelo.value      = reserva.vuelo.id;
    campoAsiento.value    = reserva.asiento;
    campoClase.value      = reserva.clase;
    campoRegistrado.value = String(reserva.registrado);
  } else {
    idEditando = null;
    tituloModal.textContent = "Nueva reserva";
    formularioReserva.reset();
    if (listaPasajeros[0]) campoPasajero.value = listaPasajeros[0]._id;
    if (listaVuelos[0])    campoVuelo.value    = listaVuelos[0]._id;
    campoClase.value      = "economica";
    campoRegistrado.value = "false";
  }

  fondoModal.classList.remove("oculto");
  campoAsiento.focus();
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

  const asiento = campoAsiento.value.trim().toUpperCase();

  if (!asiento) return mostrarError("El asiento es obligatorio.");

  if (!/^\d{1,2}[A-F]$/.test(asiento)) {
    return mostrarError("Formato de asiento inválido. Usa por ejemplo 12A.");
  }

  const cuerpo = {
    pasajeroId: campoPasajero.value,
    vueloId:    campoVuelo.value,
    asiento:    asiento,
    clase:      campoClase.value,
    registrado: campoRegistrado.value === "true"
  };

  try {
    if (idEditando) {
      await pedir(`/reservas/${idEditando}`, {
        method: "PUT",
        body: JSON.stringify(cuerpo)
      });
    } else {
      await pedir("/reservas", {
        method: "POST",
        body: JSON.stringify(cuerpo)
      });
    }
    cerrarModal();
    await cargarReservas();
  } catch (error) {
    mostrarError(error.message);
  }
}

// ===== Acciones de fila =====
async function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id      = boton.dataset.id;
  const accion  = boton.dataset.accion;
  const reserva = reservas.find(r => r._id === id);

  if (accion === "checkin") {
    try {
      await pedir(`/reservas/${id}`, {
        method: "PUT",
        body: JSON.stringify({ registrado: !reserva.registrado })
      });
      await cargarReservas();
    } catch (error) {
      alert("No se pudo actualizar el check-in: " + error.message);
    }
  }

  if (accion === "editar") {
    abrirModal(reserva);
  }

  if (accion === "eliminar") {
    if (confirm(`¿Eliminar la reserva de ${reserva.pasajero.nombreCompleto}?`)) {
      try {
        await pedir(`/reservas/${id}`, { method: "DELETE" });
        await cargarReservas();
      } catch (error) {
        alert("No se pudo eliminar: " + error.message);
      }
    }
  }
}

// ===== Eventos =====
filtroVuelo.addEventListener("input",       aplicarFiltros);
filtroPasajero.addEventListener("input",    aplicarFiltros);
filtroClase.addEventListener("change",      aplicarFiltros);
filtroRegistrado.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click",        limpiarFiltros);
cuerpoTabla.addEventListener("click",       manejarAccion);

btnNueva.addEventListener("click",    () => abrirModal(null));
btnCerrar.addEventListener("click",   cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

formularioReserva.addEventListener("submit", guardar);

fondoModal.addEventListener("click", e => {
  if (e.target === fondoModal) cerrarModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModal.classList.contains("oculto")) cerrarModal();
});

// ===== Inicio =====
cargarCatalogos();
cargarReservas();