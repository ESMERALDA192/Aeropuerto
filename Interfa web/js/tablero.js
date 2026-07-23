// ===== Datos de prueba =====
// Cuando exista el backend: fetch a GET /api/stats/dashboard
const resumen = {
  vuelosHoy:        24,
  pasajerosHoy:     318,
  registrados:      197,
  puertasOcupadas:  5,
  puertasTotales:   12,
  vuelosRetrasados: 3
};

const vuelosPorEstado = [
  { estado: "programado", cantidad: 12 },
  { estado: "abordando",  cantidad: 4  },
  { estado: "retrasado",  cantidad: 3  },
  { estado: "despegado",  cantidad: 4  },
  { estado: "cancelado",  cantidad: 1  }
];

const reservasPorAerolinea = [
  { aerolinea: "Aeroméxico",       cantidad: 128 },
  { aerolinea: "Volaris",          cantidad: 96  },
  { aerolinea: "Viva Aerobus",     cantidad: 74  },
  { aerolinea: "American Airlines", cantidad: 20 }
];

const proximasSalidas = [
  { numeroVuelo: "AM452",  aerolinea: "Aeroméxico",   destino: { codigoIata: "MEX", ciudad: "Ciudad de México" }, horaSalida: "2026-07-24T14:30:00", puerta: "A1",  estado: "programado" },
  { numeroVuelo: "Y4780",  aerolinea: "Volaris",      destino: { codigoIata: "TIJ", ciudad: "Tijuana" },          horaSalida: "2026-07-24T18:00:00", puerta: "B5",  estado: "retrasado"  },
  { numeroVuelo: "VB905",  aerolinea: "Viva Aerobus", destino: { codigoIata: "GDL", ciudad: "Guadalajara" },      horaSalida: "2026-07-24T22:10:00", puerta: "C12", estado: "programado" },
  { numeroVuelo: "AM118",  aerolinea: "Aeroméxico",   destino: { codigoIata: "GDL", ciudad: "Guadalajara" },      horaSalida: "2026-07-25T07:00:00", puerta: "A2",  estado: "abordando"  },
  { numeroVuelo: "Y4212",  aerolinea: "Volaris",      destino: { codigoIata: "MEX", ciudad: "Ciudad de México" }, horaSalida: "2026-07-25T06:45:00", puerta: "D3",  estado: "programado" }
];

// ===== Utilidades =====
function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short"
  });
}

// ===== Tarjetas de resumen =====
function renderTarjetas() {
  const porcentajeCheckin = Math.round(
    (resumen.registrados / resumen.pasajerosHoy) * 100
  );

  const tarjetas = [
    {
      etiqueta: "Vuelos programados hoy",
      valor: resumen.vuelosHoy,
      detalle: `${resumen.vuelosRetrasados} con retraso`
    },
    {
      etiqueta: "Pasajeros del día",
      valor: resumen.pasajerosHoy,
      detalle: `${resumen.registrados} con check-in (${porcentajeCheckin}%)`
    },
    {
      etiqueta: "Puertas ocupadas",
      valor: `${resumen.puertasOcupadas}/${resumen.puertasTotales}`,
      detalle: `${resumen.puertasTotales - resumen.puertasOcupadas} disponibles`
    },
    {
      etiqueta: "Vuelos retrasados",
      valor: resumen.vuelosRetrasados,
      detalle: "Requieren seguimiento",
      alerta: true
    }
  ];

  document.getElementById("rejillaTarjetas").innerHTML = tarjetas.map(t => `
    <article class="tarjeta ${t.alerta ? 'tarjeta-alerta' : ''}">
      <p class="tarjeta-etiqueta">${t.etiqueta}</p>
      <p class="tarjeta-valor">${t.valor}</p>
      <p class="tarjeta-detalle">${t.detalle}</p>
    </article>
  `).join("");
}

// ===== Gráfica de barras genérica =====
function renderBarras(contenedorId, datos, opciones) {
  const maximo = Math.max(...datos.map(opciones.valor));

  document.getElementById(contenedorId).innerHTML = datos.map(d => {
    const cantidad = opciones.valor(d);
    const ancho = (cantidad / maximo) * 100;
    const clase = opciones.clase ? opciones.clase(d) : "";

    return `
      <div class="fila-barra">
        <span class="barra-etiqueta">${opciones.etiqueta(d)}</span>
        <div class="barra-pista">
          <div class="barra-relleno ${clase}" style="width: ${ancho}%"></div>
        </div>
        <span class="barra-valor">${cantidad}</span>
      </div>
    `;
  }).join("");
}

// ===== Próximas salidas =====
function renderSalidas() {
  document.getElementById("listaSalidas").innerHTML = proximasSalidas.map(s => `
    <div class="fila-salida">
      <div class="salida-vuelo">
        <span class="numero-vuelo">${s.numeroVuelo}</span>
        <span class="ciudad">${s.aerolinea}</span>
      </div>
      <div class="salida-destino">
        <span class="codigo-iata">${s.destino.codigoIata}</span>
        <span class="ciudad">${s.destino.ciudad}</span>
      </div>
      <div class="salida-hora">
        <span class="hora">${formatearHora(s.horaSalida)}</span>
        <span class="ciudad">${formatearFecha(s.horaSalida)}</span>
      </div>
      <div class="salida-puerta">
        <span class="ciudad">Puerta</span>
        <span class="codigo-iata">${s.puerta}</span>
      </div>
      <div>
        <span class="etiqueta-estado estado-${s.estado}">${s.estado}</span>
      </div>
    </div>
  `).join("");
}

// ===== Inicio =====
renderTarjetas();

renderBarras("graficaEstados", vuelosPorEstado, {
  etiqueta: d => d.estado,
  valor:    d => d.cantidad,
  clase:    d => `barra-${d.estado}`
});

renderBarras("graficaAerolineas", reservasPorAerolinea, {
  etiqueta: d => d.aerolinea,
  valor:    d => d.cantidad
});

renderSalidas();