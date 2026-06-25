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
exports.licenciaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const rsa_keys_service_1 = require("../llaves/rsa-keys.service");
class LicenciaControlador {
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
    RegistrarLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const id_empresa_ = req.body.id_empresa;
            const empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
            const empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;
            const observacion_ = (_a = req.body.observacion) !== null && _a !== void 0 ? _a : null;
            const usuario_registra_ = (_b = req.body.usuario_registra) !== null && _b !== void 0 ? _b : 'SISTEMA';
            const client = yield database_1.default.connect();
            try {
                if (!id_empresa_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la empresa.'
                    });
                }
                const licencia_datos = {
                    id_empresa: id_empresa_,
                    fecha_activacion: empresa_licencia_fecha_activacion_,
                    fecha_desactivacion: empresa_licencia_fecha_desactivacion_
                };
                const jsonEncriptado = rsa_keys_service_1.FUNCIONES_LLAVES.encriptarDatos(JSON.stringify(licencia_datos));
                if (jsonEncriptado === null) {
                    return res.status(500).jsonp({ message: 'error' });
                }
                yield client.query('BEGIN');
                const response = yield client.query(`
                INSERT INTO public.licencia (
                    id_empresa,
                    llave_publica,
                    fecha_activacion,
                    fecha_desactivacion,
                    observacion
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
                `, [
                    licencia_datos.id_empresa,
                    jsonEncriptado,
                    licencia_datos.fecha_activacion,
                    licencia_datos.fecha_desactivacion,
                    observacion_
                ]);
                const [registro_licencia] = response.rows;
                if (!registro_licencia) {
                    yield client.query('ROLLBACK');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield this.RegistrarMovimientoLicencia(client, {
                    id_licencia: registro_licencia.id_licencia,
                    tipo_movimiento: 'REGISTRO_LICENCIA',
                    entidad_afectada: 'licencia',
                    campo_modificado: null,
                    valor_anterior: null,
                    valor_nuevo: JSON.stringify({
                        estado: registro_licencia.estado,
                        fecha_activacion: registro_licencia.fecha_activacion,
                        fecha_desactivacion: registro_licencia.fecha_desactivacion,
                        observacion: registro_licencia.observacion
                    }),
                    usuario_registra: usuario_registra_,
                    observacion: 'Registro inicial de licencia.'
                });
                yield client.query('COMMIT');
                return res.status(200).jsonp({
                    message: 'ok',
                    data: registro_licencia
                });
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.log('ver error ', error);
                if (error.code === '23505') {
                    return res.status(409).jsonp({
                        message: 'Ya existe una licencia activa para esta empresa.'
                    });
                }
                return res.status(500).jsonp({ message: 'error' });
            }
            finally {
                client.release();
            }
        });
    }
    ActualizarLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const id_licencia_ = req.body.id_empresa_licencia;
            const estado_ = req.body.estado;
            const empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
            const empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;
            const observacion_ = (_a = req.body.observacion) !== null && _a !== void 0 ? _a : null;
            const usuario_registra_ = (_b = req.body.usuario_registra) !== null && _b !== void 0 ? _b : 'SISTEMA';
            const client = yield database_1.default.connect();
            try {
                if (!id_licencia_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la licencia.'
                    });
                }
                yield client.query('BEGIN');
                const licenciaAnterior = yield client.query(`
                SELECT *
                FROM public.licencia
                WHERE id_licencia = $1;
                `, [id_licencia_]);
                if (licenciaAnterior.rowCount === 0) {
                    yield client.query('ROLLBACK');
                    return res.status(404).jsonp({
                        message: 'No se encontró la licencia.'
                    });
                }
                const datosAnteriores = licenciaAnterior.rows[0];
                const licencia_datos = {
                    id_empresa: datosAnteriores.id_empresa,
                    fecha_activacion: empresa_licencia_fecha_activacion_,
                    fecha_desactivacion: empresa_licencia_fecha_desactivacion_
                };
                const jsonEncriptado = rsa_keys_service_1.FUNCIONES_LLAVES.encriptarDatos(JSON.stringify(licencia_datos));
                if (jsonEncriptado === null) {
                    yield client.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
                const response = yield client.query(`
                UPDATE public.licencia
                SET
                    estado = $2,
                    llave_publica = $3,
                    fecha_activacion = $4,
                    fecha_desactivacion = $5,
                    observacion = $6,
                    fecha_actualizacion = now()
                WHERE id_licencia = $1
                RETURNING *;
                `, [
                    id_licencia_,
                    estado_,
                    jsonEncriptado,
                    empresa_licencia_fecha_activacion_,
                    empresa_licencia_fecha_desactivacion_,
                    observacion_
                ]);
                const datosActualizados = response.rows[0];
                yield this.RegistrarMovimientosActualizacionLicencia(client, datosAnteriores, datosActualizados, usuario_registra_);
                yield client.query('COMMIT');
                return res.jsonp({
                    message: 'Registro actualizado.',
                    data: datosActualizados
                });
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.log(error);
                if (error.code === '23505') {
                    return res.status(409).jsonp({
                        message: 'Ya existe una licencia activa para esta empresa.'
                    });
                }
                return res.status(500).jsonp({ message: 'error' });
            }
            finally {
                client.release();
            }
        });
    }
    RegistrarMovimientosActualizacionLicencia(client, anterior, actual, usuario_registra) {
        return __awaiter(this, void 0, void 0, function* () {
            const movimientos = [
                {
                    campo: 'estado',
                    valorAnterior: anterior.estado,
                    valorNuevo: actual.estado
                },
                {
                    campo: 'fecha_activacion',
                    valorAnterior: anterior.fecha_activacion,
                    valorNuevo: actual.fecha_activacion
                },
                {
                    campo: 'fecha_desactivacion',
                    valorAnterior: anterior.fecha_desactivacion,
                    valorNuevo: actual.fecha_desactivacion
                },
                {
                    campo: 'observacion',
                    valorAnterior: anterior.observacion,
                    valorNuevo: actual.observacion
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
                        id_licencia: actual.id_licencia,
                        tipo_movimiento: 'ACTUALIZACION_LICENCIA',
                        entidad_afectada: 'licencia',
                        campo_modificado: movimiento.campo,
                        valor_anterior: valorAnterior,
                        valor_nuevo: valorNuevo,
                        usuario_registra,
                        observacion: 'Actualización manual de datos de licencia.'
                    });
                }
            }
        });
    }
    BuscarLicenciaPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const LICENCIAS = yield database_1.default.query(`
                SELECT *
                FROM public.licencia empresa_licencia
                WHERE empresa_licencia.id_empresa = $1
                ORDER BY 
                    CASE 
                        WHEN empresa_licencia.estado = 'ACTIVA' THEN 1
                        WHEN empresa_licencia.estado = 'PENDIENTE' THEN 2
                        WHEN empresa_licencia.estado = 'SUSPENDIDA' THEN 3
                        WHEN empresa_licencia.estado = 'VENCIDA' THEN 4
                        WHEN empresa_licencia.estado = 'CANCELADA' THEN 5
                        ELSE 6
                    END,
                    empresa_licencia.fecha_creacion DESC;
                `, [id]);
                return res.jsonp(LICENCIAS.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
}
exports.licenciaControlador = new LicenciaControlador();
exports.default = exports.licenciaControlador;
