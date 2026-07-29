// ===== Sesión =====
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
  window.location.href = "login.html";
}

// ===== Estado =====
let datosActuales = [];
let listaAeropuertos = [];
let catalogoActual = "aerolineas";


// ===== Configuración de cada catálogo =====
const config = {

  aerolineas: {
    singular: "aerolínea",
    columnas: ["Nombre", "Código IATA", "País"],

    nombre: r => r.nombre,

    buscar: r =>
      `${r.nombre} ${r.codigoIata} ${r.pais}`,

    celdas: r => `
      <td>${r.nombre}</td>
      <td><span class="codigo-iata">${r.codigoIata}</span></td>
      <td>${r.pais}</td>
    `,

    campos: [
      {
        id: "nombre",
        label: "Nombre",
        tipo: "text",
        completo: true
      },
      {
        id: "codigoIata",
        label: "Código IATA",
        tipo: "text"
      },
      {
        id: "pais",
        label: "País",
        tipo: "text"
      }
    ],

    aDatos: r => ({
      nombre: r.nombre,
      codigoIata: r.codigoIata,
      pais: r.pais
    })
  },


  aeropuertos: {

    singular: "aeropuerto",

    columnas: [
      "Nombre",
      "Código IATA",
      "Ciudad",
      "País",
      "Terminales",
      "Imagen"
    ],

    nombre: r => r.nombre,

    buscar: r =>
      `${r.nombre} ${r.codigoIata} ${r.ciudad} ${r.pais}`,

    celdas: r => `
      <td>${r.nombre}</td>
      <td><span class="codigo-iata">${r.codigoIata}</span></td>
      <td>${r.ciudad}</td>
      <td>${r.pais}</td>
      <td>${r.terminales}</td>
      <td>${r.imagenUrl ? '<span class="ciudad">✓ Con imagen</span>' : '<span class="ciudad">Sin imagen</span>'}</td>
    `,

    campos: [
      {
        id:"nombre",
        label:"Nombre",
        tipo:"text",
        completo:true
      },
      {
        id:"codigoIata",
        label:"Código IATA",
        tipo:"text"
      },
      {
        id:"ciudad",
        label:"Ciudad",
        tipo:"text"
      },
      {
        id:"pais",
        label:"País",
        tipo:"text"
      },
      {
        id:"terminales",
        label:"Terminales",
        tipo:"number"
      },
      {
        id:"imagenUrl",
        label:"URL de imagen",
        tipo:"text",
        completo:true
      }
    ],

    aDatos:r=>({
      nombre:r.nombre,
      codigoIata:r.codigoIata,
      ciudad:r.ciudad,
      pais:r.pais,
      terminales:Number(r.terminales),
      imagenUrl:r.imagenUrl || ""
    })
  },


  puertas: {

    singular:"puerta",

    columnas:[
      "Número",
      "Terminal",
      "Aeropuerto",
      "Estado"
    ],

    nombre:r =>
      `${r.numero} (${r.aeropuerto.codigoIata})`,

    buscar:r =>
      `${r.numero} ${r.terminal} ${r.aeropuerto.codigoIata} ${r.estado}`,

    celdas:r=>`
      <td>
        <span class="codigo-iata">${r.numero}</span>
      </td>

      <td>${r.terminal}</td>

      <td>
        <span class="codigo-iata">
          ${r.aeropuerto.codigoIata}
        </span>
      </td>

      <td>
        <span class="etiqueta-estado puerta-${r.estado}">
          ${r.estado}
        </span>
      </td>
    `,


    campos:[

      {
        id:"numero",
        label:"Número",
        tipo:"text"
      },

      {
        id:"terminal",
        label:"Terminal",
        tipo:"text"
      },

      {
        id:"aeropuertoId",
        label:"Aeropuerto",
        tipo:"select-aeropuerto",
        completo:true
      },

      {
        id:"estado",
        label:"Estado",
        tipo:"select",
        completo:true,

        opciones:[
          {
            valor:"disponible",
            texto:"Disponible"
          },
          {
            valor:"ocupada",
            texto:"Ocupada"
          },
          {
            valor:"mantenimiento",
            texto:"Mantenimiento"
          }
        ]
      }

    ],


    aDatos:r=>({

      numero:r.numero,

      terminal:r.terminal,

      aeropuertoId:r.aeropuertoId,

      estado:r.estado

    })

  }
  

};
// ===== Referencias del DOM =====

const encabezadoTabla = document.getElementById("encabezadoTabla");
const cuerpoTabla = document.getElementById("cuerpoTablaCatalogo");
const mensajeVacio = document.getElementById("mensajeVacio");

const filtroBusqueda = document.getElementById("filtroBusqueda");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnNuevo = document.getElementById("btnNuevo");

