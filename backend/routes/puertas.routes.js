const express = require("express");
const router = express.Router();
const Puerta = require("../models/Puerta");
const Aeropuerto = require("../models/Aeropuerto");
const { verificarToken, verificarRol } = require("../middlewares/auth");

const ESTADOS_VALIDOS = ["disponible", "ocupada", "mantenimiento"];

// GET /puertas — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const puertas = await Puerta.find();
        res.json(puertas);
    } catch (error) {
        next(error);
    }
});

// GET /puertas/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const puerta = await Puerta.findById(req.params.id);
        if (!puerta) return res.status(404).json({ mensaje: "Puerta no encontrada" });
        res.json(puerta);
    } catch (error) {
        next(error);
    }
});

// POST /puertas — solo administrador
router.post("/", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { numero, terminal, aeropuertoId, estado } = req.body;

        if (!numero || !terminal || !aeropuertoId) {
            return res.status(400).json({ mensaje: "Faltan datos de la puerta (numero, terminal, aeropuertoId)" });
        }

        if (estado && !ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ mensaje: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}` });
        }

        const aeropuerto = await Aeropuerto.findById(aeropuertoId);
        if (!aeropuerto) return res.status(400).json({ mensaje: "La aeropuertoId proporcionada no existe" });

        const nuevaPuerta = new Puerta({
            numero,
            terminal,
            aeropuerto: { id: aeropuerto._id, codigoIata: aeropuerto.codigoIata },
            estado
        });

        const puertaGuardada = await nuevaPuerta.save();

        res.status(201).json({ mensaje: "Puerta registrada correctamente", puerta: puertaGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT /puertas/:id — administrador o agente (puede cambiar el estado operativo)
router.put("/:id", verificarToken, verificarRol("administrador", "agente"), async (req, res, next) => {
    try {
        const { numero, terminal, aeropuertoId, estado } = req.body;

        if (!numero || !terminal || !aeropuertoId) {
            return res.status(400).json({ mensaje: "Faltan datos de la puerta (numero, terminal, aeropuertoId)" });
        }

        if (estado && !ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ mensaje: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}` });
        }

        const aeropuerto = await Aeropuerto.findById(aeropuertoId);
        if (!aeropuerto) return res.status(400).json({ mensaje: "La aeropuertoId proporcionada no existe" });

        const puertaActualizada = await Puerta.findByIdAndUpdate(
            req.params.id,
            {
                numero,
                terminal,
                aeropuerto: { id: aeropuerto._id, codigoIata: aeropuerto.codigoIata },
                estado
            },
            { new: true, runValidators: true }
        );

        if (!puertaActualizada) return res.status(404).json({ mensaje: "Puerta no encontrada" });

        res.json({ mensaje: "Puerta actualizada correctamente", puerta: puertaActualizada });
    } catch (error) {
        next(error);
    }
});

// DELETE /puertas/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const puertaEliminada = await Puerta.findByIdAndDelete(req.params.id);
        if (!puertaEliminada) return res.status(404).json({ mensaje: "Puerta no encontrada" });
        res.json({ mensaje: "Puerta eliminada correctamente", puerta: puertaEliminada });
    } catch (error) {
        next(error);
    }
});

module.exports = router;