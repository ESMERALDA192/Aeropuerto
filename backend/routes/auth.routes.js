const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const Pasajero = require("../models/Pasajero");

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
            documento
        } = req.body;

        if (!correo || !password || !nombre || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento || !telefono || !genero || !documento) {
            return res.status(400).json({
                mensaje: "Faltan datos obligatorios del registro (correo, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, telefono, genero, documento)"
            });
        }

        if (!GENEROS_VALIDOS.includes(genero)) {
            return res.status(400).json({ mensaje: `El género debe ser uno de: ${GENEROS_VALIDOS.join(", ")}` });
        }

     

        if (password.length < 6) {
            return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
        }

        const yaExiste = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
        if (yaExiste) {
            return res.status(409).json({ mensaje: "Ya existe una cuenta registrada con ese correo" });
        }

        const documentoYaExiste = await Pasajero.findOne({ documento: documento.trim() });
        if (documentoYaExiste) {
            return res.status(409).json({ mensaje: "Ya existe un pasajero registrado con ese documento" });
        }

        // 1) Crear el pasajero
        const nuevoPasajero = await Pasajero.create({
            nombre,
            apellido: `${apellidoPaterno} ${apellidoMaterno}`.trim(),
            documento: documento.trim(),
            correo: correo.toLowerCase().trim(),
            telefono
        });

        // 2) Crear el usuario, ya vinculado a ese pasajero
        const nuevoUsuario = new Usuario({
            correo,
            password,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            fechaNacimiento,
            telefono,
            genero,
            rol: "pasajero",
            pasajero: nuevoPasajero._id
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
                rol: usuarioGuardado.rol,
                pasajero: nuevoPasajero
            }
        });
    } catch (error) {
        // Si falla la creación del Usuario después de crear el Pasajero, evitamos dejar un pasajero huérfano
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe una cuenta o pasajero registrado con esos datos" });
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

        const usuario = await Usuario.findOne({ correo }).populate("pasajero");
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
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                pasajero: usuario.pasajero
            }
        });
    } catch (error) {
        next(error);
    }
});

console.log("✅ auth.routes.js cargado correctamente");
module.exports = router;