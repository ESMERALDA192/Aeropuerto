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
let aeropuertos = [];
let tipoViaje = "redondo";
let cantidadPasajeros = 1;
let origenSeleccionado = null;  // { codigoIata, ciudad }
let destinoSeleccionado = null;

const IMAGEN_RESPALDO = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=60";

// ===== Referencias del DOM: sesión =====
const usuarioSesion = document.getElementById("usuarioSesion");
const btnSalir       = document.getElementById("btnSalir");

// ===== Referencias del DOM: buscador =====
const tipoBtns          = document.querySelectorAll(".tipo-btn");
const panelBusqueda     = document.getElementById("panelBusqueda");
const grupoOrigen       = document.getElementById("grupoOrigen");
const grupoDestino      = document.getElementById("grupoDestino");
const filtroOrigen      = document.getElementById("filtroOrigen");
const filtroDestino     = document.getElementById("filtroDestino");
const sugerenciasOrigen  = document.getElementById("sugerenciasOrigen");
const sugerenciasDestino = document.getElementById("sugerenciasDestino");
const btnIntercambiar   = document.getElementById("btnIntercambiar");
const filtroSalida      = document.getElementById("filtroSalida");
const grupoRegreso      = document.getElementById("grupoRegreso");
const filtroRegreso     = document.getElementById("filtroRegreso");
const btnPasajeros      = document.getElementById("btnPasajeros");
const popoverPasajeros  = document.getElementById("popoverPasajeros");
const numeroPasajeros   = document.getElementById("numeroPasajeros");
const textoPasajeros    = document.getElementById("textoPasajeros");
const btnMenosPasajeros = document.getElementById("btnMenosPasajeros");
const btnMasPasajeros   = document.getElementById("btnMasPasajeros");
const btnBuscarVuelos   = document.getElementById("btnBuscarVuelos");

// ===== Referencias del DOM: resultados (tarjetas) =====
const panelResultados     = document.getElementById("panelResultados");
const rejillaVuelos       = document.getElementById("rejillaVuelos");
const mensajeVacioVuelos  = document.getElementById("mensajeVacioVuelos");

// ===== Referencias del DOM: mis reservas =====
const cuerpoTablaReservas  = document.getElementById("cuerpoTablaReservas");
const mensajeVacioReservas = document.getElementById("mensajeVacioReservas");

// ===== Referencias del DOM: modal de reserva =====
const fondoModal        = document.getElementById("fondoModal");
const formularioReserva  = document.getElementById("formularioReserva");
const errorFormulario    = document.getElementById("errorFormulario");
const campoAsiento       = document.getElementById("campoAsiento");
const campoClase         = document.getElementById("campoClase");
const btnCerrar          = document.getElementById("btnCerrar");
const btnCancelar        = document.getElementById("btnCancelar");

// Modal de itinerario
const fondoModalDetalle  = document.getElementById("fondoModalDetalle");
const btnCerrarDetalle   = document.getElementById("btnCerrarDetalle");
const btnCerrarDetalle2  = document.getElementById("btnCerrarDetalle2");

// Modal de boleto
const btnVerBoleto     = document.getElementById("btnVerBoleto");
const fondoModalBoleto = document.getElementById("fondoModalBoleto");
const btnCerrarBoleto  = document.getElementById("btnCerrarBoleto");
const btnCerrarBoleto2 = document.getElementById("btnCerrarBoleto2");

let reservaDetalleActual = null;

// ===== Usuario / cerrar sesión =====
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

// ===== Tipo de viaje =====
tipoBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tipoBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    tipoViaje = btn.dataset.tipo;
    grupoRegreso.style.display = tipoViaje === "sencillo" ? "none" : "flex";
  });
});

// ===== Pasajeros (stepper del buscador) =====
btnPasajeros.addEventListener("click", () => {
  popoverPasajeros.classList.toggle("oculto");
});
btnMasPasajeros.addEventListener("click", () => {
  if (cantidadPasajeros < 9) cantidadPasajeros++;
  actualizarPasajeros();
});
btnMenosPasajeros.addEventListener("click", () => {
  if (cantidadPasajeros > 1) cantidadPasajeros--;
  actualizarPasajeros();
});
function actualizarPasajeros() {
  numeroPasajeros.textContent = cantidadPasajeros;
  textoPasajeros.textContent = `${cantidadPasajeros} pasajero${cantidadPasajeros > 1 ? "s" : ""}`;
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".campo-pasajeros")) popoverPasajeros.classList.add("oculto");
});

