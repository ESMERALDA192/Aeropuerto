// ===== CONTROL DE SESIÓN =====
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
  window.location.href = "login.html";
}


// ===== ESTADO =====
let empleados = [];


// ===== REFERENCIAS DOM =====
const cuerpoTabla = document.getElementById("cuerpoTablaEmpleados");
const mensajeVacio = document.getElementById("mensajeVacio");

const filtroNombre = document.getElementById("filtroNombre");
const filtroNumero = document.getElementById("filtroNumero");
const filtroPuesto = document.getElementById("filtroPuesto");
const filtroAerolinea = document.getElementById("filtroAerolinea");

const btnLimpiar = document.getElementById("btnLimpiar");
const btnNuevo = document.getElementById("btnNuevo");

const usuarioSesion = document.getElementById("usuarioSesion");
const btnSalir = document.getElementById("btnSalir");


// ===== NOMBRES DE PUESTO =====

const nombresPuesto = {

  piloto: "Piloto",
  copiloto: "Copiloto",
  sobrecargo: "Sobrecargo",
  personal_tierra: "Personal de tierra",
  seguridad: "Seguridad"

};


// ===== SESIÓN =====

if(usuarioSesion){

 usuarioSesion.textContent =
 localStorage.getItem("nombre") || rol || "";

}


if(btnSalir){

 btnSalir.addEventListener("click",()=>{

  localStorage.clear();
  window.location.href="login.html";

 });

}



// ===== CARGAR EMPLEADOS =====

async function cargarEmpleados(){

 try{

  empleados = await obtenerEmpleados();

  aplicarFiltros();


 }catch(error){

  cuerpoTabla.innerHTML="";

  mensajeVacio.classList.remove("oculto");

  mensajeVacio.textContent =
  "Error al cargar empleados: "+error.message;

 }

}



// ===== TABLA =====

function renderTabla(lista){

 cuerpoTabla.innerHTML="";


 if(lista.length===0){

  mensajeVacio.classList.remove("oculto");

  mensajeVacio.textContent =
  "No hay empleados registrados.";

  return;

 }


 mensajeVacio.classList.add("oculto");


 lista.forEach(e=>{


 const fila=document.createElement("tr");


 fila.innerHTML=`

 <td>
  <span class="codigo-iata">
   ${e.numeroEmpleado}
  </span>
 </td>


 <td>
  ${e.nombre}
 </td>


 <td>
  ${e.apellido}
 </td>


 <td>

  <span class="etiqueta-estado puesto-${e.puesto}">
   ${nombresPuesto[e.puesto] || e.puesto}
  </span>

 </td>


 <td>

 ${
  e.aerolinea
  ?
  e.aerolinea.nombre
  :
  '<span class="ciudad">Sin asignar</span>'
 }

 </td>


 <td class="columna-acciones">


 <button 
 class="boton-icono"
 data-accion="editar"
 data-id="${e._id}">
 Editar
 </button>


 <button 
 class="boton-icono peligro"
 data-accion="eliminar"
 data-id="${e._id}">
 Eliminar
 </button>


 </td>

 `;


 cuerpoTabla.appendChild(fila);


 });


}



// ===== FILTROS =====

function aplicarFiltros(){


 const nombre =
 filtroNombre.value.trim().toUpperCase();


 const numero =
 filtroNumero.value.trim().toUpperCase();


 const puesto =
 filtroPuesto.value;


 const aerolinea =
 filtroAerolinea.value;



 const filtrados =
 empleados.filter(e=>{


  if(nombre && 
  !`${e.nombre} ${e.apellido}`
  .toUpperCase()
  .includes(nombre))
  return false;



  if(numero &&
  !e.numeroEmpleado
  .toUpperCase()
  .includes(numero))
  return false;



  if(puesto &&
  e.puesto!==puesto)
  return false;



  if(aerolinea==="sin" && e.aerolinea)
  return false;



  if(aerolinea &&
     aerolinea!=="sin"){

      if(!e.aerolinea ||
      e.aerolinea.nombre!==aerolinea)
      return false;

  }



  return true;


 });


 renderTabla(filtrados);


}



function limpiarFiltros(){

 filtroNombre.value="";
 filtroNumero.value="";
 filtroPuesto.value="";
 filtroAerolinea.value="";

 renderTabla(empleados);

}



// ===== ACCIONES =====

async function manejarAccion(e){


 const boton =
 e.target.closest("[data-accion]");


 if(!boton)return;



 const id = boton.dataset.id;


 const empleado =
 empleados.find(e=>e._id===id);



 if(boton.dataset.accion==="editar"){


  alert(
   "Editar empleado: "+
   empleado.nombre+" "+
   empleado.apellido
  );


 }



 if(boton.dataset.accion==="eliminar"){


  if(confirm(
   `¿Eliminar empleado ${empleado.nombre}?`
  )){


   try{


    await eliminarEmpleado(id);


    await cargarEmpleados();



   }catch(error){


    alert(
    "No se pudo eliminar: "+
    error.message
    );


   }


  }


 }


}



// ===== EVENTOS =====

filtroNombre.addEventListener(
"input",
aplicarFiltros
);


filtroNumero.addEventListener(
"input",
aplicarFiltros
);


filtroPuesto.addEventListener(
"change",
aplicarFiltros
);


filtroAerolinea.addEventListener(
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


btnNuevo.addEventListener("click",()=>{

 alert("Aquí abrirá el formulario de nuevo empleado");

});



// ===== INICIO =====

cargarEmpleados();