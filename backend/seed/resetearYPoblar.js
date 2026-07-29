// ===== Configuración =====
const BASE_URL = "https://api-aeropuerto.vercel.app";

// Pon aquí el correo y contraseña de una cuenta que ya exista con rol "administrador"
const ADMIN_CORREO = "admin@aeropuerto.com";
const ADMIN_PASSWORD = "admin123";

let token = "";

// ===== Utilidad para llamar a la API =====
async function api(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(`${metodo} ${ruta} -> ${respuesta.status}: ${datos.mensaje || "Error desconocido"}`);
  }

  return datos;
}

// ===== 1. Login como administrador =====
async function iniciarSesion() {
  console.log("Iniciando sesión como administrador...");
  const datos = await api("POST", "/auth/login", {
    correo: ADMIN_CORREO,
    password: ADMIN_PASSWORD
  });
  token = datos.token;
  console.log("Sesión iniciada correctamente.\n");
}

// ===== 2. Borrar todo excepto Usuario y Pasajero =====
async function borrarColeccion(nombre, rutaListar, rutaEliminar) {
  console.log(`Borrando ${nombre}...`);
  const lista = await api("GET", rutaListar);
  for (const item of lista) {
    await api("DELETE", `${rutaEliminar}/${item._id}`);
  }
  console.log(`  -> ${lista.length} registros de ${nombre} eliminados.`);
}

async function limpiarTodo() {
  await borrarColeccion("reservas", "/reservas", "/reservas");
  await borrarColeccion("vuelos", "/vuelos", "/vuelos");
  await borrarColeccion("puertas", "/puertas", "/puertas");
  await borrarColeccion("empleados", "/empleados", "/empleados");
  await borrarColeccion("aerolineas", "/aerolineas", "/aerolineas");
  await borrarColeccion("aeropuertos", "/aeropuertos", "/aeropuertos");
  console.log("\nBase de datos limpia (Usuario y Pasajero intactos).\n");
}

// ===== 3. Datos reales a insertar =====

