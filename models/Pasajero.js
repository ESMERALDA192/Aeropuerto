const mongoose = require("mongoose");
const pasajeroSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    documento: { type: String, required: true, unique: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Pasajero", pasajeroSchema, "pasajeros");