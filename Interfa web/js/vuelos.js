// ===== Datos de prueba =====
// Cuando el backend esté listo, esto se reemplaza por: await obtenerVuelos()
const vuelos = [
  {
    _id: "1",
    numeroVuelo: "AM452",
    aerolinea: { nombre: "Aeroméxico", codigoIata: "AM" },
    origen:  { codigoIata: "GDL", ciudad: "Guadalajara" },
    destino: { codigoIata: "MEX", ciudad: "Ciudad de México" },
    horaSalida:  "2026-07-24T14:30:00",
    horaLlegada: "2026-07-24T15:45:00",
    estado: "programado"
  },
  {
    _id: "2",
    numeroVuelo: "VB1203",
    aerolinea: { nombre: "Viva Aerobus", codigoIata: "VB" },
    origen:  { codigoIata: "MEX", ciudad: "Ciudad de México" },
    destino: { codigoIata: "CUN", ciudad: "Cancún" },
    horaSalida:  "2026-07-24T09:15:00",
    horaLlegada: "2026-07-24T11:50:00",
    estado: "abordando"
  },
  {
    _id: "3",
    numeroVuelo: "Y4780",
    aerolinea: { nombre: "Volaris", codigoIata: "Y4" },
    origen:  { codigoIata: "GDL", ciudad: "Guadalajara" },
    destino: { codigoIata: "TIJ", ciudad: "Tijuana" },
    horaSalida:  "2026-07-24T18:00:00",
    horaLlegada: "2026-07-24T19:40:00",
    estado: "retrasado"
  },
  {
    _id: "4",
    numeroVuelo: "AM118",
    aerolinea: { nombre: "Aeroméxico", codigoIata: "AM" },
    origen:  { codigoIata: "MTY", ciudad: "Monterrey" },
    destino: { codigoIata: "GDL", ciudad: "Guadalajara" },
    horaSalida:  "2026-07-24T07:00:00",
    horaLlegada: "2026-07-24T08:20:00",
    estado: "despegado"
  },
  {
    _id: "5",
    numeroVuelo: "VB905",
    aerolinea: { nombre: "Viva Aerobus", codigoIata: "VB" },
    origen:  { codigoIata: "CUN", ciudad: "Cancún" },
    destino: { codigoIata: "GDL", ciudad: "Guadalajara" },
    horaSalida:  "2026-07-24T22:10:00",
    horaLlegada: "2026-07-25T00:35:00",
    estado: "cancelado"
  },
  {
    _id: "6",
    numeroVuelo: "Y4212",
    aerolinea: { nombre: "Volaris", codigoIata: "Y4" },
    origen:  { codigoIata: "TIJ", ciudad: "Tijuana" },
    destino: { codigoIata: "MEX", ciudad: "Ciudad de México" },
    horaSalida:  "2026-07-25T06:45:00",
    horaLlegada: "2026-07-25T10:15:00",
    estado: "programado"
  }
];

// ===== Catálogos para los selects del formulario =====
const listaAerolineas = [
  { nombre: "Aeroméxico",        codigoIata: "AM" },
  { nombre: "Volaris",           codigoIata: "Y4" },
  { nombre: "Viva Aerobus",      codigoIata: "VB" },
  { nombre: "American Airlines", codigoIata: "AA" },
  { nombre: "Copa Airlines",     codigoIata: "CM" }
];

const listaAeropuertos = [
  { codigoIata: "GDL", ciudad: "Guadalajara" },
  { codigoIata: "MEX", ciudad: "Ciudad de México" },
  { codigoIata: "CUN", ciudad: "Cancún" },
  { codigoIata: "MTY", ciudad: "Monterrey" },
  { codigoIata: "TIJ", ciudad: "Tijuana" },
  { codigoIata: "PVR", ciudad: "Puerto Vallarta" },
  { codigoIata: "TPQ", ciudad: "Tepic" },
  { codigoIata: "LAX", ciudad: "Los Ángeles" }
];

// ===== Referencias del DOM =====
const cuerpoTabla    = document.getElementById("cuerpoTablaVuelos");
const mensajeVacio   = document.getElementById("mensajeVacio");
const filtroEstado   = document.getElementById("filtroEstado");
const filtroOrigen   = document.getElementById("filtroOrigen");
const filtroDestino  = document.getElementById("filtroDestino");
const filtroFecha    = document.getElementById("filtroFecha");
const btnLimpiar     = document.getElementById("btnLimpiar");
const btnNuevo       = document.getElementById("btnNuevo");

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

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
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
    .map(a => `<option value="${a.codigoIata}">${a.nombre} (${a.codigoIata})</option>`)
    .join("");

  const opcionesAeropuerto = listaAeropuertos
    .map(p => `<option value="${p.codigoIata}">${p.codigoIata} — ${p.ciudad}</option>`)
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
    campoAerolinea.value = vuelo.aerolinea.codigoIata;
    campoOrigen.value    = vuelo.origen.codigoIata;
    campoDestino.value   = vuelo.destino.codigoIata;
    campoSalida.value    = vuelo.horaSalida.slice(0, 16);
    campoLlegada.value   = vuelo.horaLlegada.slice(0, 16);
    campoEstado.value    = vuelo.estado;
  } else {
    idEditando = null;
    tituloModal.textContent = "Nuevo vuelo";
    formularioVuelo.reset();
    campoAerolinea.value = listaAerolineas[0].codigoIata;
    campoOrigen.value    = listaAeropuertos[0].codigoIata;
    campoDestino.value   = listaAeropuertos[1].codigoIata;
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
function guardar(evento) {
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

  const duplicado = vuelos.find(v =>
    v.numeroVuelo.toUpperCase() === numero && v._id !== idEditando
  );
  if (duplicado) return mostrarError(`Ya existe un vuelo con el número ${numero}.`);

  const aerolinea = listaAerolineas.find(a => a.codigoIata === campoAerolinea.value);
  const origen    = listaAeropuertos.find(p => p.codigoIata === campoOrigen.value);
  const destino   = listaAeropuertos.find(p => p.codigoIata === campoDestino.value);

  const datos = {
    numeroVuelo: numero,
    aerolinea:   { nombre: aerolinea.nombre, codigoIata: aerolinea.codigoIata },
    origen:      { codigoIata: origen.codigoIata,  ciudad: origen.ciudad },
    destino:     { codigoIata: destino.codigoIata, ciudad: destino.ciudad },
    horaSalida:  campoSalida.value,
    horaLlegada: campoLlegada.value,
    estado:      campoEstado.value
  };

  if (idEditando) {
    const i = vuelos.findIndex(v => v._id === idEditando);
    vuelos[i] = { ...vuelos[i], ...datos };
  } else {
    vuelos.push({ _id: "v" + Date.now(), ...datos });
  }

  cerrarModal();
  aplicarFiltros();
}

// ===== Acciones de fila =====
function manejarAccion(e) {
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
      vuelos.splice(vuelos.findIndex(v => v._id === id), 1);
      aplicarFiltros();
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
llenarSelects();
renderTabla(vuelos);