const aeropuertosData = [
  // ---- México ----
  { nombre: "Aeropuerto Internacional Benito Juárez", codigoIata: "MEX", ciudad: "Ciudad de México", pais: "México", terminales: 2, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Felipe Ángeles", codigoIata: "NLU", ciudad: "Zumpango", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Miguel Hidalgo y Costilla", codigoIata: "GDL", ciudad: "Guadalajara", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Cancún", codigoIata: "CUN", ciudad: "Cancún", pais: "México", terminales: 4, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Mariano Escobedo", codigoIata: "MTY", ciudad: "Monterrey", pais: "México", terminales: 2, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Tijuana", codigoIata: "TIJ", ciudad: "Tijuana", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Los Cabos", codigoIata: "SJD", ciudad: "San José del Cabo", pais: "México", terminales: 2, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Lic. Gustavo Díaz Ordaz", codigoIata: "PVR", ciudad: "Puerto Vallarta", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Manuel Crescencio Rejón", codigoIata: "MID", ciudad: "Mérida", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional Xoxocotlán", codigoIata: "OAX", ciudad: "Oaxaca", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional General Abelardo L. Rodríguez", codigoIata: "TIJ2", ciudad: "Tijuana", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Querétaro", codigoIata: "QRO", ciudad: "Querétaro", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional General Rafael Buelna", codigoIata: "MZT", ciudad: "Mazatlán", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Puebla", codigoIata: "PBC", ciudad: "Puebla", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Veracruz", codigoIata: "VER", ciudad: "Veracruz", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Chihuahua", codigoIata: "CUU", ciudad: "Chihuahua", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de La Paz", codigoIata: "LAP", ciudad: "La Paz", pais: "México", terminales: 1, imagenUrl: "" },
  { nombre: "Aeropuerto Internacional de Villahermosa", codigoIata: "VSA", ciudad: "Villahermosa", pais: "México", terminales: 1, imagenUrl: "" },

  // ---- Internacional ----
  { nombre: "John F. Kennedy International Airport", codigoIata: "JFK", ciudad: "Nueva York", pais: "Estados Unidos", terminales: 6, imagenUrl: "" },
  { nombre: "Los Angeles International Airport", codigoIata: "LAX", ciudad: "Los Ángeles", pais: "Estados Unidos", terminales: 9, imagenUrl: "" },
  { nombre: "Miami International Airport", codigoIata: "MIA", ciudad: "Miami", pais: "Estados Unidos", terminales: 3, imagenUrl: "" },
  { nombre: "George Bush Intercontinental Airport", codigoIata: "IAH", ciudad: "Houston", pais: "Estados Unidos", terminales: 5, imagenUrl: "" },
  { nombre: "Dallas Fort Worth International Airport", codigoIata: "DFW", ciudad: "Dallas", pais: "Estados Unidos", terminales: 5, imagenUrl: "" },
  { nombre: "O'Hare International Airport", codigoIata: "ORD", ciudad: "Chicago", pais: "Estados Unidos", terminales: 4, imagenUrl: "" },
  { nombre: "Adolfo Suárez Madrid-Barajas", codigoIata: "MAD", ciudad: "Madrid", pais: "España", terminales: 4, imagenUrl: "" },
  { nombre: "Aeropuerto de Barcelona-El Prat", codigoIata: "BCN", ciudad: "Barcelona", pais: "España", terminales: 2, imagenUrl: "" },
  { nombre: "Charles de Gaulle Airport", codigoIata: "CDG", ciudad: "París", pais: "Francia", terminales: 3, imagenUrl: "" },
  { nombre: "Heathrow Airport", codigoIata: "LHR", ciudad: "Londres", pais: "Reino Unido", terminales: 4, imagenUrl: "" },
  { nombre: "Toronto Pearson International Airport", codigoIata: "YYZ", ciudad: "Toronto", pais: "Canadá", terminales: 2, imagenUrl: "" },
  { nombre: "El Dorado International Airport", codigoIata: "BOG", ciudad: "Bogotá", pais: "Colombia", terminales: 1, imagenUrl: "" },
  { nombre: "Jorge Chávez International Airport", codigoIata: "LIM", ciudad: "Lima", pais: "Perú", terminales: 2, imagenUrl: "" },
  { nombre: "Arturo Merino Benítez International Airport", codigoIata: "SCL", ciudad: "Santiago", pais: "Chile", terminales: 1, imagenUrl: "" },
  { nombre: "Ministro Pistarini International Airport", codigoIata: "EZE", ciudad: "Buenos Aires", pais: "Argentina", terminales: 1, imagenUrl: "" },
  { nombre: "São Paulo–Guarulhos International Airport", codigoIata: "GRU", ciudad: "São Paulo", pais: "Brasil", terminales: 3, imagenUrl: "" }
];

const aerolineasData = [
  { nombre: "Aeroméxico", codigoIata: "AM", pais: "México" },
  { nombre: "Volaris", codigoIata: "Y4", pais: "México" },
  { nombre: "VivaAerobus", codigoIata: "VB", pais: "México" },
  { nombre: "Aeroméxico Connect", codigoIata: "5D", pais: "México" },
  { nombre: "American Airlines", codigoIata: "AA", pais: "Estados Unidos" },
  { nombre: "Delta Air Lines", codigoIata: "DL", pais: "Estados Unidos" },
  { nombre: "United Airlines", codigoIata: "UA", pais: "Estados Unidos" },
  { nombre: "JetBlue Airways", codigoIata: "B6", pais: "Estados Unidos" },
  { nombre: "Southwest Airlines", codigoIata: "WN", pais: "Estados Unidos" },
  { nombre: "Iberia", codigoIata: "IB", pais: "España" },
  { nombre: "Air France", codigoIata: "AF", pais: "Francia" },
  { nombre: "British Airways", codigoIata: "BA", pais: "Reino Unido" },
  { nombre: "Lufthansa", codigoIata: "LH", pais: "Alemania" },
  { nombre: "LATAM Airlines", codigoIata: "LA", pais: "Chile" },
  { nombre: "Copa Airlines", codigoIata: "CM", pais: "Panamá" },
  { nombre: "Avianca", codigoIata: "AV", pais: "Colombia" },
  { nombre: "Air Canada", codigoIata: "AC", pais: "Canadá" },
  { nombre: "Aerolíneas Argentinas", codigoIata: "AR", pais: "Argentina" },
  { nombre: "GOL Linhas Aéreas", codigoIata: "G3", pais: "Brasil" },
  { nombre: "Emirates", codigoIata: "EK", pais: "Emiratos Árabes Unidos" }
];

