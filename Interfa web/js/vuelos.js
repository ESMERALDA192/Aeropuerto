// ===== Seguridad de sesión =====
const tokenSesion = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!tokenSesion) {
  window.location.href = "login.html";
}

// ===== Estado =====
let vuelos = [];
let listaAerolineas = [];
let listaAeropuertos = [];
let idEditando = null;


// ===== Referencias del DOM =====
const cuerpoTabla    = document.getElementById("cuerpoTablaVuelos");
const mensajeVacio   = document.getElementById("mensajeVacio");

const filtroEstado   = document.getElementById("filtroEstado");
const filtroOrigen   = document.getElementById("filtroOrigen");
const filtroDestino  = document.getElementById("filtroDestino");
const filtroFecha    = document.getElementById("filtroFecha");

const btnLimpiar     = document.getElementById("btnLimpiar");
const btnNuevo       = document.getElementById("btnNuevo");

const usuarioSesion  = document.getElementById("usuarioSesion");
const btnSalir       = document.getElementById("btnSalir");


// ===== Modal =====
const fondoModal       = document.getElementById("fondoModal");
const formularioVuelo  = document.getElementById("formularioVuelo");

const tituloModal      = document.getElementById("tituloModal");
const errorFormulario  = document.getElementById("errorFormulario");

const btnCerrar        = document.getElementById("btnCerrar");
const btnCancelar      = document.getElementById("btnCancelar");

const campoNumero      = document.getElementById("campoNumero");
const campoAerolinea   = document.getElementById("campoAerolinea");
const campoOrigen      = document.getElementById("campoOrigen");
const campoDestino     = document.getElementById("campoDestino");
const campoSalida      = document.getElementById("campoSalida");
const campoLlegada     = document.getElementById("campoLlegada");
const campoEstado      = document.getElementById("campoEstado");
const campoPrecio    = document.getElementById("campoPrecio");


const IMAGEN_RESPALDO = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=60";

const fondoModalDetalle       = document.getElementById("fondoModalDetalle");
const btnCerrarDetalle        = document.getElementById("btnCerrarDetalle");
const btnCerrarDetalle2       = document.getElementById("btnCerrarDetalle2");
const btnEditarDesdeDetalle   = document.getElementById("btnEditarDesdeDetalle");

let vueloDetalleActual = null;

// ===== Usuario =====
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


// ===== Formato de fechas =====
function formatearHora(iso) {
  const fecha = new Date(iso);

  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}


function formatearFecha(iso) {
  const fecha = new Date(iso);

  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short"
  });
}


function soloFecha(iso) {
  return iso.substring(0,10);
}


// ===== Cargar vuelos =====
async function cargarVuelos() {

  try {

    vuelos = await obtenerVuelos();

    aplicarFiltros();

  } catch(error) {

    cuerpoTabla.innerHTML = "";

    mensajeVacio.classList.remove("oculto");

    mensajeVacio.textContent =
      "Error al cargar vuelos: " + error.message;
  }
}


// ===== Cargar datos para selects =====
async function cargarCatalogos() {

  try {

    listaAerolineas = await obtenerAerolineas();

    listaAeropuertos = await obtenerAeropuertos();

    llenarSelects();


  } catch(error) {

    console.error(
      "Error cargando catálogos:",
      error.message
    );

  }

}
// ===== Pintar tabla =====
function renderTabla(lista) {

  cuerpoTabla.innerHTML = "";


  if (lista.length === 0) {

    mensajeVacio.classList.remove("oculto");

    mensajeVacio.textContent =
      "No hay vuelos que coincidan con los filtros.";

    return;
  }


  mensajeVacio.classList.add("oculto");


  lista.forEach(v => {

    const fila = document.createElement("tr");
    fila.className = "fila-clicable";
    fila.dataset.id = v._id;


    fila.innerHTML = `

      <td>
        <span class="numero-vuelo">
          ${v.numeroVuelo}
        </span>
      </td>


      <td>
        ${v.aerolinea.nombre}
        <span class="ciudad">
          ${v.aerolinea.codigoIata}
        </span>
      </td>


      <td>
        <span class="codigo-iata">
          ${v.origen.codigoIata}
        </span>

        <span class="ciudad">
          ${v.origen.ciudad}
        </span>
      </td>


      <td>
        <span class="codigo-iata">
          ${v.destino.codigoIata}
        </span>

        <span class="ciudad">
          ${v.destino.ciudad}
        </span>
      </td>


      <td>
        <span class="hora">
          ${formatearHora(v.horaSalida)}
        </span>

        <span class="ciudad">
          ${formatearFecha(v.horaSalida)}
        </span>
      </td>


      <td>
        <span class="hora">
          ${formatearHora(v.horaLlegada)}
        </span>

        <span class="ciudad">
          ${formatearFecha(v.horaLlegada)}
        </span>
      </td>


      <td>
        <span class="etiqueta-estado estado-${v.estado}">
          ${v.estado}
        </span>
      </td>


      <td class="columna-acciones">

        <button
          class="boton-icono"
          data-accion="editar"
          data-id="${v._id}">
          Editar
        </button>


        <button
          class="boton-icono peligro"
          data-accion="eliminar"
          data-id="${v._id}">
          Eliminar
        </button>

      </td>

    `;


    cuerpoTabla.appendChild(fila);

  });

}



