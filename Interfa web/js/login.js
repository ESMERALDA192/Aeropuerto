// ===== ELEMENTOS =====
const formularioLogin = document.getElementById("formularioLogin");
const campoCorreo     = document.getElementById("campoCorreo");
const campoPassword   = document.getElementById("campoPassword");
const errorLogin      = document.getElementById("errorLogin");
const btnEntrar       = document.getElementById("btnEntrar");

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

    redirigirSegunRol(datos.usuario.rol);

  } catch (error) {
    errorLogin.textContent = error.message;
    errorLogin.classList.remove("oculto");
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Iniciar sesión";
  }
});