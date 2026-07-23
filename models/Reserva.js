const mongoose = require("mongoose");
const reservaSchema = new mongoose.Schema({
    pasajero: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Pasajero", required: true },
        nombreCompleto: { type: String, required: true },
        documento: { type: String, required: true }
    },
    vuelo: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Vuelo", required: true },
        numeroVuelo: { type: String, required: true },
        horaSalida: { type: Date, required: true }
    },
    asiento: { type: String, required: true },
    clase: { type: String, enum: ["economica", "ejecutiva", "primera"], required: true },
    registrado: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Reserva", reservaSchema, "reservas");