const express = require("express");
const router = express.Router();
const Aeropuerto = require("../models/Aeropuerto");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET /aeropuertos — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const aeropuertos = await Aeropuerto.find();
        res.json(aeropuertos);
    } catch (error) {
        next(error);
    }
});

// GET /aeropuertos/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const aeropuerto = await Aeropuerto.findById(req.params.id);
        if (!aeropuerto) return res.status(404).json({ mensaje: "Aeropuerto no encontrado" });
        res.json(aeropuerto);
    } catch (error) {
        next(error);
    }
});

// POST /aeropuertos — solo administrador
router.post("/", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, codigoIata, ciudad, pais, terminales } = req.body;

        if (!nombre || !codigoIata || !ciudad || !pais) {
            return res.status(400).json({ mensaje: "Faltan datos del aeropuerto (nombre, codigoIata, ciudad, pais)" });
        }

        const nuevoAeropuerto = new Aeropuerto({ nombre, codigoIata, ciudad, pais, terminales });
        const aeropuertoGuardado = await nuevoAeropuerto.save();

        res.status(201).json({ mensaje: "Aeropuerto registrado correctamente", aeropuerto: aeropuertoGuardado });
    } catch (error) {
        next(error);
    }
});

// PUT /aeropuertos/:id — solo administrador
router.put("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, codigoIata, ciudad, pais, terminales } = req.body;

        if (!nombre || !codigoIata || !ciudad || !pais) {
            return res.status(400).json({ mensaje: "Faltan datos del aeropuerto (nombre, codigoIata, ciudad, pais)" });
        }

        const aeropuertoActualizado = await Aeropuerto.findByIdAndUpdate(
            req.params.id,
            { nombre, codigoIata, ciudad, pais, terminales },
            { new: true, runValidators: true }
        );

        if (!aeropuertoActualizado) return res.status(404).json({ mensaje: "Aeropuerto no encontrado" });

        res.json({ mensaje: "Aeropuerto actualizado correctamente", aeropuerto: aeropuertoActualizado });
    } catch (error) {
        next(error);
    }
});

// DELETE /aeropuertos/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const aeropuertoEliminado = await Aeropuerto.findByIdAndDelete(req.params.id);
        if (!aeropuertoEliminado) return res.status(404).json({ mensaje: "Aeropuerto no encontrado" });
        res.json({ mensaje: "Aeropuerto eliminado correctamente", aeropuerto: aeropuertoEliminado });
    } catch (error) {
        next(error);
    }
});

module.exports = router;