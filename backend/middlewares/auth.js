const jwt = require("jsonwebtoken");

// Verifica que venga un token válido en el header Authorization: Bearer TOKEN
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ mensaje: "No autorizado. Falta el token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // queda disponible en las siguientes rutas: req.usuario.rol, req.usuario.id
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}

// Uso: verificarRol("administrador") o verificarRol("administrador", "agente")
function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" });
        }
        next();
    };
}

module.exports = { verificarToken, verificarRol };