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
exports.limiteAlmacenamientoControlador = void 0;
const database_1 = __importDefault(require("../../../database"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class LimiteAlmacenamientoControlador {
    GuardarLicenciaStorageUso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const id_licencia_ = req.body.id_licencia;
            const storage_mb_usado_ = req.body.storage_mb_usado;
            const origen_calculo_ = (_a = req.body.origen_calculo) !== null && _a !== void 0 ? _a : 'MANUAL';
            const fecha_registro_ = (_b = req.body.fecha_registro) !== null && _b !== void 0 ? _b : null;
            const calculo_exitoso_ = (_c = req.body.calculo_exitoso) !== null && _c !== void 0 ? _c : true;
            const mensaje_error_ = (_d = req.body.mensaje_error) !== null && _d !== void 0 ? _d : null;
            const observacion_ = (_e = req.body.observacion) !== null && _e !== void 0 ? _e : null;
            try {
                if (!id_licencia_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar la licencia.'
                    });
                }
                const resultado = yield database_1.default.query(`
                INSERT INTO public.licencia_storage_uso (
                    id_licencia,
                    storage_mb_usado,
                    origen_calculo,
                    fecha_registro,
                    fecha_calculo,
                    calculo_exitoso,
                    mensaje_error,
                    observacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    COALESCE($4::date, CURRENT_DATE),
                    now(),
                    $5,
                    $6,
                    $7
                )
                ON CONFLICT (id_licencia)
                DO UPDATE SET
                    storage_mb_usado = EXCLUDED.storage_mb_usado,
                    origen_calculo = EXCLUDED.origen_calculo,
                    fecha_registro = EXCLUDED.fecha_registro,
                    fecha_calculo = now(),
                    calculo_exitoso = EXCLUDED.calculo_exitoso,
                    mensaje_error = EXCLUDED.mensaje_error,
                    observacion = EXCLUDED.observacion
                RETURNING *;
                `, [
                    id_licencia_,
                    Number(storage_mb_usado_ !== null && storage_mb_usado_ !== void 0 ? storage_mb_usado_ : 0),
                    origen_calculo_,
                    fecha_registro_,
                    calculo_exitoso_ === true,
                    mensaje_error_,
                    observacion_
                ]);
                return res.jsonp({
                    message: 'Registro actualizado.',
                    data: resultado.rows[0]
                });
            }
            catch (error) {
                console.log(error);
                if (error.code === '23514') {
                    return res.status(400).jsonp({
                        message: 'Los datos enviados no cumplen las validaciones de storage.'
                    });
                }
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
    ObtenerStorageLicenciaActiva(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const STORAGE = yield database_1.default.query(`
                SELECT 
                    su.id_storage_uso,
                    su.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    su.storage_mb_usado,
                    su.origen_calculo,
                    su.fecha_registro,
                    su.fecha_calculo,
                    su.calculo_exitoso,
                    su.mensaje_error,
                    su.observacion
                FROM public.licencia_storage_uso su
                INNER JOIN public.licencia l
                    ON l.id_licencia = su.id_licencia
                WHERE l.id_empresa = $1
                  AND l.estado = 'ACTIVA';
                `, [id_empresa]);
                return res.jsonp(STORAGE.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
    ObtenerTodosStorageLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const STORAGE = yield database_1.default.query(`
                SELECT 
                    su.id_storage_uso,
                    su.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    su.storage_mb_usado,
                    su.origen_calculo,
                    su.fecha_registro,
                    su.fecha_calculo,
                    su.calculo_exitoso,
                    su.mensaje_error,
                    su.observacion
                FROM public.licencia_storage_uso su
                INNER JOIN public.licencia l
                    ON l.id_licencia = su.id_licencia
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
                    su.fecha_calculo DESC;
                `, [id_empresa]);
                return res.jsonp(STORAGE.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
    ObtenerEmpresasInternasStorage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
            SELECT DISTINCT
                e.empresa_id,
                e.empresa_codigo,
                e.empresa_descripcion,
                e.instalacion,
                e.estado,

                l.id_licencia,
                l.estado AS estado_licencia,

                COALESCE(ll.storage_mb_max, 0) AS storage_mb_contratado

            FROM public.empresa e

            INNER JOIN public.empresa_bdd bd
                ON bd.id_empresa = e.empresa_id

            INNER JOIN public.licencia l
                ON l.id_empresa = e.empresa_id
               AND l.estado = 'ACTIVA'

            LEFT JOIN public.licencia_limite ll
                ON ll.id_licencia = l.id_licencia

            WHERE e.estado IS TRUE
              AND e.instalacion = 'INTERNA'

            ORDER BY e.empresa_descripcion ASC;
            `);
                return res.jsonp(EMPRESAS.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
    CalcularTamanoCarpetaBytes(rutaCarpeta) {
        return __awaiter(this, void 0, void 0, function* () {
            let totalBytes = 0;
            try {
                const elementos = yield promises_1.default.readdir(rutaCarpeta, { withFileTypes: true });
                for (const elemento of elementos) {
                    const rutaCompleta = path_1.default.join(rutaCarpeta, elemento.name);
                    if (elemento.isDirectory()) {
                        totalBytes += yield this.CalcularTamanoCarpetaBytes(rutaCompleta);
                    }
                    else if (elemento.isFile()) {
                        const stats = yield promises_1.default.stat(rutaCompleta);
                        totalBytes += stats.size;
                    }
                }
                return totalBytes;
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.code) === 'ENOENT') {
                    return 0;
                }
                throw error;
            }
        });
    }
    ConvertirBytesAMb(bytes) {
        return Number((bytes / 1024 / 1024).toFixed(2));
    }
    LimpiarCodigoEmpresa(codigoEmpresa) {
        return String(codigoEmpresa !== null && codigoEmpresa !== void 0 ? codigoEmpresa : '').trim();
    }
    CalcularStorageEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const codigo_empresa_ = this.LimpiarCodigoEmpresa(req.body.codigo_empresa);
                if (!codigo_empresa_) {
                    return res.status(400).jsonp({
                        message: 'Debe enviar el código de empresa.'
                    });
                }
                const rutaBase = process.env.RUTA_ARCHIVOS_BASE;
                if (!rutaBase) {
                    return res.status(500).jsonp({
                        message: 'No se encuentra configurada la ruta base de archivos.'
                    });
                }
                const rutaEmpresa = path_1.default.join(rutaBase, codigo_empresa_);
                const totalBytes = yield this.CalcularTamanoCarpetaBytes(rutaEmpresa);
                const storageMbUsado = this.ConvertirBytesAMb(totalBytes);
                return res.jsonp({
                    message: 'Storage calculado correctamente.',
                    data: {
                        codigo_empresa: codigo_empresa_,
                        storage_mb_usado: storageMbUsado,
                        total_bytes: totalBytes
                    }
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'No se pudo calcular el almacenamiento de la empresa.',
                    error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : null
                });
            }
        });
    }
}
exports.limiteAlmacenamientoControlador = new LimiteAlmacenamientoControlador();
exports.default = exports.limiteAlmacenamientoControlador;