// ===== Filtros =====
function aplicarFiltros() {


  const estado =
    filtroEstado.value;


  const origen =
    filtroOrigen.value.trim().toUpperCase();


  const destino =
    filtroDestino.value.trim().toUpperCase();


  const fecha =
    filtroFecha.value;



  const filtrados =
    vuelos.filter(v => {


      if (estado && v.estado !== estado)
        return false;



      if (origen &&
        !(
          v.origen.codigoIata.includes(origen) ||
          v.origen.ciudad.toUpperCase().includes(origen)
        )
      )
        return false;



      if (destino &&
        !(
          v.destino.codigoIata.includes(destino) ||
          v.destino.ciudad.toUpperCase().includes(destino)
        )
      )
        return false;



      if (fecha &&
        soloFecha(v.horaSalida) !== fecha
      )
        return false;



      return true;

    });



  renderTabla(filtrados);

}




function limpiarFiltros() {

  filtroEstado.value = "";

  filtroOrigen.value = "";

  filtroDestino.value = "";

  filtroFecha.value = "";


  renderTabla(vuelos);

}




// ===== Llenar selects =====
function llenarSelects() {


  campoAerolinea.innerHTML =
    listaAerolineas.map(a => `

      <option value="${a._id}">
        ${a.nombre} (${a.codigoIata})
      </option>

    `).join("");



  const opciones =
    listaAeropuertos.map(a => `

      <option value="${a._id}">
        ${a.codigoIata} — ${a.ciudad}
      </option>

    `).join("");



  campoOrigen.innerHTML =
    opciones;


  campoDestino.innerHTML =
    opciones;

}



// ===== Abrir modal =====
function abrirModal(vuelo) {


  errorFormulario.classList.add("oculto");



  if (vuelo) {


    idEditando = vuelo._id;


    tituloModal.textContent =
      `Editar vuelo ${vuelo.numeroVuelo}`;



    campoNumero.value =
      vuelo.numeroVuelo;



    campoAerolinea.value =
      vuelo.aerolinea.id;



    campoOrigen.value =
      vuelo.origen.id;



    campoDestino.value =
      vuelo.destino.id;



    campoSalida.value =
      vuelo.horaSalida.slice(0,16);



    campoLlegada.value =
      vuelo.horaLlegada.slice(0,16);



    campoEstado.value =
      vuelo.estado;

    campoPrecio.value =      
    vuelo.precio;



  } else {


    idEditando = null;


    tituloModal.textContent =
      "Nuevo vuelo";



    formularioVuelo.reset();



    if(listaAerolineas[0])
      campoAerolinea.value =
        listaAerolineas[0]._id;



    if(listaAeropuertos[0])
      campoOrigen.value =
        listaAeropuertos[0]._id;



    if(listaAeropuertos[1])
      campoDestino.value =
        listaAeropuertos[1]._id;

    campoEstado.value =
      "programado";

  }



  fondoModal.classList.remove("oculto");


  campoNumero.focus();

}
// ===== Cerrar modal =====
function cerrarModal() {

  fondoModal.classList.add("oculto");

  idEditando = null;

}



// ===== Mostrar errores =====
function mostrarError(mensaje) {

  errorFormulario.textContent = mensaje;

  errorFormulario.classList.remove("oculto");

}



// ===== Guardar vuelo =====
async function guardar(evento) {

  evento.preventDefault();


  const numero =
    campoNumero.value.trim().toUpperCase();



  if (!numero)
    return mostrarError(
      "El número de vuelo es obligatorio."
    );



  if (!campoSalida.value)
    return mostrarError(
      "La hora de salida es obligatoria."
    );



  if (!campoLlegada.value)
    return mostrarError(
      "La hora de llegada es obligatoria."
    );



  if (campoOrigen.value === campoDestino.value)
    return mostrarError(
      "El origen y destino no pueden ser iguales."
    );



  if (
    new Date(campoLlegada.value) <=
    new Date(campoSalida.value)
  )
    return mostrarError(
      "La llegada debe ser posterior a la salida."
    );


    if (!campoPrecio.value || Number(campoPrecio.value) < 0)
      return mostrarError(
        "El precio es obligatorio y debe ser mayor o igual a 0."
      );


  const vuelo = {

    numeroVuelo: numero,

    aerolineaId:
      campoAerolinea.value,

    origenId:
      campoOrigen.value,

    destinoId:
      campoDestino.value,

    horaSalida:
      campoSalida.value,

    horaLlegada:
      campoLlegada.value,

     precio:                    
      campoPrecio.value,

    estado:
      campoEstado.value

  };



  try {


    if(idEditando){


      await actualizarVuelo(
        idEditando,
        vuelo
      );


    } else {


      await agregarVuelo(
        vuelo
      );


    }



    cerrarModal();


    await cargarVuelos();



  } catch(error){


    mostrarError(
      error.message
    );


  }

}