const pestanas = document.querySelectorAll(".pestana");

const usuarioSesion = document.getElementById("usuarioSesion");
const btnSalir = document.getElementById("btnSalir");


// ===== Modal =====

const fondoModal = document.getElementById("fondoModal");
const formularioCatalogo = document.getElementById("formularioCatalogo");

const tituloModal = document.getElementById("tituloModal");
const errorFormulario = document.getElementById("errorFormulario");

const camposFormulario = document.getElementById("camposFormulario");

const btnCerrar = document.getElementById("btnCerrar");
const btnCancelar = document.getElementById("btnCancelar");


let idEditando = null;



// ===== Sesión =====

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



// ===== Cargar información =====

async function cargarDatos() {

  try {


    switch (catalogoActual) {


      case "aerolineas":

        datosActuales = await obtenerAerolineas();

        break;



      case "aeropuertos":

        datosActuales = await obtenerAeropuertos();

        break;



      case "puertas":

        datosActuales = await obtenerPuertas();

        break;

    }


    aplicarFiltro();



  } catch(error) {


    cuerpoTabla.innerHTML = "";

    mensajeVacio.classList.remove("oculto");

    mensajeVacio.textContent =
      "Error al cargar: " + error.message;


  }

}



// ===== Cargar aeropuertos para puertas =====

async function cargarAeropuertos(){

  try {

    listaAeropuertos = await obtenerAeropuertos();

  } catch(error){

    console.error(
      "Error cargando aeropuertos:",
      error.message
    );

  }

}



// ===== Encabezado tabla =====

function renderEncabezado(){


  const cfg = config[catalogoActual];


  encabezadoTabla.innerHTML = `

    <tr>

      ${
        cfg.columnas
        .map(columna =>
          `<th>${columna}</th>`
        )
        .join("")
      }


      <th class="columna-acciones">
        Acciones
      </th>


    </tr>

  `;


}



// ===== Pintar tabla =====

function renderTabla(lista){


  cuerpoTabla.innerHTML = "";



  if(lista.length === 0){


    mensajeVacio.classList.remove("oculto");

    mensajeVacio.textContent =
      "No hay registros que coincidan con la búsqueda.";


    return;

  }



  mensajeVacio.classList.add("oculto");



  const cfg = config[catalogoActual];



  lista.forEach(registro=>{


    const fila =
      document.createElement("tr");



    fila.innerHTML = `


      ${cfg.celdas(registro)}


      <td class="columna-acciones">


        <button

          class="boton-icono"

          data-accion="editar"

          data-id="${registro._id}"

        >

          Editar

        </button>



        <button

          class="boton-icono peligro"

          data-accion="eliminar"

          data-id="${registro._id}"

        >

          Eliminar

        </button>


      </td>


    `;



    cuerpoTabla.appendChild(fila);



  });


}



// ===== Buscar =====

function aplicarFiltro(){


  const cfg = config[catalogoActual];


  const texto =
    filtroBusqueda.value
    .trim()
    .toUpperCase();



  const filtrados =
    datosActuales.filter(registro => {


      return (

        !texto ||

        cfg.buscar(registro)
        .toUpperCase()
        .includes(texto)

      );


    });



  renderTabla(filtrados);


}




// ===== Cambiar pestaña =====

function cambiarCatalogo(evento){


  const boton =
    evento.currentTarget;



  catalogoActual =
    boton.dataset.catalogo;



  pestanas.forEach(p => {

    p.classList.remove("activa");

  });



  boton.classList.add("activa");



  filtroBusqueda.value = "";



  renderEncabezado();


  cargarDatos();




}
// ===== Generar campos del formulario =====

function generarCampos(registro){

  const cfg = config[catalogoActual];


  camposFormulario.innerHTML =
    cfg.campos.map(campo=>{


      const valor =
        registro
        ? valorDeCampo(registro,campo.id)
        : "";


      const clase =
        campo.completo
        ? "campo campo-completo"
        : "campo";



      // Select normal

      if(campo.tipo==="select"){


        return `

        <div class="${clase}">

          <label>
            ${campo.label}
          </label>


          <select id="campo_${campo.id}">

          ${
            campo.opciones.map(opcion=>`

              <option

                value="${opcion.valor}"

                ${valor===opcion.valor ? "selected":""}

              >

                ${opcion.texto}

              </option>

            `).join("")
          }

          </select>


        </div>

        `;


      }




      // Select aeropuerto

      if(campo.tipo==="select-aeropuerto"){


        return `

        <div class="${clase}">


          <label>
            ${campo.label}
          </label>



          <select id="campo_${campo.id}">


          ${
            listaAeropuertos.map(a=>`

              <option

                value="${a._id}"

                ${valor===a._id ? "selected":""}

              >

              ${a.codigoIata} - ${a.ciudad}


              </option>


            `).join("")
          }


          </select>


        </div>

        `;

      }




      return `

      <div class="${clase}">

        <label>
          ${campo.label}
        </label>


        <input

          type="${campo.tipo}"

          id="campo_${campo.id}"

          value="${valor}"

        >

      </div>


      `;



    }).join("");

}



