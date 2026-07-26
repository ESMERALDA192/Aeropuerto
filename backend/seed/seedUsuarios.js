require("dotenv").config();
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");

const usuarios = [
    { nombre: "Administrador General", correo: "admin@aeropuerto.com", password: "admin123", rol: "administrador" },
    { nombre: "Agente de Mostrador", correo: "agente@aeropuerto.com", password: "agente123", rol: "agente" },
    { nombre: "Pasajero Demo", correo: "pasajero@aeropuerto.com", password: "pasajero123", rol: "pasajero" }
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB Atlas");

    for (const datos of usuarios) {
        const existe = await Usuario.findOne({ correo: datos.correo });
        if (existe) {
            console.log(`Ya existe: ${datos.correo}, se omite`);
            continue;
        }
        await Usuario.create(datos);
        console.log(`Usuario creado: ${datos.correo} (${datos.rol})`);
    }

    console.log("Listo, cerrando conexión.");
    await mongoose.connection.close();
}

seed().catch((error) => {
    console.error("ERROR al crear usuarios:", error.message);
    console.error(error);
});