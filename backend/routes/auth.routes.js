const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// POST /auth/login
router.post("/login", async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ mensaje: "Correo y password son obligatorios" });
        }

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const passwordValido = await usuario.compararPassword(password);
        if (!passwordValido) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRA || "8h" }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
        });
    } catch (error) {
        next(error);
    }
});

console.log("✅ auth.routes.js cargado correctamente");
module.exports = router;