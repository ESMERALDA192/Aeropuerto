const Aerolinea = require("../models/Aerolinea");
const Aeropuerto = require("../models/Aeropuerto");
const Empleado = require("../models/Empleado");
const Pasajero = require("../models/Pasajero");
const Puerta = require("../models/Puerta");
const Reserva = require("../models/Reserva");
const Vuelo = require("../models/Vuelo");

const ESTADOS_VUELO = ["programado", "retrasado", "abordando", "despegado", "cancelado"];
const CLASES_RESERVA = ["economica", "ejecutiva", "primera"];

const CAMPOS_VUELO = new Set([
    "numeroVuelo",
    "aerolinea",
    "origen",
    "destino",
    "horaSalida",
    "horaLlegada",
    "estado",
    "createdAt",
    "updatedAt"
]);

const ORDEN_VUELOS = {
    numeroVuelo: "numeroVuelo",
    aerolinea: "aerolinea.nombre",
    origen: "origen.codigoIata",
    destino: "destino.codigoIata",
    horaSalida: "horaSalida",
    horaLlegada: "horaLlegada",
    estado: "estado",
    createdAt: "createdAt"
};

const ORDEN_RESERVAS = {
    pasajero: "pasajero.nombreCompleto",
    vuelo: "vuelo.numeroVuelo",
    horaSalida: "vuelo.horaSalida",
    asiento: "asiento",
    clase: "clase",
    registrado: "registrado",
    createdAt: "createdAt"
};

function escaparRegex(valor = "") {
    return String(valor).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function regexSeguro(valor) {
    return new RegExp(escaparRegex(String(valor).trim()), "i");
}

function enteroEnRango(valor, predeterminado, minimo, maximo) {
    const numero = Number.parseInt(valor, 10);
    if (!Number.isFinite(numero)) return predeterminado;
    return Math.min(Math.max(numero, minimo), maximo);
}

function direccionOrden(valor) {
    return String(valor).toLowerCase() === "desc" ? -1 : 1;
}

function booleanoQuery(valor) {
    if (valor === undefined) return undefined;
    if (valor === true || valor === "true" || valor === "1") return true;
    if (valor === false || valor === "false" || valor === "0") return false;
    return null;
}

function fechaValida(valor, nombreCampo) {
    if (!valor) return null;
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        const error = new Error(`El parámetro '${nombreCampo}' no contiene una fecha válida`);
        error.status = 400;
        throw error;
    }
    return fecha;
}

function paginacion(query) {
    const pagina = enteroEnRango(query.pagina, 1, 1, 100000);
    const limite = enteroEnRango(query.limite, 10, 1, 100);
    return { pagina, limite, salto: (pagina - 1) * limite };
}

function metadataPaginacion(total, pagina, limite) {
    return {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(Math.ceil(total / limite), 1),
        tieneAnterior: pagina > 1,
        tieneSiguiente: pagina * limite < total
    };
}

function construirFiltroVuelos(query) {
    const filtro = {};

    if (query.estado) {
        const estado = String(query.estado).toLowerCase();
        if (!ESTADOS_VUELO.includes(estado)) {
            const error = new Error(`El estado debe ser uno de: ${ESTADOS_VUELO.join(", ")}`);
            error.status = 400;
            throw error;
        }
        filtro.estado = estado;
    }

    if (query.origen) {
        const regex = regexSeguro(query.origen);
        filtro.$and = [...(filtro.$and || []), {
            $or: [
                { "origen.codigoIata": regex },
                { "origen.ciudad": regex }
            ]
        }];
    }

    if (query.destino) {
        const regex = regexSeguro(query.destino);
        filtro.$and = [...(filtro.$and || []), {
            $or: [
                { "destino.codigoIata": regex },
                { "destino.ciudad": regex }
            ]
        }];
    }

    if (query.aerolinea) {
        const regex = regexSeguro(query.aerolinea);
        filtro.$and = [...(filtro.$and || []), {
            $or: [
                { "aerolinea.nombre": regex },
                { "aerolinea.codigoIata": regex }
            ]
        }];
    }

    if (query.buscar) {
        const regex = regexSeguro(query.buscar);
        filtro.$and = [...(filtro.$and || []), {
            $or: [
                { numeroVuelo: regex },
                { "aerolinea.nombre": regex },
                { "aerolinea.codigoIata": regex },
                { "origen.codigoIata": regex },
                { "origen.ciudad": regex },
                { "destino.codigoIata": regex },
                { "destino.ciudad": regex }
            ]
        }];
    }

    const desde = fechaValida(query.desde, "desde");
    const hasta = fechaValida(query.hasta, "hasta");

    if (desde || hasta) {
        filtro.horaSalida = {};
        if (desde) filtro.horaSalida.$gte = desde;
        if (hasta) filtro.horaSalida.$lte = hasta;
    }

    return filtro;
}

