const API = "http://localhost:3001";

const formularioLogin = document.getElementById("formularioLogin");
const campoCorreo     = document.getElementById("campoCorreo");
const campoPassword   = document.getElementById("campoPassword");
const errorLogin      = document.getElementById("errorLogin");
const btnEntrar       = document.getElementById("btnEntrar");

// Si ya hay sesión activa, saltar directo al sistema
if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}

function mostrarError(mensaje) {
  errorLogin.textContent = mensaje;
  errorLogin.classList.remove("oculto");
}

async function iniciarSesion(evento) {
  evento.preventDefault();
  errorLogin.classList.add("oculto");

  const correo   = campoCorreo.value.trim();
  const password = campoPassword.value;

  if (!correo || !password) {
    return mostrarError("Ingresa correo y contraseña.");
  }

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  try {
    const respuesta = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Correo o contraseña incorrectos.");
    }

    // Guardar token e info del usuario
    localStorage.setItem("token", datos.token);
    localStorage.setItem("rol", datos.usuario.rol);
    localStorage.setItem("nombre", datos.usuario.nombre);

    // Entrar al sistema
    window.location.href = "index.html";

  } catch (error) {
    mostrarError(error.message);
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Iniciar sesión";
  }
}

formularioLogin.addEventListener("submit", iniciarSesion);