require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const conectarDB = require("./config/db");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errorHandler");

const aerolineasRoutes = require("./routes/aerolineas.routes");
const aeropuertosRoutes = require("./routes/aeropuertos.routes");
const empleadosRoutes = require("./routes/empleados.routes");
const pasajerosRoutes = require("./routes/pasajeros.routes");
const puertasRoutes = require("./routes/puertas.routes");
const reservasRoutes = require("./routes/reservas.routes");
const vuelosRoutes = require("./routes/vuelos.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES GLOBALES 
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Se asegura de tener conexión a Mongo antes de procesar cualquier request
app.use(async (req, res, next) => {
    try {
        await conectarDB();
        next();
    } catch (error) {
        next(error);
    }
});

//  RUTA RAÍZ 
app.get("/", (req, res) => {
    res.send("API de Aeropuerto funcionando");
});



// RUTAS REST 
// Se definen las rutas de cada recurso (aerolineas, aeropuertos, empleados, pasajeros, puertas, reservas, vuelos)
// En el archivo correspondiente dentro de la carpeta "routes". Cada ruta tiene su propio router y controlador.
app.use("/aerolineas", aerolineasRoutes);
app.use("/aeropuertos", aeropuertosRoutes);
app.use("/empleados", empleadosRoutes);
app.use("/pasajeros", pasajerosRoutes);
app.use("/puertas", puertasRoutes);
app.use("/reservas", reservasRoutes);
app.use("/vuelos", vuelosRoutes);

//  MANEJO DE ERRORES siempre al final
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

// para correr en local 
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

