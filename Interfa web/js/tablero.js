// ===== Estado =====
let vuelos = [];
let reservas = [];
let puertas = [];

// ===== Seguridad y sesión =====
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
  window.location.href = "login.html";
}

const usuarioSesion = document.getElementById("usuarioSesion");
const btnSalir = document.getElementById("btnSalir");

if (usuarioSesion) {
  usuarioSesion.textContent = localStorage.getItem("nombre") || rol || "";
}
if (btnSalir) {
  btnSalir.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}
// ===== Utilidades =====
function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short"
  });
}


// ===== Cargar datos del backend =====
async function cargarTablero() {
  try {

    [
      vuelos,
      reservas,
      puertas
    ] = await Promise.all([
      obtenerVuelos(),
      obtenerReservas(),
      obtenerPuertas()
    ]);


    renderTarjetas();
    renderEstados();
    renderAerolineas();
    renderSalidas();


  } catch(error) {

    console.error("Error cargando tablero:", error);

  }
}



// ===== Tarjetas superiores =====
function renderTarjetas() {


  const vuelosHoy = vuelos.length;


  const pasajerosHoy = reservas.length;


  const registrados = reservas.filter(
    r => r.registrado
  ).length;


  const puertasOcupadas = puertas.filter(
    p => p.estado === "ocupada"
  ).length;


  const retrasados = vuelos.filter(
    v => v.estado === "retrasado"
  ).length;


const tarjetas = [

    {
      etiqueta:"Total de vuelos",
      valor:vuelosHoy,
      detalle:`${retrasados} con retraso`
    },


    {
      etiqueta:"Reservas totales",
      valor:pasajerosHoy,
      detalle:`${registrados} con check-in`
    },


    {
      etiqueta:"Puertas ocupadas",
      valor:`${puertasOcupadas}/${puertas.length}`,
      detalle:"Estado actual"
    },


    {
      etiqueta:"Vuelos retrasados",
      valor:retrasados,
      detalle:"Requieren seguimiento",
      alerta:true
    }

  ];


  document.getElementById("rejillaTarjetas").innerHTML =
  tarjetas.map(t => `

    <article class="tarjeta ${t.alerta ? "tarjeta-alerta":""}">

      <p class="tarjeta-etiqueta">
        ${t.etiqueta}
      </p>

      <p class="tarjeta-valor">
        ${t.valor}
      </p>

      <p class="tarjeta-detalle">
        ${t.detalle}
      </p>

    </article>

  `).join("");

}



// ===== Estados de vuelos =====
function renderEstados(){


  const estados = {};

  vuelos.forEach(v => {

    estados[v.estado] =
    (estados[v.estado] || 0) + 1;

  });


  const datos = Object.keys(estados)
  .map(e => ({
    estado:e,
    cantidad:estados[e]
  }));


  renderBarras(
    "graficaEstados",
    datos,
    {
      etiqueta:d=>d.estado,
      valor:d=>d.cantidad,
      clase:d=>`barra-${d.estado}`
    }
  );

}



// ===== Reservas por aerolinea =====
function renderAerolineas(){


 let lista = {};


 reservas.forEach(r=>{


   const nombre =
   r.vuelo?.aerolinea?.nombre || "Sin aerolínea";


   lista[nombre] =
   (lista[nombre] || 0) + 1;


 });



 const datos = Object.keys(lista)
 .map(a=>({

    aerolinea:a,
    cantidad:lista[a]

 }));


 renderBarras(
   "graficaAerolineas",
   datos,
   {
     etiqueta:d=>d.aerolinea,
     valor:d=>d.cantidad
   }
 );

}



// ===== Barras =====
function renderBarras(id, datos, opciones){


 const max =
 Math.max(...datos.map(opciones.valor),1);


 document.getElementById(id).innerHTML =

 datos.map(d=>{


 const cantidad =
 opciones.valor(d);


 const ancho =
 (cantidad/max)*100;



 return `

 <div class="fila-barra">


 <span class="barra-etiqueta">
 ${opciones.etiqueta(d)}
 </span>


 <div class="barra-pista">

 <div 
 class="barra-relleno ${opciones.clase ? opciones.clase(d):""}"
 style="width:${ancho}%">
 </div>

 </div>


 <span class="barra-valor">
 ${cantidad}
 </span>


 </div>


 `;


 }).join("");

}




// ===== Próximas salidas =====
function renderSalidas(){


 const lista =
 vuelos
 .sort((a,b)=>
 new Date(a.horaSalida)-new Date(b.horaSalida)
 )
 .slice(0,5);



 document.getElementById("listaSalidas").innerHTML =


 lista.map(v=>`

 <div class="fila-salida">


 <div>
 <span class="numero-vuelo">
 ${v.numeroVuelo}
 </span>

 <span class="ciudad">
 ${v.aerolinea.nombre}
 </span>
 </div>



 <div>

 <span class="codigo-iata">
 ${v.destino.codigoIata}
 </span>

 <span class="ciudad">
 ${v.destino.ciudad}
 </span>

 </div>



 <div>

 <span class="hora">
 ${formatearHora(v.horaSalida)}
 </span>

 <span class="ciudad">
 ${formatearFecha(v.horaSalida)}
 </span>

 </div>



 <div>

 <span class="ciudad">
 Puerta
 </span>

 <span class="codigo-iata">
 ${v.puerta || "N/A"}
 </span>

 </div>



 <div>

 <span class="etiqueta-estado estado-${v.estado}">
 ${v.estado}
 </span>

 </div>


 </div>


 `).join("");

}



// ===== Inicio =====
cargarTablero();