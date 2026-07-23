// ===== Datos de prueba =====
const aerolineas = [
  { _id: "a1", nombre: "Aeroméxico",        codigoIata: "AM", pais: "México" },
  { _id: "a2", nombre: "Volaris",           codigoIata: "Y4", pais: "México" },
  { _id: "a3", nombre: "Viva Aerobus",      codigoIata: "VB", pais: "México" },
  { _id: "a4", nombre: "American Airlines", codigoIata: "AA", pais: "Estados Unidos" },
  { _id: "a5", nombre: "Copa Airlines",     codigoIata: "CM", pais: "Panamá" }
];

const aeropuertos = [
  { _id: "p1", nombre: "Aeropuerto Internacional de Guadalajara",     codigoIata: "GDL", ciudad: "Guadalajara",      pais: "México",         terminales: 2 },
  { _id: "p2", nombre: "Aeropuerto Internacional Benito Juárez",      codigoIata: "MEX", ciudad: "Ciudad de México", pais: "México",         terminales: 2 },
  { _id: "p3", nombre: "Aeropuerto Internacional de Cancún",          codigoIata: "CUN", ciudad: "Cancún",           pais: "México",         terminales: 4 },
  { _id: "p4", nombre: "Aeropuerto Internacional de Monterrey",       codigoIata: "MTY", ciudad: "Monterrey",        pais: "México",         terminales: 2 },
  { _id: "p5", nombre: "Aeropuerto Internacional de Tijuana",         codigoIata: "TIJ", ciudad: "Tijuana",          pais: "México",         terminales: 1 },
  { _id: "p6", nombre: "Aeropuerto Internacional de Puerto Vallarta", codigoIata: "PVR", ciudad: "Puerto Vallarta",  pais: "México",         terminales: 1 },
  { _id: "p7", nombre: "Aeropuerto Internacional de Tepic",           codigoIata: "TPQ", ciudad: "Tepic",            pais: "México",         terminales: 1 },
  { _id: "p8", nombre: "Los Angeles International Airport",           codigoIata: "LAX", ciudad: "Los Ángeles",      pais: "Estados Unidos", terminales: 9 }
];

const puertas = [
  { _id: "g1", numero: "A1",  terminal: "T1", aeropuerto: { codigoIata: "GDL" }, estado: "disponible" },
  { _id: "g2", numero: "A2",  terminal: "T1", aeropuerto: { codigoIata: "GDL" }, estado: "ocupada" },
  { _id: "g3", numero: "B5",  terminal: "T2", aeropuerto: { codigoIata: "GDL" }, estado: "mantenimiento" },
  { _id: "g4", numero: "C12", terminal: "T2", aeropuerto: { codigoIata: "MEX" }, estado: "disponible" },
  { _id: "g5", numero: "D3",  terminal: "T1", aeropuerto: { codigoIata: "MEX" }, estado: "ocupada" },
  { _id: "g6", numero: "E8",  terminal: "T3", aeropuerto: { codigoIata: "CUN" }, estado: "disponible" },
  { _id: "g7", numero: "F1",  terminal: "T1", aeropuerto: { codigoIata: "MTY" }, estado: "disponible" }
];

// ===== Configuración por catálogo =====
const catalogos = {
  aerolineas: {
    datos: aerolineas,
    singular: "aerolínea",
    columnas: ["Nombre", "Código IATA", "País"],
    campoNombre: r => r.nombre,
    buscarEn: r => `${r.nombre} ${r.codigoIata} ${r.pais}`,
    celdas: r => `
      <td>${r.nombre}</td>
      <td><span class="codigo-iata">${r.codigoIata}</span></td>
      <td>${r.pais}</td>
    `
  },
  aeropuertos: {
    datos: aeropuertos,
    singular: "aeropuerto",
    columnas: ["Nombre", "Código IATA", "Ciudad", "País", "Terminales"],
    campoNombre: r => r.nombre,
    buscarEn: r => `${r.nombre} ${r.codigoIata} ${r.ciudad} ${r.pais}`,
    celdas: r => `
      <td>${r.nombre}</td>
      <td><span class="codigo-iata">${r.codigoIata}</span></td>
      <td>${r.ciudad}</td>
      <td>${r.pais}</td>
      <td>${r.terminales}</td>
    `
  },
  puertas: {
    datos: puertas,
    singular: "puerta",
    columnas: ["Número", "Terminal", "Aeropuerto", "Estado"],
    campoNombre: r => `${r.numero} (${r.aeropuerto.codigoIata})`,
    buscarEn: r => `${r.numero} ${r.terminal} ${r.aeropuerto.codigoIata} ${r.estado}`,
    celdas: r => `
      <td><span class="codigo-iata">${r.numero}</span></td>
      <td>${r.terminal}</td>
      <td><span class="codigo-iata">${r.aeropuerto.codigoIata}</span></td>
      <td><span class="etiqueta-estado puerta-${r.estado}">${r.estado}</span></td>
    `
  }
};

