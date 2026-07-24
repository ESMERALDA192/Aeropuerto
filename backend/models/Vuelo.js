const mongoose = require("mongoose");
const vueloSchema = new mongoose.Schema({
    numeroVuelo: { type: String, required: true, unique: true, trim: true, uppercase: true },
    aerolinea: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Aerolinea", required: true },
        nombre: { type: String, required: true },
        codigoIata: { type: String, required: true }
    },
    origen: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Aeropuerto", required: true },
        codigoIata: { type: String, required: true },
        ciudad: { type: String, required: true }
    },
    destino: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Aeropuerto", required: true },
        codigoIata: { type: String, required: true },
        ciudad: { type: String, required: true }
    },
    horaSalida: { type: Date, required: true },
    horaLlegada: { type: Date, required: true },
    estado: { type: String, enum: ["programado", "retrasado", "abordando", "despegado", "cancelado"], default: "programado" }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Vuelo", vueloSchema, "vuelos");