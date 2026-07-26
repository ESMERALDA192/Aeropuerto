const express = require("express");
const router = express.Router();
const Empleado = require("../models/Empleado");
const Aerolinea = require("../models/Aerolinea");
const { verificarToken, verificarRol } = require("../middlewares/auth");

const PUESTOS_VALIDOS = ["piloto", "copiloto", "sobrecargo", "personal_tierra", "seguridad"];

// GET /empleados — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        next(error);
    }
});

// GET /empleados/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const empleado = await Empleado.findById(req.params.id);
        if (!empleado) return res.status(404).json({ mensaje: "Empleado no encontrado" });
        res.json(empleado);
    } catch (error) {
        next(error);
    }
});

// POST /empleados — solo administrador
router.post("/", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, apellido, puesto, numeroEmpleado, aerolineaId } = req.body;

        if (!nombre || !apellido || !puesto || !numeroEmpleado) {
            return res.status(400).json({ mensaje: "Faltan datos del empleado (nombre, apellido, puesto, numeroEmpleado)" });
        }

        if (!PUESTOS_VALIDOS.includes(puesto)) {
            return res.status(400).json({ mensaje: `El puesto debe ser uno de: ${PUESTOS_VALIDOS.join(", ")}` });
        }

        const datosEmpleado = { nombre, apellido, puesto, numeroEmpleado };

        if (aerolineaId) {
            const aerolinea = await Aerolinea.findById(aerolineaId);
            if (!aerolinea) return res.status(400).json({ mensaje: "La aerolineaId proporcionada no existe" });
            datosEmpleado.aerolinea = { id: aerolinea._id, nombre: aerolinea.nombre };
        }

        const nuevoEmpleado = new Empleado(datosEmpleado);
        const empleadoGuardado = await nuevoEmpleado.save();

        res.status(201).json({ mensaje: "Empleado registrado correctamente", empleado: empleadoGuardado });
    } catch (error) {
        next(error);
    }
});

// PUT /empleados/:id — solo administrador
router.put("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { nombre, apellido, puesto, numeroEmpleado, aerolineaId } = req.body;

        if (!nombre || !apellido || !puesto || !numeroEmpleado) {
            return res.status(400).json({ mensaje: "Faltan datos del empleado (nombre, apellido, puesto, numeroEmpleado)" });
        }

        if (!PUESTOS_VALIDOS.includes(puesto)) {
            return res.status(400).json({ mensaje: `El puesto debe ser uno de: ${PUESTOS_VALIDOS.join(", ")}` });
        }

        const datosActualizados = { nombre, apellido, puesto, numeroEmpleado };

        if (aerolineaId) {
            const aerolinea = await Aerolinea.findById(aerolineaId);
            if (!aerolinea) return res.status(400).json({ mensaje: "La aerolineaId proporcionada no existe" });
            datosActualizados.aerolinea = { id: aerolinea._id, nombre: aerolinea.nombre };
        }

        const empleadoActualizado = await Empleado.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { new: true, runValidators: true }
        );

        if (!empleadoActualizado) return res.status(404).json({ mensaje: "Empleado no encontrado" });

        res.json({ mensaje: "Empleado actualizado correctamente", empleado: empleadoActualizado });
    } catch (error) {
        next(error);
    }
});

// DELETE /empleados/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const empleadoEliminado = await Empleado.findByIdAndDelete(req.params.id);
        if (!empleadoEliminado) return res.status(404).json({ mensaje: "Empleado no encontrado" });
        res.json({ mensaje: "Empleado eliminado correctamente", empleado: empleadoEliminado });
    } catch (error) {
        next(error);
    }
});

module.exports = router;