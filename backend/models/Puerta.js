const mongoose = require("mongoose");
const puertaSchema = new mongoose.Schema({
    numero: { type: String, required: true },
    terminal: { type: String, required: true },
    aeropuerto: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Aeropuerto", required: true },
        codigoIata: { type: String, required: true }
    },
    estado: { type: String, enum: ["disponible", "ocupada", "mantenimiento"], default: "disponible" }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Puerta", puertaSchema, "puertas");