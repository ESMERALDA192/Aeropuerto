// ===== Datos de prueba =====
const reservas = [
  {
    _id: "r1",
    pasajero: { nombreCompleto: "Ana Torres Ruiz", documento: "GARA980112" },
    vuelo: { numeroVuelo: "AM452", horaSalida: "2026-07-24T14:30:00" },
    asiento: "12A", clase: "economica", registrado: true
  },
  {
    _id: "r2",
    pasajero: { nombreCompleto: "Luis Hernández Mora", documento: "HEML011203" },
    vuelo: { numeroVuelo: "AM452", horaSalida: "2026-07-24T14:30:00" },
    asiento: "3C", clase: "ejecutiva", registrado: false
  },
  {
    _id: "r3",
    pasajero: { nombreCompleto: "María Fernanda Díaz", documento: "DIMF950720" },
    vuelo: { numeroVuelo: "VB1203", horaSalida: "2026-07-24T09:15:00" },
    asiento: "18F", clase: "economica", registrado: true
  },
  {
    _id: "r4",
    pasajero: { nombreCompleto: "Carlos Peña Vargas", documento: "PEVC880405" },
    vuelo: { numeroVuelo: "Y4780", horaSalida: "2026-07-24T18:00:00" },
    asiento: "1A", clase: "primera", registrado: false
  },
  {
    _id: "r5",
    pasajero: { nombreCompleto: "Sofía Ramírez León", documento: "RALS021118" },
    vuelo: { numeroVuelo: "VB1203", horaSalida: "2026-07-24T09:15:00" },
    asiento: "22B", clase: "economica", registrado: false
  },
  {
    _id: "r6",
    pasajero: { nombreCompleto: "Jorge Aguilar Nava", documento: "AUNJ760930" },
    vuelo: { numeroVuelo: "AM118", horaSalida: "2026-07-24T07:00:00" },
    asiento: "8D", clase: "ejecutiva", registrado: true
  },
  {
    _id: "r7",
    pasajero: { nombreCompleto: "Valeria Ortiz Campos", documento: "OICV991214" },
    vuelo: { numeroVuelo: "Y4212", horaSalida: "2026-07-25T06:45:00" },
    asiento: "15E", clase: "economica", registrado: false
  }
];

// ===== Catálogos para los selects =====
const listaPasajeros = [
  { documento: "GARA980112", nombreCompleto: "Ana Torres Ruiz" },
  { documento: "HEML011203", nombreCompleto: "Luis Hernández Mora" },
  { documento: "DIMF950720", nombreCompleto: "María Fernanda Díaz" },
  { documento: "PEVC880405", nombreCompleto: "Carlos Peña Vargas" },
  { documento: "RALS021118", nombreCompleto: "Sofía Ramírez León" },
  { documento: "AUNJ760930", nombreCompleto: "Jorge Aguilar Nava" },
  { documento: "OICV991214", nombreCompleto: "Valeria Ortiz Campos" },
  { documento: "MEGR950818", nombreCompleto: "Roberto Mendoza Gil" }
];

const listaVuelos = [
  { numeroVuelo: "AM452",  horaSalida: "2026-07-24T14:30:00" },
  { numeroVuelo: "VB1203", horaSalida: "2026-07-24T09:15:00" },
  { numeroVuelo: "Y4780",  horaSalida: "2026-07-24T18:00:00" },
  { numeroVuelo: "AM118",  horaSalida: "2026-07-24T07:00:00" },
  { numeroVuelo: "VB905",  horaSalida: "2026-07-24T22:10:00" },
  { numeroVuelo: "Y4212",  horaSalida: "2026-07-25T06:45:00" }
];

// ===== Referencias del DOM =====
const cuerpoTabla       = document.getElementById("cuerpoTablaReservas");
const mensajeVacio      = document.getElementById("mensajeVacio");
const filtroVuelo       = document.getElementById("filtroVuelo");
const filtroPasajero    = document.getElementById("filtroPasajero");
const filtroClase       = document.getElementById("filtroClase");
const filtroRegistrado  = document.getElementById("filtroRegistrado");
const btnLimpiar        = document.getElementById("btnLimpiar");
const btnNueva          = document.getElementById("btnNueva");

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

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
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

