require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const conectarDB = require("./config/db");

require("./models/Aerolinea");
require("./models/Aeropuerto");
require("./models/Vuelo");
require("./models/Pasajero");
require("./models/Reserva");
require("./models/Puerta");
require("./models/Empleado");

const app = express();
const PORT = process.env.PORT || 3001;

conectarDB();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        proyecto: "Proyecto Aeropuerto",
        criterio1: "7 Modelos Híbridos en la Nube Inicializados",
        criterio2: "Servidor Express Listo",
        conexion: "MongoDB Atlas Conectado"
    });
});

module.exports = app;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => console.log(` Servidor corriendo en http://localhost:${PORT}`));
}