const express = require("express");
const router = express.Router();
const Vuelo = require("../models/Vuelo");
const Aerolinea = require("../models/Aerolinea");
const Aeropuerto = require("../models/Aeropuerto");
const { verificarToken, verificarRol } = require("../middlewares/auth");

const ESTADOS_VALIDOS = ["programado", "retrasado", "abordando", "despegado", "cancelado"];

// Arma el objeto del vuelo buscando y validando las 3 relaciones (aerolinea, origen, destino)
async function construirDatosVuelo(body) {
    const { numeroVuelo, aerolineaId, origenId, destinoId, horaSalida, horaLlegada, precio, estado } = body;

    if (!numeroVuelo || !aerolineaId || !origenId || !destinoId || !horaSalida || !horaLlegada || precio === undefined || precio === null || precio === "") {
        return { error: "Faltan datos del vuelo (numeroVuelo, aerolineaId, origenId, destinoId, horaSalida, horaLlegada, precio)" };
    }

    if (isNaN(Number(precio)) || Number(precio) < 0) {
        return { error: "El precio debe ser un número mayor o igual a 0" };
    }

    if (origenId === destinoId) {
        return { error: "El aeropuerto de origen y destino no pueden ser el mismo" };
    }

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        return { error: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}` };
    }

    const [aerolinea, origen, destino] = await Promise.all([
        Aerolinea.findById(aerolineaId),
        Aeropuerto.findById(origenId),
        Aeropuerto.findById(destinoId)
    ]);

    if (!aerolinea) return { error: "La aerolineaId proporcionada no existe" };
    if (!origen) return { error: "La origenId proporcionada no existe" };
    if (!destino) return { error: "La destinoId proporcionada no existe" };

    return {
        datos: {
            numeroVuelo,
            aerolinea: { id: aerolinea._id, nombre: aerolinea.nombre, codigoIata: aerolinea.codigoIata },
            origen: { id: origen._id, codigoIata: origen.codigoIata, ciudad: origen.ciudad, imagenUrl: origen.imagenUrl || "" },
            destino: { id: destino._id, codigoIata: destino.codigoIata, ciudad: destino.ciudad, imagenUrl: destino.imagenUrl || "" },
            horaSalida,
            horaLlegada,
            precio: Number(precio),
            estado
        }
    };
}

// GET /vuelos — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const vuelos = await Vuelo.find();
        res.json(vuelos);
    } catch (error) {
        next(error);
    }
});

// GET /vuelos/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const vuelo = await Vuelo.findById(req.params.id);
        if (!vuelo) return res.status(404).json({ mensaje: "Vuelo no encontrado" });
        res.json(vuelo);
    } catch (error) {
        next(error);
    }
});

// POST /vuelos — solo administrador
router.post("/", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const { error, datos } = await construirDatosVuelo(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        const nuevoVuelo = new Vuelo(datos);
        const vueloGuardado = await nuevoVuelo.save();

        res.status(201).json({ mensaje: "Vuelo registrado correctamente", vuelo: vueloGuardado });
    } catch (error) {
        next(error);
    }
});

// PUT /vuelos/:id — administrador o agente (actualizar estado del vuelo)
router.put("/:id", verificarToken, verificarRol("administrador", "agente"), async (req, res, next) => {
    try {
        const { error, datos } = await construirDatosVuelo(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        const vueloActualizado = await Vuelo.findByIdAndUpdate(
            req.params.id,
            datos,
            { new: true, runValidators: true }
        );

        if (!vueloActualizado) return res.status(404).json({ mensaje: "Vuelo no encontrado" });

        res.json({ mensaje: "Vuelo actualizado correctamente", vuelo: vueloActualizado });
    } catch (error) {
        next(error);
    }
});

// DELETE /vuelos/:id — solo administrador
router.delete("/:id", verificarToken, verificarRol("administrador"), async (req, res, next) => {
    try {
        const vueloEliminado = await Vuelo.findByIdAndDelete(req.params.id);
        if (!vueloEliminado) return res.status(404).json({ mensaje: "Vuelo no encontrado" });
        res.json({ mensaje: "Vuelo eliminado correctamente", vuelo: vueloEliminado });
    } catch (error) {
        next(error);
    }
});

module.exports = router;