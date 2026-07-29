// ===== Seguridad de sesión =====
const tokenSesion = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!tokenSesion) {
  window.location.href = "login.html";
}

// ===== Estado =====
let reservas = [];
let vuelos = [];
let reservaEnCheckin = null;
let contadorMaletas = 0;

// ===== Referencias del DOM =====
const usuarioSesion    = document.getElementById("usuarioSesion");
const btnSalir         = document.getElementById("btnSalir");
const cuerpoTabla      = document.getElementById("cuerpoTablaReservas");
const mensajeVacio     = document.getElementById("mensajeVacio");
const filtroVuelo      = document.getElementById("filtroVuelo");
const filtroPasajero   = document.getElementById("filtroPasajero");
const filtroRegistrado = document.getElementById("filtroRegistrado");
const btnLimpiar       = document.getElementById("btnLimpiar");

// Modal check-in
const fondoModalCheckin      = document.getElementById("fondoModalCheckin");
const formularioCheckin      = document.getElementById("formularioCheckin");
const resumenPasajeroCheckin = document.getElementById("resumenPasajeroCheckin");
const campoEquipajeMano      = document.getElementById("campoEquipajeMano");
const listaMaletas           = document.getElementById("listaMaletas");
const btnAgregarMaleta       = document.getElementById("btnAgregarMaleta");
const errorCheckin           = document.getElementById("errorCheckin");
const btnCerrarCheckin       = document.getElementById("btnCerrarCheckin");
const btnCancelarCheckin     = document.getElementById("btnCancelarCheckin");

// Modal boleto
const fondoModalBoleto = document.getElementById("fondoModalBoleto");
const btnCerrarBoleto  = document.getElementById("btnCerrarBoleto");
const btnCerrarBoleto2 = document.getElementById("btnCerrarBoleto2");

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

// ===== Cargar vuelos (para completar origen/destino en el boleto) =====
async function cargarVuelos() {
  try {
    vuelos = await obtenerVuelos();
  } catch (error) {
    console.error("Error al cargar vuelos:", error.message);
  }
}

// ===== Cargar TODAS las reservas =====
async function cargarReservas() {
  try {
    reservas = await obtenerReservas();
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
      <td><span class="etiqueta-estado clase-${r.clase}">${nombresClase[r.clase]}</span></td>
      <td>
        <span class="etiqueta-estado ${r.registrado ? 'estado-abordando' : 'estado-retrasado'}">
          ${r.registrado ? 'Registrado' : 'Pendiente'}
        </span>
      </td>
      <td class="columna-acciones">
        ${r.registrado
          ? `<button class="boton-icono" data-accion="ver" data-id="${r._id}">Ver boleto</button>
             <button class="boton-icono" data-accion="cancelar" data-id="${r._id}">Cancelar check-in</button>`
          : `<button class="boton-icono" data-accion="checkin" data-id="${r._id}">Hacer check-in</button>`
        }
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

// ===== Manejo de acciones de la tabla =====
async function manejarAccion(e) {
  const boton = e.target.closest("button[data-id]");
  if (!boton) return;

  const id = boton.dataset.id;
  const accion = boton.dataset.accion;
  const reserva = reservas.find(r => r._id === id);
  if (!reserva) return;

  if (accion === "checkin") {
    abrirModalCheckin(reserva);
  }

  if (accion === "ver") {
    abrirModalBoleto(reserva);
  }

  if (accion === "cancelar") {
    if (!confirm("¿Cancelar el check-in de este pasajero?")) return;
    try {
      await actualizarReserva(id, {
        pasajeroId: reserva.pasajero.id,
        vueloId:    reserva.vuelo.id,
        asiento:    reserva.asiento,
        clase:      reserva.clase,
        registrado: false
      });
      await cargarReservas();
    } catch (error) {
      alert("No se pudo cancelar el check-in: " + error.message);
    }
  }
}

// ===== Modal de check-in: maletas dinámicas =====
function agregarFilaMaleta(pesoInicial) {
  contadorMaletas++;
  const idFila = `maleta-${contadorMaletas}`;

  const fila = document.createElement("div");
  fila.className = "maleta-fila";
  fila.dataset.id = idFila;
  fila.innerHTML = `
    <span class="maleta-numero">#${listaMaletas.children.length + 1}</span>
    <input type="number" class="campo-peso-maleta" min="0" max="50" step="0.5" placeholder="Peso en kg" value="${pesoInicial ?? ''}">
    <button type="button" class="boton-icono boton-quitar-maleta" title="Quitar maleta">✕</button>
  `;

  fila.querySelector(".boton-quitar-maleta").addEventListener("click", () => {
    fila.remove();
    renumerarMaletas();
  });

  listaMaletas.appendChild(fila);
}

function renumerarMaletas() {
  [...listaMaletas.children].forEach((fila, idx) => {
    fila.querySelector(".maleta-numero").textContent = `#${idx + 1}`;
  });
}

btnAgregarMaleta.addEventListener("click", () => agregarFilaMaleta());

// ===== Abrir modal de check-in =====
function abrirModalCheckin(reserva) {
  reservaEnCheckin = reserva;
  errorCheckin.classList.add("oculto");
  formularioCheckin.reset();
  listaMaletas.innerHTML = "";
  contadorMaletas = 0;
  campoEquipajeMano.checked = true;

  resumenPasajeroCheckin.innerHTML = `
    <div class="resumen-linea"><span>Pasajero</span><strong>${reserva.pasajero.nombreCompleto}</strong></div>
    <div class="resumen-linea"><span>Documento</span><strong>${reserva.pasajero.documento}</strong></div>
    <div class="resumen-linea"><span>Vuelo</span><strong>${reserva.vuelo.numeroVuelo}</strong></div>
    <div class="resumen-linea"><span>Asiento</span><strong>${reserva.asiento} — ${nombresClase[reserva.clase]}</strong></div>
  `;

  fondoModalCheckin.classList.remove("oculto");
}

function cerrarModalCheckin() {
  fondoModalCheckin.classList.add("oculto");
  reservaEnCheckin = null;
}

btnCerrarCheckin.addEventListener("click", cerrarModalCheckin);
btnCancelarCheckin.addEventListener("click", cerrarModalCheckin);
fondoModalCheckin.addEventListener("click", e => {
  if (e.target === fondoModalCheckin) cerrarModalCheckin();
});

// ===== Confirmar check-in con equipaje =====
formularioCheckin.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!reservaEnCheckin) return;

  const pesos = [...listaMaletas.querySelectorAll(".campo-peso-maleta")].map(input => Number(input.value));

  for (const peso of pesos) {
    if (!peso || peso <= 0) {
      errorCheckin.textContent = "Cada maleta debe tener un peso válido mayor a 0.";
      errorCheckin.classList.remove("oculto");
      return;
    }
    if (peso > 32) {
      errorCheckin.textContent = "Ninguna maleta puede exceder 32 kg.";
      errorCheckin.classList.remove("oculto");
      return;
    }
  }

  const maletasDocumentadas = pesos.map((peso, idx) => ({ numero: idx + 1, pesoKg: peso }));
  const puertaEmbarque = "P" + (Math.floor(Math.random() * 20) + 1);

  const btn = formularioCheckin.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    await actualizarReserva(reservaEnCheckin._id, {
      pasajeroId: reservaEnCheckin.pasajero.id,
      vueloId:    reservaEnCheckin.vuelo.id,
      asiento:    reservaEnCheckin.asiento,
      clase:      reservaEnCheckin.clase,
      registrado: true,
      puertaEmbarque,
      equipaje: {
        maletasDocumentadas,
        equipajeMano: campoEquipajeMano.checked
      }
    });

    cerrarModalCheckin();
    await cargarReservas();

  } catch (error) {
    errorCheckin.textContent = error.message;
    errorCheckin.classList.remove("oculto");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar check-in";
  }
});

