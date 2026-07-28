// ===== Seguridad de sesión =====
const tokenSesion = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!tokenSesion) {
  window.location.href = "login.html";
}

// ===== Estado =====
let reservas = [];

// ===== Referencias del DOM =====
const usuarioSesion    = document.getElementById("usuarioSesion");
const btnSalir         = document.getElementById("btnSalir");
const cuerpoTabla      = document.getElementById("cuerpoTablaReservas");
const mensajeVacio     = document.getElementById("mensajeVacio");
const filtroVuelo      = document.getElementById("filtroVuelo");
const filtroPasajero   = document.getElementById("filtroPasajero");
const filtroRegistrado = document.getElementById("filtroRegistrado");
const btnLimpiar       = document.getElementById("btnLimpiar");

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

// ===== Formato =====
function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}
const nombresClase = { economica: "Económica", ejecutiva: "Ejecutiva", primera: "Primera" };

// ===== Cargar reservas de vuelos en abordaje =====
async function cargarReservas() {
  try {
    const todas  = await obtenerReservas();
    const vuelos = await obtenerVuelos();

    const vuelosAbordando = vuelos
      .filter(v => v.estado === "abordando")
      .map(v => String(v._id));

    reservas = todas.filter(r =>
      vuelosAbordando.includes(String(r.vuelo.id))
    );

    aplicarFiltros();
  } catch (error) {
    cuerpoTabla.innerHTML = "";
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "Error al cargar reservas: " + error.message;
  }
}

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    mensajeVacio.textContent = "No hay reservas de vuelos en abordaje.";
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
      <td><span class="etiqueta-estado clase-${r.clase}">${nombresClase[r.clase]}</span></td>
      <td>
        <span class="etiqueta-estado ${r.registrado ? 'estado-abordando' : 'estado-retrasado'}">
          ${r.registrado ? 'Registrado' : 'Pendiente'}
        </span>
      </td>
      <td class="columna-acciones">
        <button class="boton-icono" data-id="${r._id}">
          ${r.registrado ? 'Cancelar check-in' : 'Hacer check-in'}
        </button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// ===== Filtros =====
function aplicarFiltros() {
  const vuelo      = filtroVuelo.value.trim().toUpperCase();
  const pasajero   = filtroPasajero.value.trim().toUpperCase();
  const registrado = filtroRegistrado.value;

  const filtradas = reservas.filter(r => {
    if (vuelo && !r.vuelo.numeroVuelo.toUpperCase().includes(vuelo)) return false;
    if (pasajero && !(
          r.pasajero.nombreCompleto.toUpperCase().includes(pasajero) ||
          r.pasajero.documento.toUpperCase().includes(pasajero)
        )) return false;
    if (registrado && String(r.registrado) !== registrado) return false;
    return true;
  });

  renderTabla(filtradas);
}

function limpiarFiltros() {
  filtroVuelo.value      = "";
  filtroPasajero.value   = "";
  filtroRegistrado.value = "";
  renderTabla(reservas);
}

// ===== Check-in (única acción del agente) =====
async function manejarCheckin(e) {
  const boton = e.target.closest("button[data-id]");
  if (!boton) return;

  const id = boton.dataset.id;
  const reserva = reservas.find(r => r._id === id);

  try {
    await actualizarReserva(id, {
      pasajeroId: reserva.pasajero.id,
      vueloId:    reserva.vuelo.id,
      asiento:    reserva.asiento,
      clase:      reserva.clase,
      registrado: !reserva.registrado
    });
    await cargarReservas();
  } catch (error) {
    alert("No se pudo actualizar el check-in: " + error.message);
  }
}

// ===== Eventos =====
filtroVuelo.addEventListener("input",       aplicarFiltros);
filtroPasajero.addEventListener("input",    aplicarFiltros);
filtroRegistrado.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click",        limpiarFiltros);
cuerpoTabla.addEventListener("click",       manejarCheckin);

// ===== Inicio =====
cargarReservas();