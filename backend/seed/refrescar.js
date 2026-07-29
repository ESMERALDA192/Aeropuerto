const BASE_URL = "https://api-aeropuerto.vercel.app";
const ADMIN_CORREO = "admin@aeropuerto.com";
const ADMIN_PASSWORD = "admin123";

let token = "";

async function api(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(`${metodo} ${ruta} -> ${respuesta.status}: ${datos.mensaje || "Error"}`);
  return datos;
}

(async function refrescarImagenes() {
  const login = await api("POST", "/auth/login", { correo: ADMIN_CORREO, password: ADMIN_PASSWORD });
  token = login.token;

  const vuelos = await api("GET", "/vuelos");
  console.log(`Refrescando ${vuelos.length} vuelos...`);

  let ok = 0;
  for (const v of vuelos) {
    try {
      await api("PUT", `/vuelos/${v._id}`, {
        numeroVuelo: v.numeroVuelo,
        aerolineaId: v.aerolinea.id,
        origenId: v.origen.id,
        destinoId: v.destino.id,
        horaSalida: v.horaSalida,
        horaLlegada: v.horaLlegada,
        precio: v.precio,
        estado: v.estado
      });
      ok++;
    } catch (e) {
      console.warn(`Falló ${v.numeroVuelo}: ${e.message}`);
    }
  }
  console.log(`${ok} vuelos refrescados.`);
})();