// ===== Modal del boleto =====
function abrirModalBoleto(reserva) {
  const vuelo = vuelos.find(v => v._id === reserva.vuelo.id);

  document.getElementById("boletoCodigo").textContent = reserva.codigoBoleto || "—";
  document.getElementById("boletoOrigen").textContent = vuelo?.origen?.codigoIata || "—";
  document.getElementById("boletoOrigenCiudad").textContent = vuelo?.origen?.ciudad || "";
  document.getElementById("boletoDestino").textContent = vuelo?.destino?.codigoIata || "—";
  document.getElementById("boletoDestinoCiudad").textContent = vuelo?.destino?.ciudad || "";
  document.getElementById("boletoPasajero").textContent = reserva.pasajero.nombreCompleto;
  document.getElementById("boletoVuelo").textContent = reserva.vuelo.numeroVuelo;
  document.getElementById("boletoFecha").textContent = formatearFecha(reserva.vuelo.horaSalida);
  document.getElementById("boletoHora").textContent = formatearHora(reserva.vuelo.horaSalida);
  document.getElementById("boletoAsiento").textContent = reserva.asiento;
  document.getElementById("boletoClase").textContent = nombresClase[reserva.clase];
  document.getElementById("boletoPuerta").textContent = reserva.puertaEmbarque || "Por asignar";
  document.getElementById("boletoEquipajeMano").textContent = reserva.equipaje?.equipajeMano ? "Sí" : "No";

  const maletas = reserva.equipaje?.maletasDocumentadas || [];
  const contMaletas = document.getElementById("boletoMaletas");
  contMaletas.innerHTML = maletas.length
    ? `<strong>Maletas documentadas:</strong> ` + maletas.map(m => `#${m.numero} (${m.pesoKg} kg)`).join(" · ")
    : `<strong>Maletas documentadas:</strong> Ninguna`;

  fondoModalBoleto.classList.remove("oculto");
}

function cerrarModalBoleto() {
  fondoModalBoleto.classList.add("oculto");
}

btnCerrarBoleto.addEventListener("click", cerrarModalBoleto);
btnCerrarBoleto2.addEventListener("click", cerrarModalBoleto);
fondoModalBoleto.addEventListener("click", e => {
  if (e.target === fondoModalBoleto) cerrarModalBoleto();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!fondoModalCheckin.classList.contains("oculto")) cerrarModalCheckin();
    if (!fondoModalBoleto.classList.contains("oculto")) cerrarModalBoleto();
  }
});

// ===== Eventos =====
filtroVuelo.addEventListener("input",       aplicarFiltros);
filtroPasajero.addEventListener("input",    aplicarFiltros);
filtroRegistrado.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click",        limpiarFiltros);
cuerpoTabla.addEventListener("click",       manejarAccion);

// ===== Inicio =====
(async function iniciar() {
  await cargarVuelos();
  await cargarReservas();
})();