// ===== Llenar selects del formulario =====
function llenarSelects() {
  campoPasajero.innerHTML = listaPasajeros
    .map(p => `<option value="${p.documento}">${p.nombreCompleto} — ${p.documento}</option>`)
    .join("");

  campoVuelo.innerHTML = listaVuelos
    .map(v => `<option value="${v.numeroVuelo}">${v.numeroVuelo} — ${formatearFecha(v.horaSalida)} ${formatearHora(v.horaSalida)}</option>`)
    .join("");
}

// ===== Abrir / cerrar modal =====
function abrirModal(reserva) {
  errorFormulario.classList.add("oculto");

  if (reserva) {
    idEditando = reserva._id;
    tituloModal.textContent = `Editar reserva — ${reserva.pasajero.nombreCompleto}`;
    campoPasajero.value   = reserva.pasajero.documento;
    campoVuelo.value      = reserva.vuelo.numeroVuelo;
    campoAsiento.value    = reserva.asiento;
    campoClase.value      = reserva.clase;
    campoRegistrado.value = String(reserva.registrado);
  } else {
    idEditando = null;
    tituloModal.textContent = "Nueva reserva";
    formularioReserva.reset();
    campoPasajero.value   = listaPasajeros[0].documento;
    campoVuelo.value      = listaVuelos[0].numeroVuelo;
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
function guardar(evento) {
  evento.preventDefault();

  const asiento = campoAsiento.value.trim().toUpperCase();

  if (!asiento) return mostrarError("El asiento es obligatorio.");

  if (!/^\d{1,2}[A-F]$/.test(asiento)) {
    return mostrarError("Formato de asiento inválido. Usa por ejemplo 12A.");
  }

  const ocupado = reservas.find(r =>
    r.vuelo.numeroVuelo === campoVuelo.value &&
    r.asiento.toUpperCase() === asiento &&
    r._id !== idEditando
  );
  if (ocupado) {
    return mostrarError(`El asiento ${asiento} ya está ocupado en el vuelo ${campoVuelo.value}.`);
  }

  const duplicado = reservas.find(r =>
    r.pasajero.documento === campoPasajero.value &&
    r.vuelo.numeroVuelo === campoVuelo.value &&
    r._id !== idEditando
  );
  if (duplicado) {
    return mostrarError("Ese pasajero ya tiene una reserva en este vuelo.");
  }

  const pasajero = listaPasajeros.find(p => p.documento === campoPasajero.value);
  const vuelo    = listaVuelos.find(v => v.numeroVuelo === campoVuelo.value);

  const datos = {
    pasajero:   { nombreCompleto: pasajero.nombreCompleto, documento: pasajero.documento },
    vuelo:      { numeroVuelo: vuelo.numeroVuelo, horaSalida: vuelo.horaSalida },
    asiento:    asiento,
    clase:      campoClase.value,
    registrado: campoRegistrado.value === "true"
  };

  if (idEditando) {
    const i = reservas.findIndex(r => r._id === idEditando);
    reservas[i] = { ...reservas[i], ...datos };
  } else {
    reservas.push({ _id: "r" + Date.now(), ...datos });
  }

  cerrarModal();
  aplicarFiltros();
}

// ===== Acciones de fila =====
function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id      = boton.dataset.id;
  const accion  = boton.dataset.accion;
  const reserva = reservas.find(r => r._id === id);

  if (accion === "checkin") {
    reserva.registrado = !reserva.registrado;
    aplicarFiltros();
  }

  if (accion === "editar") {
    abrirModal(reserva);
  }

  if (accion === "eliminar") {
    if (confirm(`¿Eliminar la reserva de ${reserva.pasajero.nombreCompleto}?`)) {
      reservas.splice(reservas.findIndex(r => r._id === id), 1);
      aplicarFiltros();
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
llenarSelects();
renderTabla(reservas);