function construirFiltroReservas(query) {
    const filtro = {};

    if (query.clase) {
        const clase = String(query.clase).toLowerCase();
        if (!CLASES_RESERVA.includes(clase)) {
            const error = new Error(`La clase debe ser una de: ${CLASES_RESERVA.join(", ")}`);
            error.status = 400;
            throw error;
        }
        filtro.clase = clase;
    }

    const registrado = booleanoQuery(query.registrado);
    if (registrado === null) {
        const error = new Error("El parámetro 'registrado' debe ser true o false");
        error.status = 400;
        throw error;
    }
    if (registrado !== undefined) filtro.registrado = registrado;

    if (query.vuelo) {
        filtro["vuelo.numeroVuelo"] = regexSeguro(query.vuelo);
    }

    if (query.buscar) {
        const regex = regexSeguro(query.buscar);
        filtro.$or = [
            { "pasajero.nombreCompleto": regex },
            { "pasajero.documento": regex },
            { "vuelo.numeroVuelo": regex },
            { asiento: regex }
        ];
    }

    const desde = fechaValida(query.desde, "desde");
    const hasta = fechaValida(query.hasta, "hasta");
    if (desde || hasta) {
        filtro["vuelo.horaSalida"] = {};
        if (desde) filtro["vuelo.horaSalida"].$gte = desde;
        if (hasta) filtro["vuelo.horaSalida"].$lte = hasta;
    }

    return filtro;
}

function construirProyeccionVuelos(campos) {
    if (!campos) return null;

    const solicitados = String(campos)
        .split(",")
        .map((campo) => campo.trim())
        .filter(Boolean);

    const invalidos = solicitados.filter((campo) => !CAMPOS_VUELO.has(campo));
    if (invalidos.length > 0) {
        const error = new Error(`Campos no permitidos: ${invalidos.join(", ")}`);
        error.status = 400;
        throw error;
    }

    return solicitados.join(" ");
}

// GET /consultas/vuelos
async function consultarVuelos(req, res, next) {
    try {
        const filtro = construirFiltroVuelos(req.query);
        const { pagina, limite, salto } = paginacion(req.query);
        const campoOrden = ORDEN_VUELOS[req.query.ordenar] || "horaSalida";
        const orden = direccionOrden(req.query.direccion);
        const proyeccion = construirProyeccionVuelos(req.query.campos);

        let consulta = Vuelo.find(filtro)
            .sort({ [campoOrden]: orden, _id: 1 })
            .skip(salto)
            .limit(limite)
            .lean();

        if (proyeccion) consulta = consulta.select(proyeccion);

        const [resultados, total] = await Promise.all([
            consulta,
            Vuelo.countDocuments(filtro)
        ]);

        res.json({
            filtrosAplicados: {
                buscar: req.query.buscar || null,
                estado: req.query.estado || null,
                origen: req.query.origen || null,
                destino: req.query.destino || null,
                aerolinea: req.query.aerolinea || null,
                desde: req.query.desde || null,
                hasta: req.query.hasta || null
            },
            orden: { campo: campoOrden, direccion: orden === 1 ? "asc" : "desc" },
            paginacion: metadataPaginacion(total, pagina, limite),
            resultados
        });
    } catch (error) {
        next(error);
    }
}

