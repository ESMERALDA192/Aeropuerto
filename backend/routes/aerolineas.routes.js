const express = require("express");
const router = express.Router();
const Aerolinea = require("../models/Aerolinea");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET /aerolineas — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const aerolineas = await Aerolinea.find();
        res.json(aerolineas);
    } catch (error) {
        next(error);
    }
});

// GET /aerolineas/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const aerolinea = await Aerolinea.findById(req.params.id);
        if (!aerolinea) return res.status(404).json({ mensaje: "Aerolínea no encontrada" });
        res.json(aerolinea);
    } catch (error) {
        next(error);
    }
});

// POST /aerolineas — solo administrador
router.post("/", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, codigoIata, pais } = req.body;

        if (!nombre || !codigoIata || !pais) {
            return res.status(400).json({ mensaje: "Faltan datos de la aerolínea (nombre, codigoIata, pais)" });
        }

        const nuevaAerolinea = new Aerolinea({ nombre, codigoIata, pais });
        const aerolineaGuardada = await nuevaAerolinea.save();

        res.status(201).json({ mensaje: "Aerolínea registrada correctamente", aerolinea: aerolineaGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT /aerolineas/:id — solo administrador
router.put("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, codigoIata, pais } = req.body;

        if (!nombre || !codigoIata || !pais) {
            return res.status(400).json({ mensaje: "Faltan datos de la aerolínea (nombre, codigoIata, pais)" });
        }

        const aerolineaActualizada = await Aerolinea.findByIdAndUpdate(
            req.params.id,
            { nombre, codigoIata, pais },
            { new: true, runValidators: true }
        );

        if (!aerolineaActualizada) return res.status(404).json({ mensaje: "Aerolínea no encontrada" });

        res.json({ mensaje: "Aerolínea actualizada correctamente", aerolinea: aerolineaActualizada });
    } catch (error) {
        next(error);
    }
});

// DELETE /aerolineas/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const aerolineaEliminada = await Aerolinea.findByIdAndDelete(req.params.id);
        if (!aerolineaEliminada) return res.status(404).json({ mensaje: "Aerolínea no encontrada" });
        res.json({ mensaje: "Aerolínea eliminada correctamente", aerolinea: aerolineaEliminada });
    } catch (error) {
        next(error);
    }
});

module.exports = router;