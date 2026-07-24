const mongoose = require("mongoose");
const empleadoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    puesto: { type: String, enum: ["piloto", "copiloto", "sobrecargo", "personal_tierra", "seguridad"], required: true },
    aerolinea: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Aerolinea" },
        nombre: { type: String }
    },
    numeroEmpleado: { type: String, required: true, unique: true }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model("Empleado", empleadoSchema, "empleados");