// ===== Acciones de tabla =====
async function manejarAccion(e){

  const boton =
    e.target.closest("[data-accion]");


  if (boton) {

    const id =
      boton.dataset.id;

    const accion =
      boton.dataset.accion;

    const vuelo =
      vuelos.find(v => v._id === id);


    if(accion === "editar"){
      abrirModal(vuelo);
    }


    if(accion === "eliminar"){

      if(confirm(
        `¿Eliminar el vuelo ${vuelo.numeroVuelo}?`
      )){

        try{
          await eliminarVuelo(id);
          await cargarVuelos();

        }catch(error){
          alert(
            "No se pudo eliminar: " +
            error.message
          );
        }
      }
    }

    return; // ya se manejó el clic en un botón, no seguir
  }


  // No fue un botón: revisar si el clic fue en la fila
  const fila = e.target.closest("tr[data-id]");

  if (fila) {
    const vuelo = vuelos.find(v => v._id === fila.dataset.id);
    if (vuelo) abrirModalDetalle(vuelo);
  }

}




// ===== Eventos =====

filtroEstado.addEventListener(
  "change",
  aplicarFiltros
);


filtroOrigen.addEventListener(
  "input",
  aplicarFiltros
);


filtroDestino.addEventListener(
  "input",
  aplicarFiltros
);


filtroFecha.addEventListener(
  "change",
  aplicarFiltros
);



btnLimpiar.addEventListener(
  "click",
  limpiarFiltros
);



cuerpoTabla.addEventListener(
  "click",
  manejarAccion
);



btnNuevo.addEventListener(
  "click",
  () => abrirModal(null)
);



btnCerrar.addEventListener(
  "click",
  cerrarModal
);



btnCancelar.addEventListener(
  "click",
  cerrarModal
);



formularioVuelo.addEventListener(
  "submit",
  guardar
);



fondoModal.addEventListener(
  "click",
  e => {

    if(e.target === fondoModal)
      cerrarModal();

  }
);



document.addEventListener(
  "keydown",
  e => {

    if(
      e.key === "Escape" &&
      !fondoModal.classList.contains("oculto")
    ){

      cerrarModal();

    }

  }
);

// ===== Modal de detalle de vuelo =====
function abrirModalDetalle(vuelo) {
  vueloDetalleActual = vuelo;

  const imagenFondo = vuelo.destino.imagenUrl || vuelo.origen.imagenUrl || IMAGEN_RESPALDO;
  document.getElementById("detalleImagen").style.backgroundImage = `url('${imagenFondo}')`;

  document.getElementById("detalleEstadoVuelo").textContent = vuelo.estado;
  document.getElementById("detalleEstadoVuelo").className = `etiqueta-estado estado-${vuelo.estado}`;

  document.getElementById("detalleOrigenCodigo").textContent = vuelo.origen.codigoIata;
  document.getElementById("detalleOrigenCiudad").textContent = vuelo.origen.ciudad;
  document.getElementById("detalleOrigenHora").textContent = formatearHora(vuelo.horaSalida);

  document.getElementById("detalleDestinoCodigo").textContent = vuelo.destino.codigoIata;
  document.getElementById("detalleDestinoCiudad").textContent = vuelo.destino.ciudad;
  document.getElementById("detalleDestinoHora").textContent = formatearHora(vuelo.horaLlegada);

  document.getElementById("detalleNumeroVuelo").textContent = vuelo.numeroVuelo;
  document.getElementById("detalleAerolinea").textContent = vuelo.aerolinea.nombre;
  document.getElementById("detalleFecha").textContent = formatearFecha(vuelo.horaSalida);
  document.getElementById("detallePrecio").textContent = vuelo.precio
    ? `$${vuelo.precio.toLocaleString("es-MX")} MXN`
    : "—";

  fondoModalDetalle.classList.remove("oculto");
}

function cerrarModalDetalle() {
  fondoModalDetalle.classList.add("oculto");
  vueloDetalleActual = null;
}

btnCerrarDetalle.addEventListener("click", cerrarModalDetalle);
btnCerrarDetalle2.addEventListener("click", cerrarModalDetalle);
fondoModalDetalle.addEventListener("click", e => {
  if (e.target === fondoModalDetalle) cerrarModalDetalle();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !fondoModalDetalle.classList.contains("oculto")) {
    cerrarModalDetalle();
  }
});

btnEditarDesdeDetalle.addEventListener("click", () => {
  cerrarModalDetalle();
  abrirModal(vueloDetalleActual);
});



// ===== Inicio =====

cargarCatalogos();

cargarVuelos();