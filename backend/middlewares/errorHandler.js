// Se activa cuando ninguna ruta coincidio (404)
function rutaNoEncontrada(req, res, next) {
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Manejador de errores centralizado. Debe ir SIEMPRE al final, después de las rutas.
function manejadorErrores(err, req, res, next) {
    console.error(err);

    // ID de Mongo con formato inválido (ej: /vuelos/123)
    if (err.name === "CastError") {
        return res.status(400).json({ mensaje: "El id proporcionado no tiene un formato válido" });
    }

    // Error de validación de Mongoose (campos requeridos, enum, min/max, etc.)
    if (err.name === "ValidationError") {
        const detalles = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ mensaje: "Error de validación", detalles });
    }

    // Clave duplicada (unique: true) codigoIata, numeroVuelo, documento, etc.
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            mensaje: `Ya existe un registro con ese valor en el campo '${campo}'`,
            valor: err.keyValue[campo]
        });
    }

    res.status(err.status || 500).json({ mensaje: err.message || "Error interno del servidor" });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
