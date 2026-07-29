// ===== Referencias del buscador =====
const tipoBtns        = document.querySelectorAll(".tipo-btn");
const grupoOrigen      = document.getElementById("grupoOrigen");
const grupoDestino     = document.getElementById("grupoDestino");
const filtroOrigen     = document.getElementById("filtroOrigen");
const filtroDestino    = document.getElementById("filtroDestino");
const sugerenciasOrigen  = document.getElementById("sugerenciasOrigen");
const sugerenciasDestino = document.getElementById("sugerenciasDestino");
const btnIntercambiar  = document.getElementById("btnIntercambiar");
const filtroSalida     = document.getElementById("filtroSalida");
const grupoRegreso     = document.getElementById("grupoRegreso");
const filtroRegreso    = document.getElementById("filtroRegreso");
const btnPasajeros     = document.getElementById("btnPasajeros");
const popoverPasajeros = document.getElementById("popoverPasajeros");
const numeroPasajeros  = document.getElementById("numeroPasajeros");
const textoPasajeros   = document.getElementById("textoPasajeros");
const btnMenosPasajeros = document.getElementById("btnMenosPasajeros");
const btnMasPasajeros   = document.getElementById("btnMasPasajeros");
const btnBuscarVuelos  = document.getElementById("btnBuscarVuelos");

let aeropuertos = [];
let tipoViaje = "redondo";
let cantidadPasajeros = 1;
let origenSeleccionado = null;  // { codigoIata, ciudad }
let destinoSeleccionado = null;

const IMAGEN_RESPALDO = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=60";

// ===== Tipo de viaje =====
tipoBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tipoBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    tipoViaje = btn.dataset.tipo;
    grupoRegreso.style.display = tipoViaje === "sencillo" ? "none" : "flex";
  });
});

// ===== Pasajeros =====
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