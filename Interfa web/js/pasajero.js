// ===== Seguridad de sesión =====
const tokenSesion = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!tokenSesion) {
  window.location.href = "login.html";
}

// ===== Estado =====
let vuelos = [];
let misReservas = [];
let todasLasReservas = [];
let pasajeroActual = null;
let vueloSeleccionado = null;

// ===== Referencias del DOM =====
const usuarioSesion = document.getElementById("usuarioSesion");
const btnSalir       = document.getElementById("btnSalir");

const panelBusqueda  = document.getElementById("panelBusqueda");
const panelResultados = document.getElementById("panelResultados");

const filtroOrigen  = document.getElementById("filtroOrigen");
const filtroDestino = document.getElementById("filtroDestino");
const filtroFecha   = document.getElementById("filtroFecha");
const btnLimpiar    = document.getElementById("btnLimpiar");

const rejillaVuelos       = document.getElementById("rejillaVuelos");
const mensajeVacioVuelos  = document.getElementById("mensajeVacioVuelos");

const cuerpoTablaReservas  = document.getElementById("cuerpoTablaReservas");
const mensajeVacioReservas = document.getElementById("mensajeVacioReservas");

const fondoModal       = document.getElementById("fondoModal");
const formularioReserva = document.getElementById("formularioReserva");
const errorFormulario   = document.getElementById("errorFormulario");
const campoAsiento      = document.getElementById("campoAsiento");
const campoClase        = document.getElementById("campoClase");
const btnCerrar         = document.getElementById("btnCerrar");
const btnCancelar       = document.getElementById("btnCancelar");

// ===== Usuario =====
if (usuarioSesion) {
  usuarioSesion.textContent = localStorage.getItem("nombre") || rol || "";
}
if (btnSalir) {
  btnSalir.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ===== Formato =====
function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}
function soloFecha(iso) {
  return iso.substring(0, 10);
}
const nombresClase = { economica: "Económica", ejecutiva: "Ejecutiva", primera: "Primera" };

// Imagen de respaldo si el aeropuerto no tiene imagenUrl cargada por el admin
const IMAGEN_RESPALDO = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=60";

// ===== Cargar vuelos =====
async function cargarVuelos() {
  try {
    vuelos = await obtenerVuelos();
    aplicarFiltros();
  } catch (error) {
    rejillaVuelos.innerHTML = "";
    mensajeVacioVuelos.classList.remove("oculto");
    mensajeVacioVuelos.textContent = "Error al cargar vuelos: " + error.message;
  }
}

function aplicarFiltros() {
  const origen  = filtroOrigen.value.trim().toUpperCase();
  const destino = filtroDestino.value.trim().toUpperCase();
  const fecha   = filtroFecha.value;

  const filtrados = vuelos.filter(v => {
    if (origen && !(v.origen.codigoIata.includes(origen) || v.origen.ciudad.toUpperCase().includes(origen))) return false;
    if (destino && !(v.destino.codigoIata.includes(destino) || v.destino.ciudad.toUpperCase().includes(destino))) return false;
    if (fecha && soloFecha(v.horaSalida) !== fecha) return false;
    return true;
  });

  renderTarjetasVuelos(filtrados);
}

function renderTarjetasVuelos(lista) {
  rejillaVuelos.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacioVuelos.classList.remove("oculto");
    mensajeVacioVuelos.textContent = "No hay vuelos que coincidan con la búsqueda.";
    return;
  }
  mensajeVacioVuelos.classList.add("oculto");

  lista.forEach(v => {
    const noDisponible = v.estado === "cancelado" || v.estado === "despegado";
    const imagen = v.destino.imagenUrl || v.origen.imagenUrl || IMAGEN_RESPALDO;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-vuelo";
    tarjeta.innerHTML = `
      <div class="tarjeta-vuelo-imagen" style="background-image:url('${imagen}')">
        <span class="etiqueta-estado estado-${v.estado}">${v.estado}</span>
      </div>
      <div class="tarjeta-vuelo-cuerpo">
        <div class="tarjeta-vuelo-ruta">
          <div>
            <span class="codigo-iata">${v.origen.codigoIata}</span>
            <span class="ciudad">${v.origen.ciudad}</span>
          </div>
          <span class="tarjeta-vuelo-flecha" aria-hidden="true">→</span>
          <div>
            <span class="codigo-iata">${v.destino.codigoIata}</span>
            <span class="ciudad">${v.destino.ciudad}</span>
          </div>
        </div>
        <div class="tarjeta-vuelo-detalle">
          <span class="numero-vuelo">${v.numeroVuelo}</span>
          <span class="ciudad">${v.aerolinea.nombre}</span>
        </div>
        <div class="tarjeta-vuelo-horarios">
          <div><span class="hora">${formatearHora(v.horaSalida)}</span><span class="ciudad">${formatearFecha(v.horaSalida)}</span></div>
          <div><span class="hora">${formatearHora(v.horaLlegada)}</span><span class="ciudad">${formatearFecha(v.horaLlegada)}</span></div>
        </div>
        <button class="boton boton-principal tarjeta-vuelo-boton" data-id="${v._id}" ${noDisponible ? "disabled" : ""}>
          ${noDisponible ? "No disponible" : "Reservar"}
        </button>
      </div>
    `;
    rejillaVuelos.appendChild(tarjeta);
  });
}

