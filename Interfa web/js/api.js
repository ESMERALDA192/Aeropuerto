// ===== Configuración de la API =====
const API_URL = "https://api-aeropuerto.vercel.app";

// Devuelve los headers con el token guardado en el login
function headersConToken() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// ===== AUTENTICACIÓN =====
async function login(correo, password) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password })
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || "Correo o contraseña incorrectos");
  return datos;
}

async function registrar(datosUsuario) {
  const respuesta = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosUsuario)
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo crear la cuenta");
  return datos;
}

// ===== VUELOS =====
async function obtenerVuelos() {
  const respuesta = await fetch(`${API_URL}/vuelos`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar los vuelos");
  return await respuesta.json();
}
async function agregarVuelo(vuelo) {
  const respuesta = await fetch(`${API_URL}/vuelos`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(vuelo)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar el vuelo");
  return await respuesta.json();
}
async function actualizarVuelo(id, vuelo) {
  const respuesta = await fetch(`${API_URL}/vuelos/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(vuelo)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar el vuelo");
  return await respuesta.json();
}
async function eliminarVuelo(id) {
  const respuesta = await fetch(`${API_URL}/vuelos/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar el vuelo");
  return await respuesta.json();
}

// ===== RESERVAS =====
async function obtenerReservas() {
  const respuesta = await fetch(`${API_URL}/reservas`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar las reservas");
  return await respuesta.json();
}
async function agregarReserva(reserva) {
  const respuesta = await fetch(`${API_URL}/reservas`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(reserva)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar la reserva");
  return await respuesta.json();
}
async function actualizarReserva(id, reserva) {
  const respuesta = await fetch(`${API_URL}/reservas/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(reserva)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar la reserva");
  return await respuesta.json();
}
async function eliminarReserva(id) {
  const respuesta = await fetch(`${API_URL}/reservas/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar la reserva");
  return await respuesta.json();
}

// ===== AEROLÍNEAS =====
async function obtenerAerolineas() {
  const respuesta = await fetch(`${API_URL}/aerolineas`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar las aerolíneas");
  return await respuesta.json();
}
async function agregarAerolinea(aerolinea) {
  const respuesta = await fetch(`${API_URL}/aerolineas`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(aerolinea)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar la aerolínea");
  return await respuesta.json();
}
async function actualizarAerolinea(id, aerolinea) {
  const respuesta = await fetch(`${API_URL}/aerolineas/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(aerolinea)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar la aerolínea");
  return await respuesta.json();
}
async function eliminarAerolinea(id) {
  const respuesta = await fetch(`${API_URL}/aerolineas/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar la aerolínea");
  return await respuesta.json();
}

// ===== AEROPUERTOS =====
async function obtenerAeropuertos() {
  const respuesta = await fetch(`${API_URL}/aeropuertos`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar los aeropuertos");
  return await respuesta.json();
}
async function agregarAeropuerto(aeropuerto) {
  const respuesta = await fetch(`${API_URL}/aeropuertos`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(aeropuerto)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar el aeropuerto");
  return await respuesta.json();
}
async function actualizarAeropuerto(id, aeropuerto) {
  const respuesta = await fetch(`${API_URL}/aeropuertos/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(aeropuerto)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar el aeropuerto");
  return await respuesta.json();
}
async function eliminarAeropuerto(id) {
  const respuesta = await fetch(`${API_URL}/aeropuertos/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar el aeropuerto");
  return await respuesta.json();
}

// ===== PUERTAS =====
async function obtenerPuertas() {
  const respuesta = await fetch(`${API_URL}/puertas`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar las puertas");
  return await respuesta.json();
}
async function agregarPuerta(puerta) {
  const respuesta = await fetch(`${API_URL}/puertas`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(puerta)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar la puerta");
  return await respuesta.json();
}
async function actualizarPuerta(id, puerta) {
  const respuesta = await fetch(`${API_URL}/puertas/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(puerta)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar la puerta");
  return await respuesta.json();
}
async function eliminarPuerta(id) {
  const respuesta = await fetch(`${API_URL}/puertas/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar la puerta");
  return await respuesta.json();
}

// ===== PASAJEROS =====
async function obtenerPasajeros() {
  const respuesta = await fetch(`${API_URL}/pasajeros`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar los pasajeros");
  return await respuesta.json();
}
async function agregarPasajero(pasajero) {
  const respuesta = await fetch(`${API_URL}/pasajeros`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(pasajero)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar el pasajero");
  return await respuesta.json();
}
async function actualizarPasajero(id, pasajero) {
  const respuesta = await fetch(`${API_URL}/pasajeros/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(pasajero)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar el pasajero");
  return await respuesta.json();
}
async function eliminarPasajero(id) {
  const respuesta = await fetch(`${API_URL}/pasajeros/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar el pasajero");
  return await respuesta.json();
}

// ===== EMPLEADOS =====
async function obtenerEmpleados() {
  const respuesta = await fetch(`${API_URL}/empleados`, { headers: headersConToken() });
  if (!respuesta.ok) throw new Error("Error al consultar los empleados");
  return await respuesta.json();
}
async function agregarEmpleado(empleado) {
  const respuesta = await fetch(`${API_URL}/empleados`, {
    method: "POST", headers: headersConToken(), body: JSON.stringify(empleado)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al guardar el empleado");
  return await respuesta.json();
}
async function actualizarEmpleado(id, empleado) {
  const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
    method: "PUT", headers: headersConToken(), body: JSON.stringify(empleado)
  });
  if (!respuesta.ok) throw new Error((await respuesta.json()).mensaje || "Error al actualizar el empleado");
  return await respuesta.json();
}
async function eliminarEmpleado(id) {
  const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
    method: "DELETE", headers: headersConToken()
  });
  if (!respuesta.ok) throw new Error("Error al eliminar el empleado");
  return await respuesta.json();
}