// ===== Autocompletado de origen/destino =====
async function cargarAeropuertos() {
  try {
    aeropuertos = await obtenerAeropuertos();
  } catch (error) {
    console.error("No se pudieron cargar los aeropuertos:", error.message);
  }
}

function renderSugerencias(contenedor, texto, onSeleccionar) {
  const filtro = texto.trim().toUpperCase();
  const lista = aeropuertos.filter(a =>
    !filtro ||
    a.ciudad.toUpperCase().includes(filtro) ||
    a.codigoIata.toUpperCase().includes(filtro) ||
    a.nombre.toUpperCase().includes(filtro)
  ).slice(0, 8);

  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="sugerencia-vacio">Sin resultados</div>`;
  } else {
    contenedor.innerHTML = lista.map(a => `
      <div class="sugerencia-item" data-codigo="${a.codigoIata}" data-ciudad="${a.ciudad}">
        <div class="sugerencia-imagen" style="background-image:url('${a.imagenUrl || IMAGEN_RESPALDO}')"></div>
        <div class="sugerencia-texto">
          <strong>${a.ciudad}</strong>
          <span>${a.nombre}</span>
        </div>
        <span class="sugerencia-codigo">${a.codigoIata}</span>
      </div>
    `).join("");
  }

  contenedor.querySelectorAll(".sugerencia-item").forEach(item => {
    item.addEventListener("click", () => {
      onSeleccionar({ codigoIata: item.dataset.codigo, ciudad: item.dataset.ciudad });
      contenedor.classList.add("oculto");
    });
  });

  contenedor.classList.remove("oculto");
}

filtroOrigen.addEventListener("focus", () => renderSugerencias(sugerenciasOrigen, filtroOrigen.value, sel => {
  origenSeleccionado = sel;
  filtroOrigen.value = `${sel.ciudad} (${sel.codigoIata})`;
}));
filtroOrigen.addEventListener("input", () => {
  origenSeleccionado = null;
  renderSugerencias(sugerenciasOrigen, filtroOrigen.value, sel => {
    origenSeleccionado = sel;
    filtroOrigen.value = `${sel.ciudad} (${sel.codigoIata})`;
  });
});

filtroDestino.addEventListener("focus", () => renderSugerencias(sugerenciasDestino, filtroDestino.value, sel => {
  destinoSeleccionado = sel;
  filtroDestino.value = `${sel.ciudad} (${sel.codigoIata})`;
}));
filtroDestino.addEventListener("input", () => {
  destinoSeleccionado = null;
  renderSugerencias(sugerenciasDestino, filtroDestino.value, sel => {
    destinoSeleccionado = sel;
    filtroDestino.value = `${sel.ciudad} (${sel.codigoIata})`;
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#grupoOrigen")) sugerenciasOrigen.classList.add("oculto");
  if (!e.target.closest("#grupoDestino")) sugerenciasDestino.classList.add("oculto");
});

btnIntercambiar.addEventListener("click", () => {
  const tempSel = origenSeleccionado;
  const tempTexto = filtroOrigen.value;
  origenSeleccionado = destinoSeleccionado;
  filtroOrigen.value = filtroDestino.value;
  destinoSeleccionado = tempSel;
  filtroDestino.value = tempTexto;
});

// ===== Cargar vuelos =====
async function cargarVuelos() {
  try {
    vuelos = await obtenerVuelos();
  } catch (error) {
    console.error("Error al cargar vuelos:", error.message);
  }
}

// ===== Buscar =====
btnBuscarVuelos.addEventListener("click", async () => {
  if (vuelos.length === 0) {
    await cargarVuelos();
  }

  const origenCod  = origenSeleccionado?.codigoIata || filtroOrigen.value.trim().toUpperCase();
  const destinoCod = destinoSeleccionado?.codigoIata || filtroDestino.value.trim().toUpperCase();
  const fecha = filtroSalida.value;

  const filtrados = vuelos.filter(v => {
    if (origenCod && !v.origen.codigoIata.toUpperCase().includes(origenCod.replace(/[^A-Z]/g, ""))) return false;
    if (destinoCod && !v.destino.codigoIata.toUpperCase().includes(destinoCod.replace(/[^A-Z]/g, ""))) return false;
    if (fecha && soloFecha(v.horaSalida) !== fecha) return false;
    return true;
  });

  panelResultados.classList.remove("oculto");
  renderTarjetasVuelos(filtrados);
  panelResultados.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ===== Pintar tarjetas de vuelos =====
function renderTarjetasVuelos(lista) {
  rejillaVuelos.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacioVuelos.classList.remove("oculto");
    return;
  }
  mensajeVacioVuelos.classList.add("oculto");

  lista.forEach(v => {
    const noDisponible = v.estado === "cancelado" || v.estado === "despegado";
    const imagenFondo = v.destino.imagenUrl || v.origen.imagenUrl || IMAGEN_RESPALDO;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-vuelo";

    tarjeta.innerHTML = `
      <div class="tarjeta-vuelo-imagen" style="background-image:url('${imagenFondo}')">
        <span class="etiqueta-estado estado-${v.estado}">${v.estado}</span>
      </div>

      <div class="tarjeta-vuelo-cuerpo">
        <div class="tarjeta-vuelo-ruta">
          <div>
            <span class="codigo-iata">${v.origen.codigoIata}</span>
            <span class="ciudad">${v.origen.ciudad}</span>
          </div>
          <span class="tarjeta-vuelo-flecha">→</span>
          <div>
            <span class="codigo-iata">${v.destino.codigoIata}</span>
            <span class="ciudad">${v.destino.ciudad}</span>
          </div>
        </div>

        <div class="tarjeta-vuelo-detalle">
          <span class="numero-vuelo">${v.numeroVuelo}</span>
          <span class="ciudad">${v.aerolinea.nombre}</span>
          <span class="hora">$${v.precio.toLocaleString("es-MX")} MXN</span>
        </div>

        <div class="tarjeta-vuelo-horarios">
          <div>
            <span class="hora">${formatearHora(v.horaSalida)}</span>
            <span class="ciudad">${formatearFecha(v.horaSalida)}</span>
          </div>
          <div>
            <span class="hora">${formatearHora(v.horaLlegada)}</span>
            <span class="ciudad">${formatearFecha(v.horaLlegada)}</span>
          </div>
        </div>

        <button class="boton boton-principal tarjeta-vuelo-boton" data-id="${v._id}" ${noDisponible ? "disabled" : ""}>Reservar</button>
      </div>
    `;

    rejillaVuelos.appendChild(tarjeta);
  });
}

rejillaVuelos.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-id]");
  if (!boton || boton.disabled) return;
  const vuelo = vuelos.find(v => v._id === boton.dataset.id);
  if (vuelo) abrirModal(vuelo);
});

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
    fila.className = "fila-clicable";
    fila.dataset.id = r._id;
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

cuerpoTablaReservas.addEventListener("click", (e) => {
  const fila = e.target.closest("tr[data-id]");
  if (!fila) return;
  const reserva = misReservas.find(r => r._id === fila.dataset.id);
  if (reserva) abrirModalDetalle(reserva);
});

// ===== Configuración del mapa de asientos =====
const COLUMNAS = ["A", "B", "C", "D", "E", "F"];
const FILAS_TOTALES = 30;

function categoriaDeFila(fila) {
  if (fila <= 2) return "primera";
  if (fila <= 6) return "ejecutiva";
  return "economica";
}

function generarAsientos() {
  const asientos = [];
  for (let fila = 1; fila <= FILAS_TOTALES; fila++) {
    COLUMNAS.forEach(col => {
      asientos.push({ id: `${fila}${col}`, fila, columna: col, categoria: categoriaDeFila(fila) });
    });
  }
  return asientos;
}
const TODOS_LOS_ASIENTOS = generarAsientos();

let asientosOcupados = new Set();
let asientoElegido = null;

// ===== Referencias nuevas del DOM =====
const claseOpcionesBtns  = document.querySelectorAll("#claseOpciones .clase-opcion");
const mapaFilas          = document.getElementById("mapaFilas");
const textoAsientoElegido = document.getElementById("textoAsientoElegido");
const metodoPagoBtns     = document.querySelectorAll("#metodoPagoOpciones .metodo-pago-opcion");
const panelTarjeta       = document.getElementById("panelTarjeta");
const panelOxxo          = document.getElementById("panelOxxo");
const panelPaypal        = document.getElementById("panelPaypal");
const campoNumTarjeta    = document.getElementById("campoNumTarjeta");
const campoNombreTarjeta = document.getElementById("campoNombreTarjeta");
const campoVigencia      = document.getElementById("campoVigencia");
const campoCVV           = document.getElementById("campoCVV");
const resumenReserva     = document.getElementById("resumenReserva");
let metodoPagoElegido = "tarjeta";

// ===== Selección de clase =====
claseOpcionesBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    claseOpcionesBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    campoClase.value = btn.dataset.clase;
    asientoElegido = null;
    campoAsiento.value = "";
    renderMapaAsientos();
    actualizarResumen();
  });
});

// ===== Selección de método de pago =====
metodoPagoBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    metodoPagoBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    metodoPagoElegido = btn.dataset.metodo;

    panelTarjeta.classList.add("oculto");
    panelOxxo.classList.add("oculto");
    panelPaypal.classList.add("oculto");

    if (metodoPagoElegido === "tarjeta") panelTarjeta.classList.remove("oculto");
    if (metodoPagoElegido === "oxxo") panelOxxo.classList.remove("oculto");
    if (metodoPagoElegido === "paypal") panelPaypal.classList.remove("oculto");
  });
});

// ===== Formateo amigable de campos de tarjeta =====
campoNumTarjeta.addEventListener("input", () => {
  campoNumTarjeta.value = campoNumTarjeta.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
});
campoVigencia.addEventListener("input", () => {
  let v = campoVigencia.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  campoVigencia.value = v;
});
campoCVV.addEventListener("input", () => {
  campoCVV.value = campoCVV.value.replace(/\D/g, "").slice(0, 4);
});

// ===== Pintar mapa de asientos =====
function renderMapaAsientos() {
  mapaFilas.innerHTML = "";

  for (let fila = 1; fila <= FILAS_TOTALES; fila++) {
    const filaEl = document.createElement("div");
    filaEl.className = "mapa-fila";

    COLUMNAS.forEach((col, idx) => {
      const idAsiento = `${fila}${col}`;
      const categoria = categoriaDeFila(fila);
      const ocupado = asientosOcupados.has(idAsiento);
      const deshabilitado = categoria !== campoClase.value;

      const btnAsiento = document.createElement("button");
      btnAsiento.type = "button";
      btnAsiento.className = "asiento";
      btnAsiento.textContent = col;
      btnAsiento.title = idAsiento;

      if (ocupado) btnAsiento.classList.add("asiento-ocupado");
      else if (deshabilitado) btnAsiento.classList.add("asiento-deshabilitado");
      else btnAsiento.classList.add("asiento-disponible");

      if (asientoElegido === idAsiento) btnAsiento.classList.add("asiento-seleccionado");

      btnAsiento.disabled = ocupado || deshabilitado;

      btnAsiento.addEventListener("click", () => {
        asientoElegido = idAsiento;
        campoAsiento.value = idAsiento;
        renderMapaAsientos();
        actualizarResumen();
      });

      filaEl.appendChild(btnAsiento);
      if (idx === 2) {
        const pasillo = document.createElement("span");
        pasillo.className = "mapa-pasillo";
        filaEl.appendChild(pasillo);
      }
    });

    mapaFilas.appendChild(filaEl);
  }

  textoAsientoElegido.textContent = asientoElegido
    ? `Asiento seleccionado: ${asientoElegido}`
    : "Ningún asiento seleccionado";
}

function actualizarResumen() {
  if (!vueloSeleccionado) return;
  resumenReserva.innerHTML = `
    <div class="resumen-linea"><span>Vuelo</span><strong>${vueloSeleccionado.numeroVuelo}</strong></div>
    <div class="resumen-linea"><span>Clase</span><strong>${nombresClase[campoClase.value]}</strong></div>
    <div class="resumen-linea"><span>Asiento</span><strong>${asientoElegido || "—"}</strong></div>
    <div class="resumen-linea resumen-total"><span>Total</span><strong>$${vueloSeleccionado.precio.toLocaleString("es-MX")} MXN</strong></div>
  `;
}

// ===== Modal de reserva =====
function abrirModal(vuelo) {
  vueloSeleccionado = vuelo;
  errorFormulario.classList.add("oculto");
  formularioReserva.reset();

  asientoElegido = null;
  campoClase.value = "economica";
  claseOpcionesBtns.forEach(b => b.classList.toggle("activo", b.dataset.clase === "economica"));

  metodoPagoElegido = "tarjeta";
  metodoPagoBtns.forEach(b => b.classList.toggle("activo", b.dataset.metodo === "tarjeta"));
  panelTarjeta.classList.remove("oculto");
  panelOxxo.classList.add("oculto");
  panelPaypal.classList.add("oculto");

  asientosOcupados = new Set(
    todasLasReservas
      .filter(r => String(r.vuelo.id) === String(vuelo._id))
      .map(r => r.asiento.toUpperCase())
  );

  renderMapaAsientos();
  actualizarResumen();
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

// ===== Validación del método de pago =====
function validarPago() {
  if (metodoPagoElegido === "tarjeta") {
    const numero = campoNumTarjeta.value.replace(/\s/g, "");
    if (numero.length !== 16) return "El número de tarjeta debe tener 16 dígitos.";
    if (!campoNombreTarjeta.value.trim()) return "Ingresa el nombre del titular.";
    if (!/^\d{2}\/\d{2}$/.test(campoVigencia.value)) return "La vigencia debe tener el formato MM/AA.";
    const [mes] = campoVigencia.value.split("/");
    if (Number(mes) < 1 || Number(mes) > 12) return "El mes de vigencia no es válido.";
    if (!/^\d{3,4}$/.test(campoCVV.value)) return "El CVV debe tener 3 o 4 dígitos.";
  }
  return null;
}

// ===== Confirmar reserva (con validaciones) =====
formularioReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!pasajeroActual) {
    return mostrarError("No se encontró tu perfil de pasajero. Vuelve a iniciar sesión.");
  }

  if (!asientoElegido) {
    return mostrarError("Selecciona un asiento en el mapa.");
  }

  const asiento = asientoElegido;
  const clase = campoClase.value;

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

  const errorPago = validarPago();
  if (errorPago) return mostrarError(errorPago);

  const btnPagar = document.getElementById("btnConfirmarPago");
  btnPagar.disabled = true;
  btnPagar.textContent = "Procesando pago...";

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

    const referencia = "SKY-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    alert(`✅ Pago aprobado.\nReferencia: ${referencia}\nAsiento: ${asiento} — ${nombresClase[clase]}`);

  } catch (error) {
    mostrarError(error.message);
  } finally {
    btnPagar.disabled = false;
    btnPagar.textContent = "Pagar y confirmar";
  }
});

// ===== Eventos del modal =====
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

  if (pasajeroIdGuardado) {
    try {
      const todos = await obtenerPasajeros();
      pasajeroActual = todos.find(p => p._id === pasajeroIdGuardado) || null;
    } catch (error) {
      console.error("No se pudo cargar el pasajero vinculado:", error.message);
    }
  }

  await cargarAeropuertos();
  await cargarVuelos();
  if (pasajeroActual) await cargarMisReservas();
})();

// ===== Modal de detalle de reserva =====
function abrirModalDetalle(reserva) {
  reservaDetalleActual = reserva;

  if (reserva.registrado) {
    btnVerBoleto.classList.remove("oculto");
  } else {
    btnVerBoleto.classList.add("oculto");
  }

  const vuelo = vuelos.find(v => v._id === reserva.vuelo.id) || reserva.vuelo;

  const imagenDestino = vuelo.destino?.imagenUrl || vuelo.origen?.imagenUrl || IMAGEN_RESPALDO;
  document.getElementById("detalleImagen").style.backgroundImage = `url('${imagenDestino}')`;

  document.getElementById("detalleEstadoVuelo").textContent = reserva.vuelo.estado || "programado";

  document.getElementById("detalleEstadoVuelo").textContent = reserva.vuelo.estado || "programado";
  document.getElementById("detalleEstadoVuelo").className = `etiqueta-estado estado-${reserva.vuelo.estado || "programado"}`;

  document.getElementById("detalleEstadoCheckin").textContent = reserva.registrado ? "Registrado" : "Pendiente de check-in";
  document.getElementById("detalleEstadoCheckin").className = `etiqueta-estado ${reserva.registrado ? "estado-abordando" : "estado-retrasado"}`;

  document.getElementById("detalleOrigenCodigo").textContent = vuelo.origen?.codigoIata || "";
  document.getElementById("detalleOrigenCiudad").textContent = vuelo.origen?.ciudad || "";
  document.getElementById("detalleOrigenHora").textContent = formatearHora(reserva.vuelo.horaSalida);

  document.getElementById("detalleDestinoCodigo").textContent = vuelo.destino?.codigoIata || "";
  document.getElementById("detalleDestinoCiudad").textContent = vuelo.destino?.ciudad || "";
  document.getElementById("detalleDestinoHora").textContent = formatearHora(reserva.vuelo.horaLlegada || reserva.vuelo.horaSalida);

  document.getElementById("detalleNumeroVuelo").textContent = reserva.vuelo.numeroVuelo;
  document.getElementById("detalleAerolinea").textContent = vuelo.aerolinea?.nombre || "—";
  document.getElementById("detalleFecha").textContent = formatearFecha(reserva.vuelo.horaSalida);
  document.getElementById("detalleAsiento").textContent = reserva.asiento;
  document.getElementById("detalleClase").textContent = nombresClase[reserva.clase];
  document.getElementById("detallePasajero").textContent = reserva.pasajero.nombreCompleto || `${pasajeroActual?.nombre || ""} ${pasajeroActual?.apellido || ""}`;
  document.getElementById("detalleDocumento").textContent = reserva.pasajero.documento || pasajeroActual?.documento || "—";
  document.getElementById("detallePrecio").textContent = vuelo.precio ? `$${vuelo.precio.toLocaleString("es-MX")} MXN` : "—";
  document.getElementById("detalleCodigoReserva").textContent = `Código de reserva: ${reserva._id}`;

  fondoModalDetalle.classList.remove("oculto");
}

function cerrarModalDetalle() {
  fondoModalDetalle.classList.add("oculto");
}

btnCerrarDetalle.addEventListener("click", cerrarModalDetalle);
btnCerrarDetalle2.addEventListener("click", cerrarModalDetalle);
fondoModalDetalle.addEventListener("click", e => {
  if (e.target === fondoModalDetalle) cerrarModalDetalle();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModalDetalle.classList.contains("oculto")) cerrarModalDetalle();
});

// ===== Modal del boleto (pasajero) =====
function abrirModalBoleto(reserva) {
  const vuelo = vuelos.find(v => v._id === reserva.vuelo.id);

  document.getElementById("boletoCodigo").textContent = reserva.codigoBoleto || "—";
  document.getElementById("boletoOrigen").textContent = vuelo?.origen?.codigoIata || "—";
  document.getElementById("boletoOrigenCiudad").textContent = vuelo?.origen?.ciudad || "";
  document.getElementById("boletoDestino").textContent = vuelo?.destino?.codigoIata || "—";
  document.getElementById("boletoDestinoCiudad").textContent = vuelo?.destino?.ciudad || "";
  document.getElementById("boletoPasajero").textContent = reserva.pasajero.nombreCompleto || `${pasajeroActual?.nombre || ""} ${pasajeroActual?.apellido || ""}`;
  document.getElementById("boletoVuelo").textContent = reserva.vuelo.numeroVuelo;
  document.getElementById("boletoFecha").textContent = formatearFecha(reserva.vuelo.horaSalida);
  document.getElementById("boletoHora").textContent = formatearHora(reserva.vuelo.horaSalida);
  document.getElementById("boletoAsiento").textContent = reserva.asiento;
  document.getElementById("boletoClase").textContent = nombresClase[reserva.clase];
  document.getElementById("boletoPuerta").textContent = reserva.puertaEmbarque || "Por asignar";
  document.getElementById("boletoEquipajeMano").textContent = reserva.equipaje?.equipajeMano ? "Sí" : "No";

  const maletas = reserva.equipaje?.maletasDocumentadas || [];
  document.getElementById("boletoMaletas").innerHTML = maletas.length
    ? `<strong>Maletas documentadas:</strong> ` + maletas.map(m => `#${m.numero} (${m.pesoKg} kg)`).join(" · ")
    : `<strong>Maletas documentadas:</strong> Ninguna`;

  fondoModalBoleto.classList.remove("oculto");
}

function cerrarModalBoleto() {
  fondoModalBoleto.classList.add("oculto");
}

btnVerBoleto.addEventListener("click", () => {
  if (reservaDetalleActual) abrirModalBoleto(reservaDetalleActual);
});
btnCerrarBoleto.addEventListener("click", cerrarModalBoleto);
btnCerrarBoleto2.addEventListener("click", cerrarModalBoleto);
fondoModalBoleto.addEventListener("click", e => {
  if (e.target === fondoModalBoleto) cerrarModalBoleto();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModalBoleto.classList.contains("oculto")) cerrarModalBoleto();
});