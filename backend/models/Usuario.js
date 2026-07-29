const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    apellidoPaterno: { type: String, trim: true, default: "" },
    apellidoMaterno: { type: String, trim: true, default: "" },
    correo: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    fechaNacimiento: { type: Date },
    telefono: { type: String, trim: true, default: "" },
    genero: { type: String, enum: ["femenino", "masculino", "otro", "prefiero_no_decir"], default: "prefiero_no_decir" },
    aceptoTerminos: { type: Boolean, default: false },
    rol: { type: String, enum: ["pasajero", "agente", "administrador"], required: true, default: "pasajero" }
}, { timestamps: true, versionKey: false });

// Antes de guardar, si el password cambió, lo hashea automáticamente
usuarioSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Método para comparar el password que mandan en login vs el hasheado en la BD
usuarioSchema.methods.compararPassword = function (passwordIngresado) {
    return bcrypt.compare(passwordIngresado, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");