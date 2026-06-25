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
exports.modulosControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class ModulosControlador {
    ObtenerModulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const MODULOS = yield database_1.default.query(`
                SELECT * FROM modulo ORDER BY id_modulo ASC;
                `);
                if (MODULOS.rowCount !== null) {
                    if (MODULOS.rowCount > 0) {
                        return res.jsonp(MODULOS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    ObtenerModulosActivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const MODULOS = yield database_1.default.query(`
                SELECT DISTINCT
                    lm.id_licencia_modulo,
                    lm.id_licencia,
                    lm.id_modulo,
                    m.codigo,
                    m.nombre,
                    m.descripcion,
                    lm.activo,
                    lm.fecha_activacion,
                    lm.fecha_desactivacion,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM licencia_modulo lm
                INNER JOIN licencia l 
                    ON l.id_licencia = lm.id_licencia
                INNER JOIN modulo m
                    ON m.id_modulo = lm.id_modulo
                WHERE l.id_empresa = $1
                    AND lm.activo IS TRUE
                    AND l.estado = 'ACTIVA'
                ORDER BY m.nombre;
                `, [id_empresa]);
                return res.jsonp(MODULOS.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    GuardarLicenciaModulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const id_licencia_ = req.body.id_licencia;
            const modulos_ = req.body.modulos;
            const usuario_registra_ = (_a = req.body.usuario_registra) !== null && _a !== void 0 ? _a : 'SISTEMA';
            const client = yield database_1.default.connect();
            try {
                if (!id_licencia_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la licencia.'
                    });
                }
                if (!Array.isArray(modulos_) || modulos_.length === 0) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar al menos un módulo.'
                    });
                }
                yield client.query('BEGIN');
                const registrosAnteriores = yield client.query(`
            SELECT 
                lm.id_modulo,
                lm.activo,
                m.codigo,
                m.nombre
            FROM public.licencia_modulo lm
            INNER JOIN public.modulo m
                ON m.id_modulo = lm.id_modulo
            WHERE lm.id_licencia = $1;
            `, [id_licencia_]);
                const mapaAnteriores = new Map();
                for (const registro of registrosAnteriores.rows) {
                    mapaAnteriores.set(Number(registro.id_modulo), registro);
                }
                for (const modulo of modulos_) {
                    const idModulo = Number(modulo.id_modulo);
                    const activoNuevo = modulo.activo === true;
                    const registroAnterior = mapaAnteriores.get(idModulo);
                    const datosModulo = yield client.query(`
                SELECT 
                    codigo,
                    nombre
                FROM public.modulo
                WHERE id_modulo = $1;
                `, [idModulo]);
                    const nombreModulo = (_c = (_b = datosModulo.rows[0]) === null || _b === void 0 ? void 0 : _b.nombre) !== null && _c !== void 0 ? _c : `Módulo ${idModulo}`;
                    yield client.query(`
                INSERT INTO public.licencia_modulo (
                    id_licencia,
                    id_modulo,
                    activo,
                    fecha_activacion,
                    fecha_desactivacion,
                    fecha_creacion,
                    fecha_actualizacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    CASE WHEN $3 = true THEN now() ELSE NULL END,
                    CASE WHEN $3 = false THEN now() ELSE NULL END,
                    now(),
                    now()
                )
                ON CONFLICT (id_licencia, id_modulo)
                DO UPDATE SET
                    activo = EXCLUDED.activo,
                    fecha_activacion = CASE
                        WHEN EXCLUDED.activo = true AND licencia_modulo.activo = false THEN now()
                        WHEN EXCLUDED.activo = true AND licencia_modulo.fecha_activacion IS NULL THEN now()
                        WHEN EXCLUDED.activo = false THEN NULL
                        ELSE licencia_modulo.fecha_activacion
                    END,
                    fecha_desactivacion = CASE
                        WHEN EXCLUDED.activo = false AND licencia_modulo.activo = true THEN now()
                        WHEN EXCLUDED.activo = false AND licencia_modulo.fecha_desactivacion IS NULL THEN now()
                        WHEN EXCLUDED.activo = true THEN NULL
                        ELSE licencia_modulo.fecha_desactivacion
                    END,
                    fecha_actualizacion = now()
                RETURNING 
                    id_licencia_modulo,
                    id_licencia,
                    id_modulo,
                    activo;
                `, [
                        id_licencia_,
                        idModulo,
                        activoNuevo
                    ]);
                    if (!registroAnterior) {
                        yield this.RegistrarMovimientoLicencia(client, {
                            id_licencia: Number(id_licencia_),
                            tipo_movimiento: 'REGISTRO_MODULO',
                            entidad_afectada: 'licencia_modulo',
                            campo_modificado: nombreModulo,
                            valor_anterior: null,
                            valor_nuevo: String(activoNuevo),
                            usuario_registra: usuario_registra_,
                            observacion: `Registro inicial del módulo ${nombreModulo}.`
                        });
                        continue;
                    }
                    const activoAnterior = registroAnterior.activo === true;
                    if (activoAnterior !== activoNuevo) {
                        yield this.RegistrarMovimientoLicencia(client, {
                            id_licencia: Number(id_licencia_),
                            tipo_movimiento: 'ACTUALIZACION_MODULO',
                            entidad_afectada: 'licencia_modulo',
                            campo_modificado: nombreModulo,
                            valor_anterior: String(activoAnterior),
                            valor_nuevo: String(activoNuevo),
                            usuario_registra: usuario_registra_,
                            observacion: `Cambio de estado del módulo ${nombreModulo}.`
                        });
                    }
                }
                yield client.query('COMMIT');
                return res.jsonp({
                    message: 'Registros actualizados.'
                });
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
            finally {
                client.release();
            }
        });
    }
    ObtenerTodosModulosLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const MODULOS = yield database_1.default.query(`
                SELECT
                    lm.id_licencia_modulo,
                    lm.id_licencia,
	                l.estado,
                    lm.id_modulo,
                    m.codigo,
                    m.nombre,
                    m.descripcion,
                    lm.activo,
                    lm.fecha_activacion,
                    lm.fecha_desactivacion,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM licencia_modulo lm
                INNER JOIN licencia l 
                    ON l.id_licencia = lm.id_licencia
                INNER JOIN modulo m
                    ON m.id_modulo = lm.id_modulo
                WHERE l.id_empresa = $1
                ORDER BY l.estado ASC, lm.id_licencia ASC, m.id_modulo ASC;
                `, [id_empresa]);
                return res.jsonp(MODULOS.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
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
}
exports.modulosControlador = new ModulosControlador;
exports.default = exports.modulosControlador;
