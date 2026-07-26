# Entrega Backend — Proyecto Aeropuerto

Backend REST + autenticación con roles, listo y probado. Este documento explica
qué hay, cómo correrlo, y qué necesita el frontend para conectarse.

---

## 1. Cómo correr el backend

1. Clona/actualiza el repo y ubícate en la raíz (`d:/Aeropuerto`)
2. Instala dependencias: `npm install`
3. Crea un archivo `.env` en la raíz (mismo nivel que `package.json`) con este
   contenido exacto:

```dotenv
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://grupo:grupo@servidorprueba.ygegryf.mongodb.net/aeropuerto?retryWrites=true&w=majority
JWT_SECRET=NoSQL
JWT_EXPIRA=8h
```

4. Corre el servidor: `npm run dev`
5. Deberías ver:
```
Conectado correctamente a MongoDB Atlas
Servidor iniciado en http://localhost:3001
```

**Importante:** todo el equipo debe usar el mismo `JWT_SECRET` (`NoSQL`).
Si cada quien pone uno distinto, los tokens generados por un compañero no
serán válidos para otro que corra el backend con un secreto diferente.

---

## 2. Usuarios de prueba (ya cargados en la base de datos)

No hay registro público. Se trabaja únicamente con estas 3 cuentas ya creadas
en MongoDB Atlas (colección `usuarios`), una por cada rol:

| Rol | Correo | Password |
|---|---|---|
| Administrador | `admin@aeropuerto.com` | `admin123` |
| Agente de mostrador | `agente@aeropuerto.com` | `agente123` |
| Pasajero | `pasajero@aeropuerto.com` | `pasajero123` |

Si por algún motivo la base de datos se resetea y estas cuentas desaparecen,
correr desde la raíz: `node backend/seed/seedUsuarios.js` (las vuelve a crear,
sin duplicar si ya existen).

---

## 3. Cómo funciona la autenticación (para el frontend)

### 3.1 Login

```
POST http://localhost:3001/auth/login
Content-Type: application/json

{ "correo": "admin@aeropuerto.com", "password": "admin123" }
```

Respuesta:
```json
{
  "mensaje": "Inicio de sesión correcto",
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": "...",
    "nombre": "Administrador General",
    "correo": "admin@aeropuerto.com",
    "rol": "administrador"
  }
}
```

El frontend debe guardar `token` y `rol` (ej. en `localStorage`) justo después
del login.

### 3.2 Cómo mandar el token en cada petición protegida

Todas las rutas (excepto `POST /auth/login`) requieren el header:

```
Authorization: Bearer EL_TOKEN_AQUI
```

Ejemplo con `fetch`:
```javascript
const token = localStorage.getItem("token");

const respuesta = await fetch("http://localhost:3001/vuelos", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
});
```

Si falta el token: `401 { "mensaje": "No autorizado. Falta el token" }`
Si el rol no tiene permiso: `403 { "mensaje": "No tienes permiso para realizar esta acción" }`
Si el token expiró (dura 8h): `401 { "mensaje": "Token inválido o expirado" }`

---

## 4. Rutas disponibles y permisos por rol

Base URL local: `http://localhost:3001`

Todas las rutas de recursos (todo excepto `/auth`) requieren estar
autenticado (`Authorization: Bearer TOKEN`) incluso para `GET`.

| Recurso | GET (ver) | POST (crear) | PUT (editar) | DELETE (borrar) |
|---|---|---|---|---|
| `/aerolineas` | cualquier rol | administrador | administrador | administrador |
| `/aeropuertos` | cualquier rol | administrador | administrador | administrador |
| `/empleados` | cualquier rol | administrador | administrador | administrador |
| `/pasajeros` | cualquier rol | admin, agente | admin, agente | administrador |
| `/puertas` | cualquier rol | administrador | admin, agente | administrador |
| `/vuelos` | cualquier rol | administrador | admin, agente | administrador |
| `/reservas` | cualquier rol | admin, agente, **pasajero** | admin, agente | admin, agente |
| `/auth/login` | — | público (sin token) | — | — |

Nota: "cualquier rol" significa cualquiera de los 3 (pasajero, agente,
administrador), siempre y cuando mande un token válido.

---

## 5. Formato de respuestas de la API (para saber qué esperar)

**Éxito en creación/edición/eliminación:**
```json
{ "mensaje": "Texto descriptivo", "aerolinea": { ...objeto... } }
```
(la clave del objeto cambia según el recurso: `aerolinea`, `aeropuerto`,
`empleado`, `pasajero`, `puerta`, `vuelo`, `reserva`)

**GET de lista:** devuelve directamente un array `[ {...}, {...} ]`

**GET por id / errores 404:**
```json
{ "mensaje": "Aerolínea no encontrada" }
```

**Errores de validación (400):**
```json
{ "mensaje": "Faltan datos de la aerolínea (nombre, codigoIata, pais)" }
```

**Campo duplicado (400)**, ej. `codigoIata` repetido:
```json
{ "mensaje": "Ya existe un registro con ese valor en el campo 'codigoIata'", "valor": "AM" }
```

---

## 6. Detalle importante: campos "id" en POST/PUT de recursos con relaciones

Estos 4 recursos **no** reciben el objeto completo relacionado, sino solo el
`_id` del documento relacionado. El backend busca esos ids y arma el resto:

- **Empleado**: `aerolineaId` (opcional)
- **Puerta**: `aeropuertoId` (obligatorio)
- **Vuelo**: `aerolineaId`, `origenId`, `destinoId` (obligatorios)
- **Reserva**: `pasajeroId`, `vueloId` (obligatorios)

Ejemplo body para crear un vuelo:
```json
{
  "numeroVuelo": "AM123",
  "aerolineaId": "6a...",
  "origenId": "6a...",
  "destinoId": "6a...",
  "horaSalida": "2026-08-01T10:00:00.000Z",
  "horaLlegada": "2026-08-01T12:00:00.000Z",
  "estado": "programado"
}
```

---

## 7. Estructura de carpetas del backend

```
backend/
├── index.js                  ← arranque del servidor
├── config/db.js               ← conexión a MongoDB Atlas
├── middlewares/
│   ├── auth.js                 ← verificarToken, verificarRol
│   └── errorHandler.js         ← manejo centralizado de errores
├── models/                    ← 8 modelos Mongoose (7 del aeropuerto + Usuario)
├── routes/                    ← 8 archivos de rutas (7 recursos + auth)
└── seed/seedUsuarios.js       ← crea los 3 usuarios de prueba
```

---

## 8. Pendiente / próximos pasos (no es parte de esta entrega)

- Conectar el frontend real (`api.js` + las pantallas) a estas rutas, usando
  el token guardado tras el login
- Pantalla de bienvenida con login (una sola, sin registro)
- Deploy en Vercel (el `vercel.json` ya apunta a `backend/index.js`, falta
  configurar las variables de entorno — `MONGO_URI`, `JWT_SECRET`,
  `JWT_EXPIRA` — directamente en el dashboard de Vercel, no en un `.env`)
