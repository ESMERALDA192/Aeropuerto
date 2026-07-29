// ===== ELEMENTOS =====
const formularioLogin = document.getElementById("formularioLogin");
const campoCorreo     = document.getElementById("campoCorreo");
const campoPassword   = document.getElementById("campoPassword");
const errorLogin      = document.getElementById("errorLogin");
const btnEntrar       = document.getElementById("btnEntrar");

// ===== ELEMENTOS DEL TOGGLE / REGISTRO =====
const btnMostrarLogin    = document.getElementById("btnMostrarLogin");
const btnMostrarRegistro = document.getElementById("btnMostrarRegistro");
const vistaLogin      = document.getElementById("vistaLogin");
const vistaRegistro   = document.getElementById("vistaRegistro");
const loginKicker     = document.getElementById("loginKicker");
const loginTitulo     = document.getElementById("loginTitulo");
const loginSubtitulo  = document.getElementById("loginSubtitulo");

const formularioRegistro      = document.getElementById("formularioRegistro");
const campoRegNombre          = document.getElementById("campoRegNombre");
const campoRegApellidoP       = document.getElementById("campoRegApellidoP");
const campoRegApellidoM       = document.getElementById("campoRegApellidoM");
const campoRegCorreo          = document.getElementById("campoRegCorreo");
const campoRegDocumento       = document.getElementById("campoRegDocumento");
const campoRegFechaNacimiento = document.getElementById("campoRegFechaNacimiento");
const campoRegTelefono        = document.getElementById("campoRegTelefono");
const campoRegGenero          = document.getElementById("campoRegGenero");
const campoRegPassword        = document.getElementById("campoRegPassword");
const errorRegistro           = document.getElementById("errorRegistro");
const btnRegistrar            = document.getElementById("btnRegistrar");

// Si ya hay sesión, entrar directo según el rol
if (localStorage.getItem("token")) {
  redirigirSegunRol(localStorage.getItem("rol"));
}

function redirigirSegunRol(rol) {
  if (rol === "pasajero") {
    window.location.href = "pasajero.html";
  } else if (rol === "agente") {
    window.location.href = "agente.html";
  } else {
    window.location.href = "index.html";
  }
}

// ===== ALTERNAR ENTRE "INICIAR SESIÓN" Y "CREAR CUENTA" =====
function mostrarLogin() {
  vistaLogin.classList.remove("oculto");
  vistaRegistro.classList.add("oculto");
  btnMostrarLogin.classList.add("activo");
  btnMostrarRegistro.classList.remove("activo");
  btnMostrarLogin.setAttribute("aria-selected", "true");
  btnMostrarRegistro.setAttribute("aria-selected", "false");
  loginKicker.textContent = "Acceso del personal";
  loginTitulo.textContent = "Iniciar sesión";
  loginSubtitulo.textContent = "Ingresa tus credenciales para entrar al centro de operaciones.";
}

function mostrarRegistro() {
  vistaRegistro.classList.remove("oculto");
  vistaLogin.classList.add("oculto");
  btnMostrarRegistro.classList.add("activo");
  btnMostrarLogin.classList.remove("activo");
  btnMostrarRegistro.setAttribute("aria-selected", "true");
  btnMostrarLogin.setAttribute("aria-selected", "false");
  loginKicker.textContent = "Nuevo pasajero";
  loginTitulo.textContent = "Crear cuenta";
  loginSubtitulo.textContent = "Regístrate para buscar vuelos y hacer tus reservas.";
}

btnMostrarLogin.addEventListener("click", mostrarLogin);
btnMostrarRegistro.addEventListener("click", mostrarRegistro);

// ===== INICIAR SESIÓN =====
formularioLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorLogin.classList.add("oculto");

  const correo   = campoCorreo.value.trim();
  const password = campoPassword.value;

  if (!correo || !password) {
    errorLogin.textContent = "Ingresa correo y contraseña.";
    errorLogin.classList.remove("oculto");
    return;
  }

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  try {
    const datos = await login(correo, password);

    localStorage.setItem("token", datos.token);
    localStorage.setItem("rol", datos.usuario.rol);
    localStorage.setItem("nombre", datos.usuario.nombre);
    localStorage.setItem("correo", datos.usuario.correo);

    if (datos.usuario.pasajero) {
      localStorage.setItem("pasajeroId", datos.usuario.pasajero._id);
      localStorage.setItem("pasajeroDocumento", datos.usuario.pasajero.documento);
    } else {
      localStorage.removeItem("pasajeroId");
      localStorage.removeItem("pasajeroDocumento");
    }

    redirigirSegunRol(datos.usuario.rol);

  } catch (error) {
    errorLogin.textContent = error.message;
    errorLogin.classList.remove("oculto");
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Iniciar sesión";
  }
});

// ===== CREAR CUENTA (registro de pasajero) =====
formularioRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorRegistro.classList.add("oculto");

  const datosRegistro = {
    nombre: campoRegNombre.value.trim(),
    apellidoPaterno: campoRegApellidoP.value.trim(),
    apellidoMaterno: campoRegApellidoM.value.trim(),
    correo: campoRegCorreo.value.trim(),
    documento: campoRegDocumento.value.trim(),
    fechaNacimiento: campoRegFechaNacimiento.value,
    telefono: campoRegTelefono.value.trim(),
    genero: campoRegGenero.value,
    password: campoRegPassword.value
  };

  if (!datosRegistro.nombre || !datosRegistro.apellidoPaterno || !datosRegistro.apellidoMaterno ||
      !datosRegistro.correo || !datosRegistro.documento || !datosRegistro.fechaNacimiento ||
      !datosRegistro.telefono || !datosRegistro.genero || !datosRegistro.password) {
    errorRegistro.textContent = "Completa todos los campos del registro.";
    errorRegistro.classList.remove("oculto");
    return;
  }

  btnRegistrar.disabled = true;
  btnRegistrar.textContent = "Creando cuenta...";

  try {
    const datos = await registrar(datosRegistro);

    localStorage.setItem("token", datos.token);
    localStorage.setItem("rol", datos.usuario.rol);
    localStorage.setItem("nombre", datos.usuario.nombre);
    localStorage.setItem("correo", datos.usuario.correo);

    if (datos.usuario.pasajero) {
      localStorage.setItem("pasajeroId", datos.usuario.pasajero._id);
      localStorage.setItem("pasajeroDocumento", datos.usuario.pasajero.documento);
    }

    redirigirSegunRol(datos.usuario.rol);

  } catch (error) {
    errorRegistro.textContent = error.message;
    errorRegistro.classList.remove("oculto");
    btnRegistrar.disabled = false;
    btnRegistrar.textContent = "Crear cuenta";
  }
});