const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/auth");
const {
    consultarVuelos,
    vuelosConRelaciones,
    reservasConRelaciones,
    estadisticasVuelos,
    estadisticasReservas,
    busquedaGlobal
} = require("../controllers/consultas.controller");

// Todas las consultas requieren una sesión válida.
router.use(verificarToken);

// Importante: las rutas específicas se declaran antes que cualquier ruta dinámica.
router.get("/vuelos", consultarVuelos);
router.get("/vuelos/detalle", vuelosConRelaciones);
router.get("/reservas/detalle", reservasConRelaciones);
router.get("/estadisticas/vuelos", estadisticasVuelos);
router.get("/estadisticas/reservas", estadisticasReservas);
router.get("/busqueda-global", busquedaGlobal);

module.exports = router;
