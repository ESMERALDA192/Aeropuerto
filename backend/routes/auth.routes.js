const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const GENEROS_VALIDOS = ["femenino", "masculino", "otro", "prefiero_no_decir"];

// POST /auth/register
router.post("/register", async (req, res, next) => {
    try {
        const {
            correo,
            password,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            fechaNacimiento,
            telefono,
            genero,
            aceptoTerminos
        } = req.body;

        if (!correo || !password || !nombre || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento || !telefono || !genero) {
            return res.status(400).json({
                mensaje: "Faltan datos obligatorios del registro (correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, telefono, genero)"
            });
        }

        if (!GENEROS_VALIDOS.includes(genero)) {
            return res.status(400).json({ mensaje: `El género debe ser uno de: ${GENEROS_VALIDOS.join(", ")}` });
        }

        if (!aceptoTerminos) {
            return res.status(400).json({ mensaje: "Debes aceptar los términos y condiciones para crear una cuenta" });
        }

        if (password.length < 6) {
            return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
        }

        const yaExiste = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
        if (yaExiste) {
            return res.status(409).json({ mensaje: "Ya existe una cuenta registrada con ese correo" });
        }

        const nuevoUsuario = new Usuario({
            correo,
            password,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            fechaNacimiento,
            telefono,
            genero,
            aceptoTerminos: true,
            rol: "pasajero" // el auto-registro público siempre crea cuentas de pasajero
        });

        const usuarioGuardado = await nuevoUsuario.save();

        const token = jwt.sign(
            { id: usuarioGuardado._id, rol: usuarioGuardado.rol, nombre: usuarioGuardado.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRA || "8h" }
        );

        res.status(201).json({
            mensaje: "Cuenta creada correctamente",
            token,
            usuario: {
                id: usuarioGuardado._id,
                nombre: usuarioGuardado.nombre,
                correo: usuarioGuardado.correo,
                rol: usuarioGuardado.rol
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe una cuenta registrada con ese correo" });
        }
        next(error);
    }
});

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