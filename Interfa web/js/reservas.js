// ===== Seguridad de sesión =====
const tokenSesion = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!tokenSesion) {
  window.location.href = "login.html";
}


// ===== Estado =====
let reservas = [];
let listaPasajeros = [];
let listaVuelos = [];
let idEditando = null;


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


// ===== Modal =====
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


// ===== Sesión =====
if (usuarioSesion) {
  usuarioSesion.textContent =
    localStorage.getItem("nombre") || rol || "";
}

if (btnSalir) {
  btnSalir.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}


// ===== Utilidades =====
function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short"
  });
}

const nombresClase = {
  economica: "Económica",
  ejecutiva: "Ejecutiva",
  primera: "Primera"
};


// ===== Cargar reservas =====
async function cargarReservas() {
  try {
    reservas = await obtenerReservas();
    aplicarFiltros();

  } catch(error) {
    cuerpoTabla.innerHTML = "";
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent =
      "Error al cargar reservas: " + error.message;
  }
}


// ===== Cargar datos para selects =====
async function cargarCatalogos() {
  try {
    listaPasajeros = await obtenerPasajeros();
    listaVuelos = await obtenerVuelos();

    llenarSelects();

  } catch(error) {
    console.error(
      "No se pudieron cargar catálogos:",
      error.message
    );
  }
}


function llenarSelects() {
  campoPasajero.innerHTML =
    listaPasajeros.map(p => `
      <option value="${p._id}">
        ${p.nombre} ${p.apellido} — ${p.documento}
      </option>
    `).join("");

  campoVuelo.innerHTML =
    listaVuelos.map(v => `
      <option value="${v._id}">
        ${v.numeroVuelo} —
        ${formatearFecha(v.horaSalida)}
        ${formatearHora(v.horaSalida)}
      </option>
    `).join("");
}


// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent =
      "No hay reservas que coincidan con los filtros.";
    return;
  }

  mensajeVacio.classList.add("oculto");

  lista.forEach(r => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${r.pasajero.nombreCompleto}</td>

      <td>
        <span class="codigo-iata">
          ${r.pasajero.documento}
        </span>
      </td>

      <td>
        <span class="numero-vuelo">
          ${r.vuelo.numeroVuelo}
        </span>
      </td>

      <td>
        <span class="hora">
          ${formatearHora(r.vuelo.horaSalida)}
        </span>
        <span class="ciudad">
          ${formatearFecha(r.vuelo.horaSalida)}
        </span>
      </td>

      <td>
        <span class="codigo-iata">
          ${r.asiento}
        </span>
      </td>

      <td>
        <span class="etiqueta-estado clase-${r.clase}">
          ${nombresClase[r.clase]}
        </span>
      </td>

      <td>
        <span class="etiqueta-estado ${
          r.registrado ? "estado-abordando" : "estado-retrasado"
        }">
          ${r.registrado ? "Registrado" : "Pendiente"}
        </span>
      </td>

      <td class="columna-acciones">
        <button
          class="boton-icono"
          data-accion="checkin"
          data-id="${r._id}">
          ${r.registrado ? "Cancelar check-in" : "Check-in"}
        </button>

        <button
          class="boton-icono"
          data-accion="editar"
          data-id="${r._id}">
          Editar
        </button>

        <button
          class="boton-icono peligro"
          data-accion="eliminar"
          data-id="${r._id}">
          Eliminar
        </button>
      </td>
    `;

    cuerpoTabla.appendChild(fila);
  });
}


// ===== Filtros =====
function aplicarFiltros() {
  const vuelo = filtroVuelo.value.trim().toUpperCase();
  const pasajero = filtroPasajero.value.trim().toUpperCase();
  const clase = filtroClase.value;
  const registrado = filtroRegistrado.value;

  const filtradas = reservas.filter(r => {

    if (vuelo && !r.vuelo.numeroVuelo.toUpperCase().includes(vuelo)) {
      return false;
    }

    if (pasajero && !(
      r.pasajero.nombreCompleto.toUpperCase().includes(pasajero) ||
      r.pasajero.documento.toUpperCase().includes(pasajero)
    )) {
      return false;
    }

    if (clase && r.clase !== clase) {
      return false;
    }

    if (registrado && String(r.registrado) !== registrado) {
      return false;
    }

    return true;
  });

  renderTabla(filtradas);
}


function limpiarFiltros() {
  filtroVuelo.value = "";
  filtroPasajero.value = "";
  filtroClase.value = "";
  filtroRegistrado.value = "";

  renderTabla(reservas);
}


// ===== Modal =====
function abrirModal(reserva) {
  errorFormulario.classList.add("oculto");

  if (reserva) {
    idEditando = reserva._id;
    tituloModal.textContent = "Editar reserva";

    campoPasajero.value = reserva.pasajero._id;
    campoVuelo.value = reserva.vuelo._id;
    campoAsiento.value = reserva.asiento;
    campoClase.value = reserva.clase;
    campoRegistrado.value = String(reserva.registrado);

  } else {
    idEditando = null;
    tituloModal.textContent = "Nueva reserva";
    formularioReserva.reset();
  }

  fondoModal.classList.remove("oculto");
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

  const cuerpo = {
    pasajeroId: campoPasajero.value,
    vueloId: campoVuelo.value,
    asiento: campoAsiento.value.trim().toUpperCase(),
    clase: campoClase.value,
    registrado: campoRegistrado.value === "true"
  };

  try {
    if (idEditando) {
      await actualizarReserva(idEditando, cuerpo);
    } else {
      await agregarReserva(cuerpo);
    }

    cerrarModal();
    await cargarReservas();

  } catch(error) {
    mostrarError(error.message);
  }
}


// ===== Acciones de tabla =====
async function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id = boton.dataset.id;
  const reserva = reservas.find(r => r._id === id);

  if (boton.dataset.accion === "checkin") {
    try {
      await actualizarReserva(id, {
        pasajeroId: reserva.pasajero.id,
        vueloId:    reserva.vuelo.id,
        asiento:    reserva.asiento,
        clase:      reserva.clase,
        registrado: !reserva.registrado
      });
      await cargarReservas();
    } catch(error) {
      alert("No se pudo actualizar el check-in: " + error.message);
    }
  }

  if (boton.dataset.accion === "editar") {
    abrirModal(reserva);
  }

  if (boton.dataset.accion === "eliminar") {
    if (confirm("¿Eliminar reserva?")) {
      try {
        await eliminarReserva(id);
        await cargarReservas();
      } catch(error) {
        alert("No se pudo eliminar: " + error.message);
      }
    }
  }
}


// ===== Eventos =====
filtroVuelo.addEventListener("input", aplicarFiltros);
filtroPasajero.addEventListener("input", aplicarFiltros);

filtroClase.addEventListener("change", aplicarFiltros);
filtroRegistrado.addEventListener("change", aplicarFiltros);

btnLimpiar.addEventListener("click", limpiarFiltros);

cuerpoTabla.addEventListener("click", manejarAccion);

btnNueva.addEventListener("click", () => abrirModal(null));

btnCerrar.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

formularioReserva.addEventListener("submit", guardar);

fondoModal.addEventListener("click", e => {
  if (e.target === fondoModal) cerrarModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModal.classList.contains("oculto")) {
    cerrarModal();
  }
});


// ===== Inicio =====
cargarCatalogos();
cargarReservas();