// ===== Obtener valor de campo =====

function valorDeCampo(registro,id){


  if(id==="aeropuertoId"){


    return registro.aeropuerto
    ? registro.aeropuerto._id
    : "";


  }


  return registro[id] ?? "";


}




// ===== Modal =====

function abrirModal(registro){


  errorFormulario.classList.add("oculto");


  generarCampos(registro);



  if(registro){


    idEditando = registro._id;


    tituloModal.textContent =
      `Editar ${config[catalogoActual].singular}`;


  }else{


    idEditando = null;


    tituloModal.textContent =
      `Nueva ${config[catalogoActual].singular}`;


  }



  fondoModal.classList.remove("oculto");


}




function cerrarModal(){


  fondoModal.classList.add("oculto");


  idEditando=null;


}




function mostrarError(mensaje){


  errorFormulario.textContent = mensaje;


  errorFormulario.classList.remove("oculto");


}





// ===== Guardar registro =====

async function guardar(evento){


  evento.preventDefault();


  const cfg=config[catalogoActual];


  const datos={};



  cfg.campos.forEach(campo=>{


    datos[campo.id] =
      document.getElementById(
        `campo_${campo.id}`
      ).value;


  });




  for(const campo of cfg.campos){


    if(!datos[campo.id]){


      mostrarError(
        `El campo ${campo.label} es obligatorio`
      );


      return;


    }

  }




  const cuerpo =
    cfg.aDatos(datos);



  try{


    if(idEditando){



      switch(catalogoActual){


        case "aerolineas":

          await actualizarAerolinea(
            idEditando,
            cuerpo
          );

        break;



        case "aeropuertos":

          await actualizarAeropuerto(
            idEditando,
            cuerpo
          );

        break;



        case "puertas":

          await actualizarPuerta(
            idEditando,
            cuerpo
          );

        break;


      }



    }else{



      switch(catalogoActual){


        case "aerolineas":

          await agregarAerolinea(cuerpo);

        break;



        case "aeropuertos":

          await agregarAeropuerto(cuerpo);

        break;



        case "puertas":

          await agregarPuerta(cuerpo);

        break;


      }



    }



    cerrarModal();


    await cargarDatos();



  }catch(error){


    mostrarError(error.message);


  }


}





// ===== Editar / eliminar =====

async function manejarAccion(evento){


  const boton =
    evento.target.closest("[data-accion]");


  if(!boton) return;



  const id =
    boton.dataset.id;



  const registro =
    datosActuales.find(
      r=>r._id===id
    );



  if(boton.dataset.accion==="editar"){


    abrirModal(registro);


  }




  if(boton.dataset.accion==="eliminar"){



    if(confirm(
      `¿Eliminar ${config[catalogoActual].singular}?`
    )){


      try{


        switch(catalogoActual){


          case "aerolineas":

            await eliminarAerolinea(id);

          break;



          case "aeropuertos":

            await eliminarAeropuerto(id);

          break;



          case "puertas":

            await eliminarPuerta(id);

          break;


        }



        await cargarDatos();



      }catch(error){


        alert(error.message);


      }


    }


  }


}




// ===== Eventos =====


pestanas.forEach(p=>{

  p.addEventListener(
    "click",
    cambiarCatalogo
  );

});



filtroBusqueda.addEventListener(
  "input",
  aplicarFiltro
);



btnLimpiar.addEventListener(
  "click",
  ()=>{

    filtroBusqueda.value="";

    renderTabla(datosActuales);

  }
);



cuerpoTabla.addEventListener(
  "click",
  manejarAccion
);



btnNuevo.addEventListener(
  "click",
  ()=>abrirModal(null)
);



btnCerrar.addEventListener(
  "click",
  cerrarModal
);



btnCancelar.addEventListener(
  "click",
  cerrarModal
);



formularioCatalogo.addEventListener(
  "submit",
  guardar
);



fondoModal.addEventListener(
  "click",
  e=>{

    if(e.target===fondoModal){

      cerrarModal();

    }

  }
);



document.addEventListener(
  "keydown",
  e=>{


    if(
      e.key==="Escape" &&
      !fondoModal.classList.contains("oculto")
    ){

      cerrarModal();

    }


  }
);




// ===== Inicio =====


renderEncabezado();

cargarAeropuertos();

cargarDatos();