// ===== Referencias del DOM =====
const encabezadoTabla = document.getElementById("encabezadoTabla");
const cuerpoTabla     = document.getElementById("cuerpoTablaCatalogo");
const mensajeVacio    = document.getElementById("mensajeVacio");
const filtroBusqueda  = document.getElementById("filtroBusqueda");
const btnLimpiar      = document.getElementById("btnLimpiar");
const btnNuevo        = document.getElementById("btnNuevo");
const pestanas        = document.querySelectorAll(".pestana");

let catalogoActual = "aerolineas";

// ===== Pintar encabezado =====
function renderEncabezado() {
  const cfg = catalogos[catalogoActual];
  encabezadoTabla.innerHTML = `
    <tr>
      ${cfg.columnas.map(c => `<th>${c}</th>`).join("")}
      <th class="columna-acciones">Acciones</th>
    </tr>
  `;
}

// ===== Pintar tabla =====
function renderTabla(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    mensajeVacio.classList.remove("oculto");
    return;
  }
  mensajeVacio.classList.add("oculto");

  const cfg = catalogos[catalogoActual];

  lista.forEach(r => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      ${cfg.celdas(r)}
      <td class="columna-acciones">
        <button class="boton-icono" data-accion="editar" data-id="${r._id}">Editar</button>
        <button class="boton-icono peligro" data-accion="eliminar" data-id="${r._id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// ===== Filtro =====
function aplicarFiltro() {
  const cfg   = catalogos[catalogoActual];
  const texto = filtroBusqueda.value.trim().toUpperCase();

  const filtrados = cfg.datos.filter(r =>
    !texto || cfg.buscarEn(r).toUpperCase().includes(texto)
  );

  renderTabla(filtrados);
}

// ===== Cambiar pestaña =====
function cambiarCatalogo(e) {
  const boton = e.currentTarget;
  catalogoActual = boton.dataset.catalogo;

  pestanas.forEach(p => p.classList.remove("activa"));
  boton.classList.add("activa");

  filtroBusqueda.value = "";
  renderEncabezado();
  renderTabla(catalogos[catalogoActual].datos);
}

// ===== Acciones de fila =====
function manejarAccion(e) {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const cfg      = catalogos[catalogoActual];
  const id       = boton.dataset.id;
  const registro = cfg.datos.find(r => r._id === id);

  if (boton.dataset.accion === "editar") {
    alert(`Editar ${cfg.singular}: ${cfg.campoNombre(registro)}\n(Aquí abrirá el formulario)`);
  }

  if (boton.dataset.accion === "eliminar") {
    if (confirm(`¿Eliminar ${cfg.singular} ${cfg.campoNombre(registro)}?`)) {
      cfg.datos.splice(cfg.datos.findIndex(r => r._id === id), 1);
      aplicarFiltro();
    }
  }
}

// ===== Eventos =====
pestanas.forEach(p => p.addEventListener("click", cambiarCatalogo));
filtroBusqueda.addEventListener("input", aplicarFiltro);

btnLimpiar.addEventListener("click", () => {
  filtroBusqueda.value = "";
  renderTabla(catalogos[catalogoActual].datos);
});

cuerpoTabla.addEventListener("click", manejarAccion);

btnNuevo.addEventListener("click", () => {
  alert(`Aquí abrirá el formulario de nueva ${catalogos[catalogoActual].singular}`);
});

// ===== Inicio =====
renderEncabezado();
renderTabla(aerolineas);