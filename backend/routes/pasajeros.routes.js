const express = require("express");
const router = express.Router();
const Pasajero = require("../models/Pasajero");

// GET /pasajeros
router.get("/", async (req, res, next) => {
    try {
        const pasajeros = await Pasajero.find();
        res.json(pasajeros);
    } catch (error) {
        next(error);
    }
});

// GET /pasajeros/:id
router.get("/:id", async (req, res, next) => {
    try {
        const pasajero = await Pasajero.findById(req.params.id);
        if (!pasajero) return res.status(404).json({ mensaje: "Pasajero no encontrado" });
        res.json(pasajero);
    } catch (error) {
        next(error);
    }
});

// POST /pasajeros
router.post("/", async (req, res, next) => {
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

// PUT /pasajeros/:id
router.put("/:id", async (req, res, next) => {
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

// DELETE /pasajeros/:id
router.delete("/:id", async (req, res, next) => {
    try {
        const pasajeroEliminado = await Pasajero.findByIdAndDelete(req.params.id);
        if (!pasajeroEliminado) return res.status(404).json({ mensaje: "Pasajero no encontrado" });
        res.json({ mensaje: "Pasajero eliminado correctamente", pasajero: pasajeroEliminado });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