// ===== Generador de empleados (varios por aerolínea) =====
function generarEmpleados(aerolineasCreadas) {
  const puestos = ["piloto", "copiloto", "sobrecargo", "sobrecargo", "personal_tierra", "seguridad"];
  const nombres = ["Carlos", "María", "Luis", "Ana", "José", "Laura", "Miguel", "Sofía", "Jorge", "Valentina", "Ricardo", "Camila", "Fernando", "Paola", "Diego", "Renata"];
  const apellidos = ["Hernández", "García", "Martínez", "López", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Cruz", "Ortiz", "Castillo", "Vargas"];

  const empleados = [];
  let contador = 1;

  aerolineasCreadas.forEach((aerolinea) => {
    puestos.forEach((puesto) => {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      empleados.push({
        nombre,
        apellido,
        puesto,
        aerolineaId: aerolinea._id,
        numeroEmpleado: `EMP-${String(contador).padStart(4, "0")}`
      });
      contador++;
    });
  });

  return empleados;
}

// ===== Generador de rutas de vuelos (muchas combinaciones) =====
function generarVuelos(aerolineasCreadas, aeropuertosCreados) {
  // Rutas frecuentes: [origen, destino]
  const rutas = [
    ["MEX", "CUN"], ["MEX", "GDL"], ["MEX", "MTY"], ["MEX", "TIJ"], ["MEX", "SJD"],
    ["MEX", "PVR"], ["MEX", "MID"], ["MEX", "OAX"], ["MEX", "QRO"], ["MEX", "VER"],
    ["GDL", "TIJ"], ["GDL", "CUN"], ["MTY", "CUN"], ["MTY", "TIJ"], ["CUN", "MID"],
    ["MEX", "JFK"], ["MEX", "LAX"], ["MEX", "MIA"], ["MEX", "IAH"], ["MEX", "DFW"],
    ["MEX", "ORD"], ["GDL", "LAX"], ["MTY", "IAH"], ["CUN", "MIA"], ["CUN", "JFK"],
    ["MEX", "MAD"], ["MEX", "BCN"], ["MEX", "CDG"], ["MEX", "LHR"],
    ["MEX", "BOG"], ["MEX", "LIM"], ["MEX", "SCL"], ["MEX", "EZE"], ["MEX", "GRU"],
    ["MEX", "YYZ"], ["GDL", "YYZ"], ["TIJ", "LAX"], ["SJD", "LAX"], ["PVR", "LAX"]
  ];

  const vuelos = [];
  let contador = 1;

  const buscarAeropuerto = (codigo) => aeropuertosCreados.find(a => a.codigoIata === codigo);

  rutas.forEach((ruta, indice) => {
    const origen = buscarAeropuerto(ruta[0]);
    const destino = buscarAeropuerto(ruta[1]);
    if (!origen || !destino) return;

    // Por cada ruta, generamos 2 vuelos con distintas aerolíneas y horarios
    for (let i = 0; i < 2; i++) {
      const aerolinea = aerolineasCreadas[(indice + i) % aerolineasCreadas.length];
      const diaBase = 5 + ((indice + i) % 20); // reparte los vuelos entre agosto 05 y 24 de 2026
      const horaSalida = 6 + ((indice * 3 + i * 5) % 15); // entre 06:00 y 20:00
      const duracionHoras = 1 + Math.floor(Math.random() * 6);

      const fechaSalida = new Date(2026, 7, diaBase, horaSalida, 0, 0); // mes 7 = agosto (0-index)
      const fechaLlegada = new Date(fechaSalida.getTime() + duracionHoras * 60 * 60 * 1000);

      const precioBase = 900 + Math.floor(Math.random() * 9000);

      vuelos.push({
        numeroVuelo: `${aerolinea.codigoIata}${1000 + contador}`,
        aerolineaId: aerolinea._id,
        origenId: origen._id,
        destinoId: destino._id,
        horaSalida: fechaSalida.toISOString(),
        horaLlegada: fechaLlegada.toISOString(),
        precio: precioBase,
        estado: "programado"
      });

      contador++;
    }
  });

  return vuelos;
}

// ===== 4. Insertar catálogos base =====
async function poblarCatalogos() {
  console.log("Insertando aeropuertos...");
  const aeropuertosCreados = [];
  for (const aero of aeropuertosData) {
    const res = await api("POST", "/aeropuertos", aero);
    aeropuertosCreados.push(res.aeropuerto || res);
  }
  console.log(`  -> ${aeropuertosCreados.length} aeropuertos creados.`);

  console.log("Insertando aerolíneas...");
  const aerolineasCreadas = [];
  for (const aerolinea of aerolineasData) {
    const res = await api("POST", "/aerolineas", aerolinea);
    aerolineasCreadas.push(res.aerolinea || res);
  }
  console.log(`  -> ${aerolineasCreadas.length} aerolíneas creadas.`);

  console.log("Insertando puertas (según terminales de cada aeropuerto)...");
  let totalPuertas = 0;
  for (const aero of aeropuertosCreados) {
    const cantidad = Math.min(aero.terminales * 2, 6);
    for (let n = 1; n <= cantidad; n++) {
      const estados = ["disponible", "disponible", "ocupada", "mantenimiento"];
      await api("POST", "/puertas", {
        numero: `${aero.codigoIata}-${n}`,
        terminal: String(1 + (n % aero.terminales)),
        aeropuertoId: aero._id,
        estado: estados[n % estados.length]
      });
      totalPuertas++;
    }
  }
  console.log(`  -> ${totalPuertas} puertas creadas.`);

  console.log("Insertando empleados...");
  const empleadosData = generarEmpleados(aerolineasCreadas);
  let totalEmpleados = 0;
  for (const emp of empleadosData) {
    await api("POST", "/empleados", emp);
    totalEmpleados++;
  }
  console.log(`  -> ${totalEmpleados} empleados creados.`);

  return { aeropuertosCreados, aerolineasCreadas };
}

// ===== 5. Insertar vuelos =====
async function poblarVuelos(aerolineasCreadas, aeropuertosCreados) {
  console.log("Insertando vuelos...");
  const vuelosData = generarVuelos(aerolineasCreadas, aeropuertosCreados);
  const vuelosCreados = [];

  for (const v of vuelosData) {
    try {
      const res = await api("POST", "/vuelos", v);
      vuelosCreados.push(res.vuelo || res);
    } catch (error) {
      console.warn(`  ! Se omitió ${v.numeroVuelo}: ${error.message}`);
    }
  }
  console.log(`  -> ${vuelosCreados.length} vuelos creados.\n`);
  return vuelosCreados;
}

// ===== 6. Insertar reservas usando pasajeros reales ya existentes =====
async function poblarReservas(vuelosCreados) {
  console.log("Buscando pasajeros reales existentes...");
  const pasajeros = await api("GET", "/pasajeros");

  if (!pasajeros || pasajeros.length === 0) {
    console.log("  ! No hay pasajeros registrados todavía, se omiten las reservas.\n");
    return;
  }
  console.log(`  -> Se encontraron ${pasajeros.length} pasajeros reales.`);

  const clases = ["economica", "ejecutiva", "primera"];
  const filas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  const letras = ["A", "B", "C", "D", "E", "F"];

  let totalReservas = 0;
  let indiceVuelo = 0;

  for (const pasajero of pasajeros) {
    // A cada pasajero real le damos entre 1 y 3 reservas en vuelos distintos
    const cantidadReservas = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < cantidadReservas; i++) {
      if (vuelosCreados.length === 0) break;

      const vuelo = vuelosCreados[indiceVuelo % vuelosCreados.length];
      indiceVuelo++;

      const asiento = `${filas[Math.floor(Math.random() * filas.length)]}${letras[Math.floor(Math.random() * letras.length)]}`;
      const clase = clases[Math.floor(Math.random() * clases.length)];

      try {
        await api("POST", "/reservas", {
          pasajeroId: pasajero._id,
          vueloId: vuelo._id,
          asiento,
          clase,
          registrado: Math.random() > 0.6
        });
        totalReservas++;
      } catch (error) {
        console.warn(`  ! Se omitió una reserva: ${error.message}`);
      }
    }
  }

  console.log(`  -> ${totalReservas} reservas creadas.\n`);
}

// ===== Ejecutar todo en orden =====
(async function main() {
  try {
    await iniciarSesion();
    await limpiarTodo();

    const { aeropuertosCreados, aerolineasCreadas } = await poblarCatalogos();
    const vuelosCreados = await poblarVuelos(aerolineasCreadas, aeropuertosCreados);
    await poblarReservas(vuelosCreados);

    console.log("✅ Proceso completado con éxito.");
  } catch (error) {
    console.error("❌ Error durante el proceso:", error.message);
  }
})();