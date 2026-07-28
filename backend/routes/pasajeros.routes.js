const express = require("express");
const router = express.Router();
const Pasajero = require("../models/Pasajero");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// GET /pasajeros — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const pasajeros = await Pasajero.find();
        res.json(pasajeros);
    } catch (error) {
        next(error);
    }
});

// GET /pasajeros/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const pasajero = await Pasajero.findById(req.params.id);
        if (!pasajero) return res.status(404).json({ mensaje: "Pasajero no encontrado" });
        res.json(pasajero);
    } catch (error) {
        next(error);
    }
});

// POST /pasajeros — administrador o agente (registro en mostrador)
router.post("/", verificarToken, verificarRol("administrador", "agente", "pasajero"), async (req, res, next) => {
    try {
        const { nombre, apellido, documento, correo, telefono } = req.body;

        if (!nombre || !apellido || !documento || !correo) {
            return res.status(400).json({ mensaje: "Faltan datos del pasajero (nombre, apellido, documento, correo)" });
        }

        const nuevoPasajero = new Pasajero({ nombre, apellido, documento, correo, telefono });
        const pasajeroGuardado = await nuevoPasajero.save();

        res.status(201).json({ mensaje: "Pasajero registrado correctamente", pasajero: pasajeroGuardado });
    } catch (error) {
        next(error);
    }
});

// PUT /pasajeros/:id — administrador o agente
router.put("/:id", verificarToken, verificarRol("administrador", "agente"), async (req, res, next) => {
    try {
        const { nombre, apellido, documento, correo, telefono } = req.body;

        if (!nombre || !apellido || !documento || !correo) {
            return res.status(400).json({ mensaje: "Faltan datos del pasajero (nombre, apellido, documento, correo)" });
        }

        const pasajeroActualizado = await Pasajero.findByIdAndUpdate(
            req.params.id,
            { nombre, apellido, documento, correo, telefono },
            { new: true, runValidators: true }
        );

        if (!pasajeroActualizado) return res.status(404).json({ mensaje: "Pasajero no encontrado" });

        res.json({ mensaje: "Pasajero actualizado correctamente", pasajero: pasajeroActualizado });
    } catch (error) {
        next(error);
    }
});

// DELETE /pasajeros/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const pasajeroEliminado = await Pasajero.findByIdAndDelete(req.params.id);
        if (!pasajeroEliminado) return res.status(404).json({ mensaje: "Pasajero no encontrado" });
        res.json({ mensaje: "Pasajero eliminado correctamente", pasajero: pasajeroEliminado });
    } catch (error) {
        next(error);
    }
});

module.exports = router;