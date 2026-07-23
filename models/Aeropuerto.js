const mongoose = require("mongoose");
const aeropuertoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    codigoIata: { type: String, required: true, unique: true, trim: true, uppercase: true },
    ciudad: { type: String, required: true, trim: true },
    pais: { type: String, required: true, trim: true },
    terminales: { type: Number, default: 1 }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Aeropuerto", aeropuertoSchema, "aeropuertos");