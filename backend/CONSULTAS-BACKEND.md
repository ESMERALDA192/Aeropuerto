# Backend de consultas — Aeropuerto

Este módulo corresponde al criterio **Backend Consultas** de la rúbrica. Agrega filtros, búsquedas, proyecciones, ordenamiento, paginación y pipelines de agregación con relaciones entre colecciones.

## Archivos agregados

```text
backend/
├── controllers/
│   └── consultas.controller.js
├── routes/
│   └── consultas.routes.js
├── docs/
│   └── Aeropuerto-Consultas.postman_collection.json
├── CONSULTAS-BACKEND.md
└── index.js                     # se montó /consultas
```

## Operadores y técnicas demostradas

- Filtros con `$match` y consultas por parámetros.
- Búsquedas seguras con expresiones regulares escapadas.
- Proyecciones de campos.
- Ordenamiento y paginación.
- Relaciones con `$lookup`.
- Conversión de arreglos con `$unwind`.
- Transformación de respuestas con `$project`.
- Estadísticas con `$group`, `$avg`, `$cond`, `$addToSet` y `$size`.
- Consultas múltiples con `$facet`.
- Rankings con `$sort` y `$limit`.

## 1. Iniciar el servidor

Desde la carpeta raíz del repositorio:

```bash
npm install
npm run dev
```

El backend debe indicar:

```text
Conectado correctamente a MongoDB Atlas
Servidor iniciado en http://localhost:3001
```

## 2. Obtener un token

Todas las rutas de consultas requieren un token JWT.

```http
POST http://localhost:3001/auth/login
Content-Type: application/json
```

```json
{
  "correo": "admin@aeropuerto.com",
  "password": "admin123"
}
```

Copia el valor de `token`. En Postman abre la pestaña **Authorization**, selecciona **Bearer Token** y pégalo.

## 3. Endpoints

### A. Vuelos con filtros, proyección y paginación

```http
GET /consultas/vuelos
```

Parámetros disponibles:

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `buscar` | `mex` | Busca en vuelo, aerolínea, origen y destino |
| `estado` | `programado` | Estado exacto del vuelo |
| `origen` | `GDL` | Código IATA o ciudad de origen |
| `destino` | `MEX` | Código IATA o ciudad de destino |
| `aerolinea` | `Aeromexico` | Nombre o código IATA |
| `desde` | `2026-07-01` | Fecha mínima de salida |
| `hasta` | `2026-07-31T23:59:59` | Fecha máxima de salida |
| `pagina` | `1` | Página solicitada |
| `limite` | `10` | Resultados por página, máximo 100 |
| `ordenar` | `horaSalida` | Campo de ordenamiento |
| `direccion` | `asc` o `desc` | Dirección del orden |
| `campos` | `numeroVuelo,estado,horaSalida` | Proyección de campos permitidos |

Ejemplo:

```http
GET http://localhost:3001/consultas/vuelos?estado=programado&origen=GDL&pagina=1&limite=5&ordenar=horaSalida&direccion=asc&campos=numeroVuelo,aerolinea,origen,destino,horaSalida,estado
```

### B. Vuelos detallados con `$lookup`

```http
GET /consultas/vuelos/detalle
```

Relaciona cada vuelo con:

- `aerolineas`
- `aeropuertos` para el origen
- `aeropuertos` para el destino

También calcula `duracionMinutos`.

Ejemplo:

```http
GET http://localhost:3001/consultas/vuelos/detalle?buscar=MEX&limite=10
```

### C. Reservas detalladas con múltiples `$lookup`

```http
GET /consultas/reservas/detalle
```

Parámetros: `buscar`, `clase`, `registrado`, `vuelo`, `desde`, `hasta`, `pagina`, `limite`, `ordenar`, `direccion`.

Relaciona cada reserva con:

- pasajero
- vuelo
- aerolínea
- aeropuerto de origen
- aeropuerto de destino

Ejemplo:

```http
GET http://localhost:3001/consultas/reservas/detalle?clase=economica&registrado=false&pagina=1&limite=10
```

### D. Estadísticas de vuelos

```http
GET /consultas/estadisticas/vuelos
```

Devuelve:

- resumen general
- vuelos por estado
- aerolíneas con más vuelos
- destinos más frecuentes
- vuelos agrupados por día
- duración promedio

Ejemplo:

```http
GET http://localhost:3001/consultas/estadisticas/vuelos?desde=2026-01-01&hasta=2026-12-31&limite=5
```

### E. Estadísticas de reservas

```http
GET /consultas/estadisticas/reservas
```

Devuelve:

- total de reservas
- pasajeros registrados y pendientes
- porcentaje de check-in
- reservas por clase
- vuelos más reservados
- asientos ocupados por vuelo

Ejemplo:

```http
GET http://localhost:3001/consultas/estadisticas/reservas?limite=5
```

### F. Búsqueda global

```http
GET /consultas/busqueda-global?q=...
```

Busca al mismo tiempo en vuelos, pasajeros, empleados, aerolíneas, aeropuertos, puertas y reservas.

Ejemplo:

```http
GET http://localhost:3001/consultas/busqueda-global?q=MEX&limite=5
```

## 4. Pruebas sugeridas para la exposición

1. Inicia sesión y copia el token.
2. Prueba `/consultas/vuelos?estado=programado` para demostrar `$match`.
3. Prueba `/consultas/vuelos?campos=numeroVuelo,estado,horaSalida` para demostrar proyección.
4. Prueba `/consultas/vuelos/detalle` para demostrar tres `$lookup`.
5. Prueba `/consultas/reservas/detalle` para demostrar relaciones entre cinco colecciones.
6. Prueba `/consultas/estadisticas/vuelos` para demostrar `$facet` y `$group`.
7. Prueba `/consultas/estadisticas/reservas` para demostrar `$addToSet`, `$size` y un `$lookup` dentro del ranking.
8. Prueba `/consultas/busqueda-global?q=MEX` para demostrar búsqueda en todas las colecciones.

## 5. Posibles errores

### 401 — Falta el token

```json
{ "mensaje": "No autorizado. Falta el token" }
```

Agrega `Authorization: Bearer TU_TOKEN`.

### 400 — Valor inválido

Ejemplo: `estado=inventado`, `registrado=talvez` o una fecha incorrecta.

### Resultado vacío

No es un error. Significa que los filtros no encontraron documentos en Atlas.

## 6. Subir esta parte a GitHub

Desde la raíz del repositorio:

```bash
git status
git add backend/controllers/consultas.controller.js backend/routes/consultas.routes.js backend/docs/Aeropuerto-Consultas.postman_collection.json backend/CONSULTAS-BACKEND.md backend/index.js
git commit -m "Agregar filtros, búsquedas y agregaciones del backend"
git pull --rebase origin main
git push origin main
```

Si el equipo trabaja con ramas, usa una rama propia:

```bash
git checkout -b backend-consultas
git add backend
git commit -m "Agregar módulo de consultas y agregaciones"
git push -u origin backend-consultas
```

Después crea un Pull Request hacia `main`.
