const dns = require("node:dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);
require("dotenv").config();
console.log("JWT_SECRET cargado:", process.env.JWT_SECRET ? "Sí" : "No");


const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

console.log("PASO 1: paquetes base cargados");
    
const conectarDB = require("./config/db");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errorHandler");

console.log("PASO 2: config y middlewares cargados");

const aerolineasRoutes = require("./routes/aerolineas.routes");
const aeropuertosRoutes = require("./routes/aeropuertos.routes");
const empleadosRoutes = require("./routes/empleados.routes");
const pasajerosRoutes = require("./routes/pasajeros.routes");
const puertasRoutes = require("./routes/puertas.routes");   
const reservasRoutes = require("./routes/reservas.routes");
const vuelosRoutes = require("./routes/vuelos.routes");
const consultasRoutes = require("./routes/consultas.routes");

console.log("PASO 3: rutas de recursos y consultas cargadas");

const authRoutes = require("./routes/auth.routes");

console.log("PASO 4: authRoutes cargado, tipo:", typeof authRoutes);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(async (req, res, next) => {
    try {
        await conectarDB();
        next();
    } catch (error) {
        next(error);
    }
});

app.get("/", (req, res) => {
    res.send("API de Aeropuerto funcionando");
});

app.use("/aerolineas", aerolineasRoutes);
app.use("/aeropuertos", aeropuertosRoutes);
app.use("/empleados", empleadosRoutes);
app.use("/pasajeros", pasajerosRoutes);
app.use("/puertas", puertasRoutes);
app.use("/reservas", reservasRoutes);
app.use("/vuelos", vuelosRoutes);
app.use("/consultas", consultasRoutes);

console.log("PASO 5: a punto de montar /auth");
app.use("/auth", authRoutes);
console.log("PASO 6: /auth montado correctamente");

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

if (require.main === module) {
    conectarDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Servidor iniciado en http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("No se pudo iniciar el servidor:", error.message);
            process.exit(1);
        });
}

module.exports = app;