function limpiarFiltros() {
  filtroOrigen.value = "";
  filtroDestino.value = "";
  filtroFecha.value = "";
  renderTarjetasVuelos(vuelos);
}

// ===== Cargar mis reservas =====
async function cargarMisReservas() {
  if (!pasajeroActual) return;
  try {
    todasLasReservas = await obtenerReservas();
    misReservas = todasLasReservas.filter(
      r => String(r.pasajero.id) === String(pasajeroActual._id)
    );
    renderTablaReservas();
  } catch (error) {
    console.error("Error cargando reservas:", error.message);
  }
}

function renderTablaReservas() {
  cuerpoTablaReservas.innerHTML = "";

  if (misReservas.length === 0) {
    mensajeVacioReservas.classList.remove("oculto");
    return;
  }
  mensajeVacioReservas.classList.add("oculto");

  misReservas.forEach(r => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="numero-vuelo">${r.vuelo.numeroVuelo}</span></td>
      <td><span class="hora">${formatearHora(r.vuelo.horaSalida)}</span><span class="ciudad">${formatearFecha(r.vuelo.horaSalida)}</span></td>
      <td><span class="codigo-iata">${r.asiento}</span></td>
      <td><span class="etiqueta-estado clase-${r.clase}">${nombresClase[r.clase]}</span></td>
      <td><span class="etiqueta-estado ${r.registrado ? "estado-abordando" : "estado-retrasado"}">${r.registrado ? "Registrado" : "Pendiente"}</span></td>
    `;
    cuerpoTablaReservas.appendChild(fila);
  });
}

// ===== Modal =====
function abrirModal(vuelo) {
  vueloSeleccionado = vuelo;
  errorFormulario.classList.add("oculto");
  formularioReserva.reset();
  fondoModal.classList.remove("oculto");
}
function cerrarModal() {
  fondoModal.classList.add("oculto");
  vueloSeleccionado = null;
}
function mostrarError(mensaje) {
  errorFormulario.textContent = mensaje;
  errorFormulario.classList.remove("oculto");
}

rejillaVuelos.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-id]");
  if (!boton || boton.disabled) return;
  const vuelo = vuelos.find(v => v._id === boton.dataset.id);
  if (vuelo) abrirModal(vuelo);
});

// ===== Confirmar reserva (con validaciones) =====
formularioReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  const asiento = campoAsiento.value.trim().toUpperCase();
  const clase = campoClase.value;

  if (!asiento) return mostrarError("El asiento es obligatorio.");

  if (!/^\d{1,2}[A-F]$/.test(asiento)) {
    return mostrarError("Formato de asiento inválido. Usa por ejemplo 12A.");
  }

  const asientoOcupado = todasLasReservas.find(r =>
    String(r.vuelo.id) === String(vueloSeleccionado._id) &&
    r.asiento.toUpperCase() === asiento
  );
  if (asientoOcupado) {
    return mostrarError(`El asiento ${asiento} ya está ocupado en este vuelo. Elige otro.`);
  }

  const reservaExistente = misReservas.find(r =>
    String(r.vuelo.id) === String(vueloSeleccionado._id)
  );
  if (reservaExistente) {
    const respuesta = confirm("Ya habías reservado este vuelo.\n\n¿Deseas reservarlo nuevamente?");
    if (!respuesta) return;
  }

  try {
    await agregarReserva({
      pasajeroId: pasajeroActual._id,
      vueloId: vueloSeleccionado._id,
      asiento,
      clase,
      registrado: false
    });
    cerrarModal();
    await cargarMisReservas();
  } catch (error) {
    mostrarError(error.message);
  }
});

// ===== Eventos =====
filtroOrigen.addEventListener("input", aplicarFiltros);
filtroDestino.addEventListener("input", aplicarFiltros);
filtroFecha.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click", limpiarFiltros);
btnCerrar.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);
fondoModal.addEventListener("click", e => {
  if (e.target === fondoModal) cerrarModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModal.classList.contains("oculto")) cerrarModal();
});

// ===== Inicio =====
(async function iniciar() {
  const pasajeroIdGuardado = localStorage.getItem("pasajeroId");

  panelBusqueda.classList.remove("oculto");
  panelResultados.classList.remove("oculto");

  if (pasajeroIdGuardado) {
    try {
      const todos = await obtenerPasajeros();
      pasajeroActual = todos.find(p => p._id === pasajeroIdGuardado) || null;
    } catch (error) {
      console.error("No se pudo cargar el pasajero vinculado:", error.message);
    }
  }

  await cargarVuelos();
  if (pasajeroActual) await cargarMisReservas();
})();