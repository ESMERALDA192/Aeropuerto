const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const Pasajero = require("../models/Pasajero");
const Vuelo = require("../models/Vuelo");
const { verificarToken, verificarRol } = require("../middlewares/auth");

const CLASES_VALIDAS = ["economica", "ejecutiva", "primera"];

async function construirDatosReserva(body) {
    const { pasajeroId, vueloId, asiento, clase, registrado, equipaje, puertaEmbarque } = body;

    if (!pasajeroId || !vueloId || !asiento || !clase) {
        return { error: "Faltan datos de la reserva (pasajeroId, vueloId, asiento, clase)" };
    }

    if (!CLASES_VALIDAS.includes(clase)) {
        return { error: `La clase debe ser una de: ${CLASES_VALIDAS.join(", ")}` };
    }

    const [pasajero, vuelo] = await Promise.all([
        Pasajero.findById(pasajeroId),
        Vuelo.findById(vueloId)
    ]);

    if (!pasajero) return { error: "La pasajeroId proporcionada no existe" };
    if (!vuelo) return { error: "La vueloId proporcionada no existe" };

    const datos = {
        pasajero: {
            id: pasajero._id,
            nombreCompleto: `${pasajero.nombre} ${pasajero.apellido}`,
            documento: pasajero.documento
        },
        vuelo: {
            id: vuelo._id,
            numeroVuelo: vuelo.numeroVuelo,
            horaSalida: vuelo.horaSalida
        },
        asiento,
        clase,
        registrado
    };

    // Solo actualiza equipaje si viene en el body (evita borrarlo en updates que no lo tocan)
    if (equipaje) {
        datos.equipaje = {
            maletasDocumentadas: Array.isArray(equipaje.maletasDocumentadas) ? equipaje.maletasDocumentadas : [],
            equipajeMano: equipaje.equipajeMano !== undefined ? equipaje.equipajeMano : true
        };
    }

    if (puertaEmbarque !== undefined) {
        datos.puertaEmbarque = puertaEmbarque;
    }

    // Genera un código de boleto la primera vez que se hace check-in
    if (registrado) {
        datos.codigoBoleto = "SKY" + Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    return { datos };
}

// GET /reservas — cualquiera con sesión iniciada puede ver
router.get("/", verificarToken, async (req, res, next) => {
    try {
        const reservas = await Reserva.find();
        res.json(reservas);
    } catch (error) {
        next(error);
    }
});

// GET /reservas/:id — cualquiera con sesión iniciada puede ver
router.get("/:id", verificarToken, async (req, res, next) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        if (!reserva) return res.status(404).json({ mensaje: "Reserva no encontrada" });
        res.json(reserva);
    } catch (error) {
        next(error);
    }
});

// POST /reservas — pasajero, agente o administrador
router.post("/", verificarToken, verificarRol("pasajero", "agente", "administrador"), async (req, res, next) => {
    try {
        const { error, datos } = await construirDatosReserva(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        // Evita que dos reservas del mismo vuelo tengan el mismo asiento
        const asientoOcupado = await Reserva.findOne({
            "vuelo.id": datos.vuelo.id,
            asiento: datos.asiento
        });
        if (asientoOcupado) {
            return res.status(400).json({ mensaje: `El asiento ${datos.asiento} ya está reservado en este vuelo` });
        }

        const nuevaReserva = new Reserva(datos);
        const reservaGuardada = await nuevaReserva.save();

        res.status(201).json({ mensaje: "Reserva registrada correctamente", reserva: reservaGuardada });
    } catch (error) {
        next(error);
    }
});

// PUT /reservas/:id — solo agente o administrador (check-in, cambios de asiento, etc.)
router.put("/:id", verificarToken, verificarRol("agente", "administrador"), async (req, res, next) => {
    try {
        const { error, datos } = await construirDatosReserva(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        const asientoOcupado = await Reserva.findOne({
            _id: { $ne: req.params.id },
            "vuelo.id": datos.vuelo.id,
            asiento: datos.asiento
        });
        if (asientoOcupado) {
            return res.status(400).json({ mensaje: `El asiento ${datos.asiento} ya está reservado en este vuelo` });
        }

        const reservaActualizada = await Reserva.findByIdAndUpdate(
            req.params.id,
            datos,
            { new: true, runValidators: true }
        );

        if (!reservaActualizada) return res.status(404).json({ mensaje: "Reserva no encontrada" });

        res.json({ mensaje: "Reserva actualizada correctamente", reserva: reservaActualizada });
    } catch (error) {
        next(error);
    }
});

// DELETE /reservas/:id — solo agente o administrador (cancelación)
router.delete("/:id", verificarToken, verificarRol("agente", "administrador"), async (req, res, next) => {
    try {
        const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
        if (!reservaEliminada) return res.status(404).json({ mensaje: "Reserva no encontrada" });
        res.json({ mensaje: "Reserva eliminada correctamente", reserva: reservaEliminada });
    } catch (error) {
        next(error);
    }
});

module.exports = router;