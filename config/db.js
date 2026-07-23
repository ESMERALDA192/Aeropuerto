const mongoose = require("mongoose");

const conectarDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("La variable MONGO_URI no está configurada en el .env");
        }
        await mongoose.connect(mongoURI);
        console.log("MongoDB Atlas Conectado con éxito - Base en la Nube Activa");
    } catch (error) {
        console.error(" Error al conectar a MongoDB Atlas:", error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;