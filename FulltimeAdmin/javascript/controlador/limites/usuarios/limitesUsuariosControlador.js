"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiteUsuariosControlador = void 0;
const database_1 = __importDefault(require("../../../database"));
class LimiteUsuariosControlador {
    RegistrarMovimientoLicencia(client, datos) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            yield client.query(`
            INSERT INTO public.licencia_movimiento (
                id_licencia,
                tipo_movimiento,
                entidad_afectada,
                campo_modificado,
                valor_anterior,
                valor_nuevo,
                fecha_movimiento,
                usuario_registra,
                observacion
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                now(),
                $7,
                $8
            );
            `, [
                datos.id_licencia,
                datos.tipo_movimiento,
                datos.entidad_afectada,
                (_a = datos.campo_modificado) !== null && _a !== void 0 ? _a : null,
                (_b = datos.valor_anterior) !== null && _b !== void 0 ? _b : null,
                (_c = datos.valor_nuevo) !== null && _c !== void 0 ? _c : null,
                (_d = datos.usuario_registra) !== null && _d !== void 0 ? _d : null,
                (_e = datos.observacion) !== null && _e !== void 0 ? _e : null
            ]);
        });
    }
    RegistrarLicenciaLimite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const id_licencia_ = req.body.id_licencia;
            const usuarios_web_max_ = Number((_a = req.body.usuarios_web_max) !== null && _a !== void 0 ? _a : 0);
            const usuarios_app_max_ = Number((_b = req.body.usuarios_app_max) !== null && _b !== void 0 ? _b : 0);
            const relojes_max_ = Number((_c = req.body.relojes_max) !== null && _c !== void 0 ? _c : 0);
            const storage_mb_max_ = Number((_d = req.body.storage_mb_max) !== null && _d !== void 0 ? _d : 0);
            const usuario_registra_ = (_e = req.body.usuario_registra) !== null && _e !== void 0 ? _e : 'SISTEMA';
            const client = yield database_1.default.connect();
            try {
                if (!id_licencia_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la licencia.'
                    });
                }
                yield client.query('BEGIN');
                const resultado = yield client.query(`
                INSERT INTO public.licencia_limite (
                    id_licencia,
                    usuarios_web_max,
                    usuarios_app_max,
                    relojes_max,
                    storage_mb_max,
                    fecha_creacion,
                    fecha_actualizacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    now(),
                    now()
                )
                RETURNING *;
                `, [
                    id_licencia_,
                    usuarios_web_max_,
                    usuarios_app_max_,
                    relojes_max_,
                    storage_mb_max_
                ]);
                const limiteRegistrado = resultado.rows[0];
                yield this.RegistrarMovimientoLicencia(client, {
                    id_licencia: Number(id_licencia_),
                    tipo_movimiento: 'REGISTRO_LIMITE',
                    entidad_afectada: 'licencia_limite',
                    campo_modificado: null,
                    valor_anterior: null,
                    valor_nuevo: JSON.stringify({
                        usuarios_web_max: limiteRegistrado.usuarios_web_max,
                        usuarios_app_max: limiteRegistrado.usuarios_app_max,
                        relojes_max: limiteRegistrado.relojes_max,
                        storage_mb_max: limiteRegistrado.storage_mb_max
                    }),
                    usuario_registra: usuario_registra_,
                    observacion: 'Registro inicial de límites de licencia.'
                });
                yield client.query('COMMIT');
                return res.jsonp({
                    message: 'Registro guardado.',
                    data: limiteRegistrado
                });
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.log(error);
                if (error.code === '23505') {
                    return res.status(409).jsonp({
                        message: 'Ya existen límites registrados para esta licencia.'
                    });
                }
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
            finally {
                client.release();
            }
        });
    }
    ActualizarLicenciaLimite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const id_licencia_limite_ = req.body.id_licencia_limite;
            const id_licencia_ = req.body.id_licencia;
            const usuarios_web_max_ = Number((_a = req.body.usuarios_web_max) !== null && _a !== void 0 ? _a : 0);
            const usuarios_app_max_ = Number((_b = req.body.usuarios_app_max) !== null && _b !== void 0 ? _b : 0);
            const relojes_max_ = Number((_c = req.body.relojes_max) !== null && _c !== void 0 ? _c : 0);
            const storage_mb_max_ = Number((_d = req.body.storage_mb_max) !== null && _d !== void 0 ? _d : 0);
            const usuario_registra_ = (_e = req.body.usuario_registra) !== null && _e !== void 0 ? _e : 'SISTEMA';
            const client = yield database_1.default.connect();
            try {
                if (!id_licencia_limite_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar el registro de límite.'
                    });
                }
                if (!id_licencia_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la licencia.'
                    });
                }
                yield client.query('BEGIN');
                const consultaAnterior = yield client.query(`
                SELECT *
                FROM public.licencia_limite
                WHERE id_licencia_limite = $1;
                `, [id_licencia_limite_]);
                if (consultaAnterior.rowCount === 0) {
                    yield client.query('ROLLBACK');
                    return res.status(404).jsonp({
                        message: 'No se encontró el registro de límites.'
                    });
                }
                const limiteAnterior = consultaAnterior.rows[0];
                const resultado = yield client.query(`
                UPDATE public.licencia_limite
                SET
                    id_licencia = $1,
                    usuarios_web_max = $2,
                    usuarios_app_max = $3,
                    relojes_max = $4,
                    storage_mb_max = $5,
                    fecha_actualizacion = now()
                WHERE id_licencia_limite = $6
                RETURNING *;
                `, [
                    id_licencia_,
                    usuarios_web_max_,
                    usuarios_app_max_,
                    relojes_max_,
                    storage_mb_max_,
                    id_licencia_limite_
                ]);
                const limiteActualizado = resultado.rows[0];
                yield this.RegistrarMovimientosActualizacionLimite(client, limiteAnterior, limiteActualizado, usuario_registra_);
                yield client.query('COMMIT');
                return res.jsonp({
                    message: 'Registro actualizado.',
                    data: limiteActualizado
                });
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.log(error);
                if (error.code === '23505') {
                    return res.status(409).jsonp({
                        message: 'Ya existen límites registrados para esta licencia.'
                    });
                }
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
            finally {
                client.release();
            }
        });
    }
    RegistrarMovimientosActualizacionLimite(client, anterior, actual, usuario_registra) {
        return __awaiter(this, void 0, void 0, function* () {
            const movimientos = [
                {
                    campo: 'usuarios_web_max',
                    valorAnterior: anterior.usuarios_web_max,
                    valorNuevo: actual.usuarios_web_max
                },
                {
                    campo: 'usuarios_app_max',
                    valorAnterior: anterior.usuarios_app_max,
                    valorNuevo: actual.usuarios_app_max
                },
                {
                    campo: 'relojes_max',
                    valorAnterior: anterior.relojes_max,
                    valorNuevo: actual.relojes_max
                },
                {
                    campo: 'storage_mb_max',
                    valorAnterior: anterior.storage_mb_max,
                    valorNuevo: actual.storage_mb_max
                }
            ];
            for (const movimiento of movimientos) {
                const valorAnterior = movimiento.valorAnterior === null || movimiento.valorAnterior === undefined
                    ? null
                    : String(movimiento.valorAnterior);
                const valorNuevo = movimiento.valorNuevo === null || movimiento.valorNuevo === undefined
                    ? null
                    : String(movimiento.valorNuevo);
                if (valorAnterior !== valorNuevo) {
                    yield this.RegistrarMovimientoLicencia(client, {
                        id_licencia: Number(actual.id_licencia),
                        tipo_movimiento: 'ACTUALIZACION_LIMITE',
                        entidad_afectada: 'licencia_limite',
                        campo_modificado: movimiento.campo,
                        valor_anterior: valorAnterior,
                        valor_nuevo: valorNuevo,
                        usuario_registra,
                        observacion: 'Actualización manual de límites de licencia.'
                    });
                }
            }
        });
    }
    ObtenerLimiteLicenciaActiva(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const LIMITES = yield database_1.default.query(`
                SELECT 
                    lm.id_licencia_limite,
                    lm.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    lm.usuarios_web_max,
                    lm.usuarios_app_max,
                    lm.relojes_max,
                    lm.storage_mb_max,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM public.licencia_limite lm
                INNER JOIN public.licencia l 
                    ON l.id_licencia = lm.id_licencia
                WHERE l.id_empresa = $1
                  AND l.estado = 'ACTIVA';
                `, [id_empresa]);
                return res.jsonp(LIMITES.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
    ObtenerTodosLimitesLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const LIMITES = yield database_1.default.query(`
                SELECT 
                    lm.id_licencia_limite,
                    lm.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    lm.usuarios_web_max,
                    lm.usuarios_app_max,
                    lm.relojes_max,
                    lm.storage_mb_max,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM public.licencia_limite lm
                INNER JOIN public.licencia l 
                    ON l.id_licencia = lm.id_licencia
                WHERE l.id_empresa = $1
                ORDER BY 
                    CASE 
                        WHEN l.estado = 'ACTIVA' THEN 1
                        WHEN l.estado = 'PENDIENTE' THEN 2
                        WHEN l.estado = 'SUSPENDIDA' THEN 3
                        WHEN l.estado = 'VENCIDA' THEN 4
                        WHEN l.estado = 'CANCELADA' THEN 5
                        ELSE 6
                    END,
                    l.fecha_creacion DESC;
                `, [id_empresa]);
                return res.jsonp(LIMITES.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
}
exports.limiteUsuariosControlador = new LimiteUsuariosControlador();
exports.default = exports.limiteUsuariosControlador;
