const mongoose = require("mongoose");
const aerolineaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    codigoIata: { type: String, required: true, unique: true, trim: true, uppercase: true },
    pais: { type: String, required: true, trim: true }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Aerolinea", aerolineaSchema, "aerolineas");