// GET /consultas/vuelos/detalle
// Usa $match, $lookup, $unwind, $project, $sort y $facet.
async function vuelosConRelaciones(req, res, next) {
    try {
        const filtro = construirFiltroVuelos(req.query);
        const { pagina, limite, salto } = paginacion(req.query);
        const campoOrden = ORDEN_VUELOS[req.query.ordenar] || "horaSalida";
        const orden = direccionOrden(req.query.direccion);

        const pipeline = [
            { $match: filtro },
            {
                $lookup: {
                    from: "aerolineas",
                    localField: "aerolinea.id",
                    foreignField: "_id",
                    as: "aerolineaRelacionada"
                }
            },
            {
                $lookup: {
                    from: "aeropuertos",
                    localField: "origen.id",
                    foreignField: "_id",
                    as: "origenRelacionado"
                }
            },
            {
                $lookup: {
                    from: "aeropuertos",
                    localField: "destino.id",
                    foreignField: "_id",
                    as: "destinoRelacionado"
                }
            },
            { $unwind: { path: "$aerolineaRelacionada", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$origenRelacionado", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$destinoRelacionado", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    numeroVuelo: 1,
                    aerolinea: {
                        id: { $ifNull: ["$aerolineaRelacionada._id", "$aerolinea.id"] },
                        nombre: { $ifNull: ["$aerolineaRelacionada.nombre", "$aerolinea.nombre"] },
                        codigoIata: { $ifNull: ["$aerolineaRelacionada.codigoIata", "$aerolinea.codigoIata"] },
                        pais: "$aerolineaRelacionada.pais"
                    },
                    origen: {
                        id: { $ifNull: ["$origenRelacionado._id", "$origen.id"] },
                        nombre: "$origenRelacionado.nombre",
                        codigoIata: { $ifNull: ["$origenRelacionado.codigoIata", "$origen.codigoIata"] },
                        ciudad: { $ifNull: ["$origenRelacionado.ciudad", "$origen.ciudad"] },
                        pais: "$origenRelacionado.pais"
                    },
                    destino: {
                        id: { $ifNull: ["$destinoRelacionado._id", "$destino.id"] },
                        nombre: "$destinoRelacionado.nombre",
                        codigoIata: { $ifNull: ["$destinoRelacionado.codigoIata", "$destino.codigoIata"] },
                        ciudad: { $ifNull: ["$destinoRelacionado.ciudad", "$destino.ciudad"] },
                        pais: "$destinoRelacionado.pais"
                    },
                    horaSalida: 1,
                    horaLlegada: 1,
                    estado: 1,
                    duracionMinutos: {
                        $round: [{ $divide: [{ $subtract: ["$horaLlegada", "$horaSalida"] }, 60000] }, 0]
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { [campoOrden]: orden, _id: 1 } },
            {
                $facet: {
                    resultados: [{ $skip: salto }, { $limit: limite }],
                    conteo: [{ $count: "total" }]
                }
            }
        ];

        const [respuesta] = await Vuelo.aggregate(pipeline);
        const total = respuesta?.conteo?.[0]?.total || 0;

        res.json({
            consulta: "Vuelos relacionados con aerolíneas y aeropuertos mediante $lookup",
            operadoresMongoDB: ["$match", "$lookup", "$unwind", "$project", "$sort", "$facet"],
            paginacion: metadataPaginacion(total, pagina, limite),
            resultados: respuesta?.resultados || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /consultas/reservas/detalle
// Une la reserva con el pasajero, vuelo, aerolínea y aeropuertos actuales.
async function reservasConRelaciones(req, res, next) {
    try {
        const filtro = construirFiltroReservas(req.query);
        const { pagina, limite, salto } = paginacion(req.query);
        const campoOrden = ORDEN_RESERVAS[req.query.ordenar] || "vuelo.horaSalida";
        const orden = direccionOrden(req.query.direccion);

        const pipeline = [
            { $match: filtro },
            {
                $lookup: {
                    from: "pasajeros",
                    localField: "pasajero.id",
                    foreignField: "_id",
                    as: "pasajeroRelacionado"
                }
            },
            {
                $lookup: {
                    from: "vuelos",
                    localField: "vuelo.id",
                    foreignField: "_id",
                    as: "vueloRelacionado"
                }
            },
            { $unwind: { path: "$pasajeroRelacionado", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$vueloRelacionado", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "aerolineas",
                    localField: "vueloRelacionado.aerolinea.id",
                    foreignField: "_id",
                    as: "aerolineaRelacionada"
                }
            },
            {
                $lookup: {
                    from: "aeropuertos",
                    localField: "vueloRelacionado.origen.id",
                    foreignField: "_id",
                    as: "origenRelacionado"
                }
            },
            {
                $lookup: {
                    from: "aeropuertos",
                    localField: "vueloRelacionado.destino.id",
                    foreignField: "_id",
                    as: "destinoRelacionado"
                }
            },
            { $unwind: { path: "$aerolineaRelacionada", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$origenRelacionado", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$destinoRelacionado", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    pasajero: {
                        id: { $ifNull: ["$pasajeroRelacionado._id", "$pasajero.id"] },
                        nombreCompleto: {
                            $cond: [
                                { $ne: [{ $ifNull: ["$pasajeroRelacionado._id", null] }, null] },
                                {
                                    $trim: {
                                        input: {
                                            $concat: [
                                                { $ifNull: ["$pasajeroRelacionado.nombre", ""] },
                                                " ",
                                                { $ifNull: ["$pasajeroRelacionado.apellido", ""] }
                                            ]
                                        }
                                    }
                                },
                                "$pasajero.nombreCompleto"
                            ]
                        },
                        documento: { $ifNull: ["$pasajeroRelacionado.documento", "$pasajero.documento"] },
                        correo: "$pasajeroRelacionado.correo",
                        telefono: "$pasajeroRelacionado.telefono"
                    },
                    vuelo: {
                        id: { $ifNull: ["$vueloRelacionado._id", "$vuelo.id"] },
                        numeroVuelo: { $ifNull: ["$vueloRelacionado.numeroVuelo", "$vuelo.numeroVuelo"] },
                        horaSalida: { $ifNull: ["$vueloRelacionado.horaSalida", "$vuelo.horaSalida"] },
                        horaLlegada: "$vueloRelacionado.horaLlegada",
                        estado: "$vueloRelacionado.estado",
                        aerolinea: {
                            nombre: { $ifNull: ["$aerolineaRelacionada.nombre", "$vueloRelacionado.aerolinea.nombre"] },
                            codigoIata: { $ifNull: ["$aerolineaRelacionada.codigoIata", "$vueloRelacionado.aerolinea.codigoIata"] }
                        },
                        origen: {
                            codigoIata: { $ifNull: ["$origenRelacionado.codigoIata", "$vueloRelacionado.origen.codigoIata"] },
                            ciudad: { $ifNull: ["$origenRelacionado.ciudad", "$vueloRelacionado.origen.ciudad"] }
                        },
                        destino: {
                            codigoIata: { $ifNull: ["$destinoRelacionado.codigoIata", "$vueloRelacionado.destino.codigoIata"] },
                            ciudad: { $ifNull: ["$destinoRelacionado.ciudad", "$vueloRelacionado.destino.ciudad"] }
                        }
                    },
                    asiento: 1,
                    clase: 1,
                    registrado: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { [campoOrden]: orden, _id: 1 } },
            {
                $facet: {
                    resultados: [{ $skip: salto }, { $limit: limite }],
                    conteo: [{ $count: "total" }]
                }
            }
        ];

        const [respuesta] = await Reserva.aggregate(pipeline);
        const total = respuesta?.conteo?.[0]?.total || 0;

        res.json({
            consulta: "Reservas relacionadas con pasajeros, vuelos, aerolíneas y aeropuertos",
            operadoresMongoDB: ["$match", "$lookup", "$unwind", "$project", "$sort", "$facet"],
            paginacion: metadataPaginacion(total, pagina, limite),
            resultados: respuesta?.resultados || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /consultas/estadisticas/vuelos
async function estadisticasVuelos(req, res, next) {
    try {
        const filtro = construirFiltroVuelos({
            estado: req.query.estado,
            aerolinea: req.query.aerolinea,
            origen: req.query.origen,
            destino: req.query.destino,
            desde: req.query.desde,
            hasta: req.query.hasta
        });
        const limite = enteroEnRango(req.query.limite, 5, 1, 20);

        const [resultado] = await Vuelo.aggregate([
            { $match: filtro },
            {
                $facet: {
                    resumen: [
                        {
                            $group: {
                                _id: null,
                                totalVuelos: { $sum: 1 },
                                programados: { $sum: { $cond: [{ $eq: ["$estado", "programado"] }, 1, 0] } },
                                retrasados: { $sum: { $cond: [{ $eq: ["$estado", "retrasado"] }, 1, 0] } },
                                abordando: { $sum: { $cond: [{ $eq: ["$estado", "abordando"] }, 1, 0] } },
                                despegados: { $sum: { $cond: [{ $eq: ["$estado", "despegado"] }, 1, 0] } },
                                cancelados: { $sum: { $cond: [{ $eq: ["$estado", "cancelado"] }, 1, 0] } },
                                duracionPromedioMinutos: {
                                    $avg: { $divide: [{ $subtract: ["$horaLlegada", "$horaSalida"] }, 60000] }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalVuelos: 1,
                                programados: 1,
                                retrasados: 1,
                                abordando: 1,
                                despegados: 1,
                                cancelados: 1,
                                duracionPromedioMinutos: { $round: ["$duracionPromedioMinutos", 1] }
                            }
                        }
                    ],
                    porEstado: [
                        { $group: { _id: "$estado", cantidad: { $sum: 1 } } },
                        { $sort: { cantidad: -1, _id: 1 } },
                        { $project: { _id: 0, estado: "$_id", cantidad: 1 } }
                    ],
                    porAerolinea: [
                        {
                            $group: {
                                _id: {
                                    codigoIata: "$aerolinea.codigoIata",
                                    nombre: "$aerolinea.nombre"
                                },
                                cantidad: { $sum: 1 }
                            }
                        },
                        { $sort: { cantidad: -1, "_id.nombre": 1 } },
                        { $limit: limite },
                        {
                            $project: {
                                _id: 0,
                                codigoIata: "$_id.codigoIata",
                                aerolinea: "$_id.nombre",
                                cantidad: 1
                            }
                        }
                    ],
                    destinosMasFrecuentes: [
                        {
                            $group: {
                                _id: {
                                    codigoIata: "$destino.codigoIata",
                                    ciudad: "$destino.ciudad"
                                },
                                cantidad: { $sum: 1 }
                            }
                        },
                        { $sort: { cantidad: -1, "_id.ciudad": 1 } },
                        { $limit: limite },
                        {
                            $project: {
                                _id: 0,
                                codigoIata: "$_id.codigoIata",
                                ciudad: "$_id.ciudad",
                                cantidad: 1
                            }
                        }
                    ],
                    vuelosPorDia: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$horaSalida" } },
                                cantidad: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, fecha: "$_id", cantidad: 1 } }
                    ]
                }
            }
        ]);

        res.json({
            consulta: "Estadísticas de vuelos mediante pipeline de agregación",
            operadoresMongoDB: ["$match", "$facet", "$group", "$cond", "$avg", "$project", "$sort", "$limit"],
            resumen: resultado?.resumen?.[0] || {
                totalVuelos: 0,
                programados: 0,
                retrasados: 0,
                abordando: 0,
                despegados: 0,
                cancelados: 0,
                duracionPromedioMinutos: 0
            },
            porEstado: resultado?.porEstado || [],
            porAerolinea: resultado?.porAerolinea || [],
            destinosMasFrecuentes: resultado?.destinosMasFrecuentes || [],
            vuelosPorDia: resultado?.vuelosPorDia || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /consultas/estadisticas/reservas
async function estadisticasReservas(req, res, next) {
    try {
        const filtro = construirFiltroReservas({
            clase: req.query.clase,
            registrado: req.query.registrado,
            vuelo: req.query.vuelo,
            desde: req.query.desde,
            hasta: req.query.hasta
        });
        const limite = enteroEnRango(req.query.limite, 5, 1, 20);

        const [resultado] = await Reserva.aggregate([
            { $match: filtro },
            {
                $facet: {
                    resumen: [
                        {
                            $group: {
                                _id: null,
                                totalReservas: { $sum: 1 },
                                pasajerosRegistrados: { $sum: { $cond: ["$registrado", 1, 0] } },
                                pendientesRegistro: { $sum: { $cond: ["$registrado", 0, 1] } },
                                pasajerosUnicos: { $addToSet: "$pasajero.id" },
                                vuelosUnicos: { $addToSet: "$vuelo.id" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalReservas: 1,
                                pasajerosRegistrados: 1,
                                pendientesRegistro: 1,
                                totalPasajerosUnicos: { $size: "$pasajerosUnicos" },
                                totalVuelosConReservas: { $size: "$vuelosUnicos" },
                                porcentajeCheckIn: {
                                    $cond: [
                                        { $eq: ["$totalReservas", 0] },
                                        0,
                                        {
                                            $round: [
                                                { $multiply: [{ $divide: ["$pasajerosRegistrados", "$totalReservas"] }, 100] },
                                                1
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    porClase: [
                        { $group: { _id: "$clase", cantidad: { $sum: 1 } } },
                        { $sort: { cantidad: -1, _id: 1 } },
                        { $project: { _id: 0, clase: "$_id", cantidad: 1 } }
                    ],
                    porEstadoRegistro: [
                        { $group: { _id: "$registrado", cantidad: { $sum: 1 } } },
                        {
                            $project: {
                                _id: 0,
                                estado: { $cond: ["$_id", "registrado", "pendiente"] },
                                cantidad: 1
                            }
                        },
                        { $sort: { cantidad: -1 } }
                    ],
                    vuelosMasReservados: [
                        {
                            $group: {
                                _id: "$vuelo.id",
                                numeroVueloGuardado: { $first: "$vuelo.numeroVuelo" },
                                horaSalidaGuardada: { $first: "$vuelo.horaSalida" },
                                reservas: { $sum: 1 },
                                asientos: { $addToSet: "$asiento" }
                            }
                        },
                        { $sort: { reservas: -1, numeroVueloGuardado: 1 } },
                        { $limit: limite },
                        {
                            $lookup: {
                                from: "vuelos",
                                localField: "_id",
                                foreignField: "_id",
                                as: "vueloRelacionado"
                            }
                        },
                        { $unwind: { path: "$vueloRelacionado", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 0,
                                vueloId: "$_id",
                                numeroVuelo: { $ifNull: ["$vueloRelacionado.numeroVuelo", "$numeroVueloGuardado"] },
                                horaSalida: { $ifNull: ["$vueloRelacionado.horaSalida", "$horaSalidaGuardada"] },
                                estado: "$vueloRelacionado.estado",
                                origen: "$vueloRelacionado.origen.codigoIata",
                                destino: "$vueloRelacionado.destino.codigoIata",
                                reservas: 1,
                                asientosOcupados: { $size: "$asientos" }
                            }
                        }
                    ]
                }
            }
        ]);

        res.json({
            consulta: "Estadísticas de reservas y vuelos con mayor demanda",
            operadoresMongoDB: ["$match", "$facet", "$group", "$addToSet", "$lookup", "$unwind", "$project", "$sort", "$limit"],
            resumen: resultado?.resumen?.[0] || {
                totalReservas: 0,
                pasajerosRegistrados: 0,
                pendientesRegistro: 0,
                totalPasajerosUnicos: 0,
                totalVuelosConReservas: 0,
                porcentajeCheckIn: 0
            },
            porClase: resultado?.porClase || [],
            porEstadoRegistro: resultado?.porEstadoRegistro || [],
            vuelosMasReservados: resultado?.vuelosMasReservados || []
        });
    } catch (error) {
        next(error);
    }
}

// GET /consultas/busqueda-global?q=...
async function busquedaGlobal(req, res, next) {
    try {
        const termino = String(req.query.q || "").trim();
        if (termino.length < 2) {
            return res.status(400).json({ mensaje: "El parámetro 'q' debe contener al menos 2 caracteres" });
        }

        const limite = enteroEnRango(req.query.limite, 5, 1, 20);
        const regex = regexSeguro(termino);

        const [vuelos, pasajeros, empleados, aerolineas, aeropuertos, puertas, reservas] = await Promise.all([
            Vuelo.find({
                $or: [
                    { numeroVuelo: regex },
                    { "aerolinea.nombre": regex },
                    { "aerolinea.codigoIata": regex },
                    { "origen.codigoIata": regex },
                    { "origen.ciudad": regex },
                    { "destino.codigoIata": regex },
                    { "destino.ciudad": regex }
                ]
            }).select("numeroVuelo aerolinea origen destino horaSalida estado").limit(limite).lean(),
            Pasajero.find({
                $or: [
                    { nombre: regex },
                    { apellido: regex },
                    { documento: regex },
                    { correo: regex },
                    { telefono: regex }
                ]
            }).select("nombre apellido documento correo telefono").limit(limite).lean(),
            Empleado.find({
                $or: [
                    { nombre: regex },
                    { apellido: regex },
                    { numeroEmpleado: regex },
                    { puesto: regex },
                    { "aerolinea.nombre": regex }
                ]
            }).select("nombre apellido numeroEmpleado puesto aerolinea").limit(limite).lean(),
            Aerolinea.find({ $or: [{ nombre: regex }, { codigoIata: regex }, { pais: regex }] })
                .select("nombre codigoIata pais").limit(limite).lean(),
            Aeropuerto.find({ $or: [{ nombre: regex }, { codigoIata: regex }, { ciudad: regex }, { pais: regex }] })
                .select("nombre codigoIata ciudad pais terminales").limit(limite).lean(),
            Puerta.find({
                $or: [
                    { numero: regex },
                    { terminal: regex },
                    { "aeropuerto.codigoIata": regex },
                    { estado: regex }
                ]
            }).select("numero terminal aeropuerto estado").limit(limite).lean(),
            Reserva.find({
                $or: [
                    { "pasajero.nombreCompleto": regex },
                    { "pasajero.documento": regex },
                    { "vuelo.numeroVuelo": regex },
                    { asiento: regex },
                    { clase: regex }
                ]
            }).select("pasajero vuelo asiento clase registrado").limit(limite).lean()
        ]);

        const totalResultados = vuelos.length + pasajeros.length + empleados.length + aerolineas.length
            + aeropuertos.length + puertas.length + reservas.length;

        res.json({
            termino,
            limitePorColeccion: limite,
            totalResultados,
            resultados: {
                vuelos,
                pasajeros,
                empleados,
                aerolineas,
                aeropuertos,
                puertas,
                reservas
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    consultarVuelos,
    vuelosConRelaciones,
    reservasConRelaciones,
    estadisticasVuelos,
    estadisticasReservas,
    busquedaGlobal
};
