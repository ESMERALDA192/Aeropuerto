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

// ===== Modal de reserva =====
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

// ===== Confirmar reserva (con validaciones) =====
formularioReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!pasajeroActual) {
    return mostrarError("No se encontró tu perfil de pasajero. Vuelve a iniciar sesión.");
  }

  const asiento = campoAsiento.value.trim().toUpperCase();
  const clase = campoClase.value;

  if (!asiento) return mostrarError("El asiento es obligatorio.");

  if (!/^\d{1,2}[A-F]$/.test(asiento)) {
    return mostrarError("Formato de asiento inválido. Usa por ejemplo 12A.");
  }

  // Validar que el asiento no esté ocupado por OTRO pasajero en ese vuelo
  const asientoOcupado = todasLasReservas.find(r =>
    String(r.vuelo.id) === String(vueloSeleccionado._id) &&
    r.asiento.toUpperCase() === asiento
  );
  if (asientoOcupado) {
    return mostrarError(`El asiento ${asiento} ya está ocupado en este vuelo. Elige otro.`);
  }

  // Validar si YO ya reservé este vuelo
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