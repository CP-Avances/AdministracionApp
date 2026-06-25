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
exports.inicializacionBaseDatosControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const postgresAdmin_1 = require("../../libs/baseDatos/postgresAdmin");
const promises_1 = __importDefault(require("fs/promises"));
class InicializacionBaseDatosControlador {
    LimpiarNombreBase(nombreBase) {
        const nombre = String(nombreBase !== null && nombreBase !== void 0 ? nombreBase : '').trim().toLowerCase();
        if (!nombre) {
            throw new Error('Debe enviar el nombre de la base de datos.');
        }
        if (nombre.length > 63) {
            throw new Error('El nombre de la base no puede superar los 63 caracteres.');
        }
        const patronPermitido = /^[a-z][a-z0-9_]*$/;
        if (!patronPermitido.test(nombre)) {
            throw new Error('El nombre de la base debe iniciar con una letra y solo puede contener letras, números y guion bajo.');
        }
        return nombre;
    }
    EscaparIdentificadorPostgres(valor) {
        return `"${valor.replace(/"/g, '""')}"`;
    }
    ObtenerIdEmpresa(req) {
        var _a;
        return Number((_a = req.body.id_empresa) !== null && _a !== void 0 ? _a : 0) || null;
    }
    ObtenerEmpresaCodigo(req) {
        var _a;
        return String((_a = req.body.empresa_codigo) !== null && _a !== void 0 ? _a : '').trim() || null;
    }
    ObtenerUsuarioRegistra(req) {
        var _a;
        return String((_a = req.body.usuario_registra) !== null && _a !== void 0 ? _a : '').trim() || null;
    }
    RegistrarLogInicializacion(datos) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                yield database_1.default.query(`
                INSERT INTO public.empresa_inicializacion_bd_log (
                    id_empresa,
                    empresa_codigo,
                    nombre_base,
                    paso,
                    archivo,
                    exitoso,
                    mensaje,
                    usuario_registra,
                    fecha_registro
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, now()
                );
                `, [
                    (_a = datos.id_empresa) !== null && _a !== void 0 ? _a : null,
                    (_b = datos.empresa_codigo) !== null && _b !== void 0 ? _b : null,
                    datos.nombre_base,
                    datos.paso,
                    (_c = datos.archivo) !== null && _c !== void 0 ? _c : null,
                    datos.exitoso,
                    (_d = datos.mensaje) !== null && _d !== void 0 ? _d : null,
                    (_e = datos.usuario_registra) !== null && _e !== void 0 ? _e : null
                ]);
            }
            catch (error) {
                console.log('No se pudo registrar log de inicialización BD:', error);
            }
        });
    }
    CrearBaseDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let clienteAdmin;
            let nombreBaseLog = '';
            const idEmpresa = this.ObtenerIdEmpresa(req);
            const empresaCodigo = this.ObtenerEmpresaCodigo(req);
            const usuarioRegistra = this.ObtenerUsuarioRegistra(req);
            try {
                const nombreBase = this.LimpiarNombreBase(req.body.nombre_base);
                nombreBaseLog = nombreBase;
                clienteAdmin = (0, postgresAdmin_1.CrearClientePostgresAdmin)();
                yield clienteAdmin.connect();
                const existeBase = yield clienteAdmin.query(`
                SELECT 1
                FROM pg_database
                WHERE datname = $1;
                `, [nombreBase]);
                if (((_a = existeBase.rowCount) !== null && _a !== void 0 ? _a : 0) > 0) {
                    yield this.RegistrarLogInicializacion({
                        id_empresa: idEmpresa,
                        empresa_codigo: empresaCodigo,
                        nombre_base: nombreBase,
                        paso: 'CREAR_BASE',
                        archivo: null,
                        exitoso: false,
                        mensaje: 'La base de datos ya existe.',
                        usuario_registra: usuarioRegistra
                    });
                    return res.status(400).jsonp({
                        message: 'La base de datos ya existe.'
                    });
                }
                const nombreBaseSql = this.EscaparIdentificadorPostgres(nombreBase);
                yield clienteAdmin.query(`CREATE DATABASE ${nombreBaseSql};`);
                yield this.RegistrarLogInicializacion({
                    id_empresa: idEmpresa,
                    empresa_codigo: empresaCodigo,
                    nombre_base: nombreBase,
                    paso: 'CREAR_BASE',
                    archivo: null,
                    exitoso: true,
                    mensaje: 'Base de datos creada correctamente.',
                    usuario_registra: usuarioRegistra
                });
                return res.jsonp({
                    message: 'Base de datos creada correctamente.',
                    data: {
                        nombre_base: nombreBase
                    }
                });
            }
            catch (error) {
                console.log('Error al crear base de datos:', error);
                if (nombreBaseLog) {
                    yield this.RegistrarLogInicializacion({
                        id_empresa: idEmpresa,
                        empresa_codigo: empresaCodigo,
                        nombre_base: nombreBaseLog,
                        paso: 'CREAR_BASE',
                        archivo: null,
                        exitoso: false,
                        mensaje: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'No se pudo crear la base de datos.',
                        usuario_registra: usuarioRegistra
                    });
                }
                return res.status(500).jsonp({
                    message: (_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'No se pudo crear la base de datos.'
                });
            }
            finally {
                if (clienteAdmin) {
                    yield clienteAdmin.end();
                }
            }
        });
    }
    EjecutarArchivoSql(nombreBase, rutaArchivo) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = yield promises_1.default.readFile(rutaArchivo, 'utf8');
            const cliente = (0, postgresAdmin_1.CrearClientePostgresBase)(nombreBase);
            yield cliente.connect();
            try {
                yield cliente.query(sql);
            }
            finally {
                yield cliente.end();
            }
        });
    }
    EjecutarScriptsInicializacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const archivos = req.files;
            const idEmpresa = this.ObtenerIdEmpresa(req);
            const empresaCodigo = this.ObtenerEmpresaCodigo(req);
            const usuarioRegistra = this.ObtenerUsuarioRegistra(req);
            try {
                const nombreBase = this.LimpiarNombreBase(req.body.nombre_base);
                const scriptTablas = (_a = archivos === null || archivos === void 0 ? void 0 : archivos.script_tablas) === null || _a === void 0 ? void 0 : _a[0];
                const scriptVistas = (_b = archivos === null || archivos === void 0 ? void 0 : archivos.script_vistas) === null || _b === void 0 ? void 0 : _b[0];
                const scriptDatos = (_c = archivos === null || archivos === void 0 ? void 0 : archivos.script_datos_iniciales) === null || _c === void 0 ? void 0 : _c[0];
                if (!scriptTablas || !scriptVistas || !scriptDatos) {
                    return res.status(400).jsonp({
                        message: 'Debe cargar los scripts de tablas, vistas y datos iniciales.'
                    });
                }
                const resultado = [];
                const ejecutarPaso = (paso, archivo) => __awaiter(this, void 0, void 0, function* () {
                    var _e;
                    try {
                        yield this.EjecutarArchivoSql(nombreBase, archivo.path);
                        yield this.RegistrarLogInicializacion({
                            id_empresa: idEmpresa,
                            empresa_codigo: empresaCodigo,
                            nombre_base: nombreBase,
                            paso,
                            archivo: archivo.originalname,
                            exitoso: true,
                            mensaje: 'Script ejecutado correctamente.',
                            usuario_registra: usuarioRegistra
                        });
                        resultado.push({
                            paso,
                            archivo: archivo.originalname,
                            exitoso: true
                        });
                    }
                    catch (error) {
                        yield this.RegistrarLogInicializacion({
                            id_empresa: idEmpresa,
                            empresa_codigo: empresaCodigo,
                            nombre_base: nombreBase,
                            paso,
                            archivo: archivo.originalname,
                            exitoso: false,
                            mensaje: (_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Error al ejecutar script.',
                            usuario_registra: usuarioRegistra
                        });
                        throw error;
                    }
                });
                yield ejecutarPaso('TABLAS', scriptTablas);
                yield ejecutarPaso('VISTAS', scriptVistas);
                yield ejecutarPaso('DATOS_INICIALES', scriptDatos);
                return res.jsonp({
                    message: 'Scripts ejecutados correctamente.',
                    data: resultado
                });
            }
            catch (error) {
                console.log('Error al ejecutar scripts:', error);
                return res.status(500).jsonp({
                    message: (_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : 'No se pudieron ejecutar los scripts.'
                });
            }
            finally {
                yield this.EliminarArchivosTemporales(archivos);
            }
        });
    }
    ObtenerHistorialInicializacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idEmpresa = Number(req.params.id_empresa);
                if (!idEmpresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const resultado = yield database_1.default.query(`
                SELECT
                    id_log,
                    id_empresa,
                    empresa_codigo,
                    nombre_base,
                    paso,
                    archivo,
                    exitoso,
                    mensaje,
                    usuario_registra,
                    fecha_registro
                FROM public.empresa_inicializacion_bd_log
                WHERE id_empresa = $1
                ORDER BY fecha_registro DESC, id_log DESC;
                `, [idEmpresa]);
                return res.jsonp(resultado.rows);
            }
            catch (error) {
                console.log('Error al obtener historial de inicialización BD:', error);
                return res.status(500).jsonp({
                    message: 'No se pudo obtener el historial de inicialización.'
                });
            }
        });
    }
    EliminarArchivosTemporales(archivos) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!archivos) {
                    return;
                }
                const archivosSubidos = Object.values(archivos).flat();
                for (const archivo of archivosSubidos) {
                    if (!(archivo === null || archivo === void 0 ? void 0 : archivo.path)) {
                        continue;
                    }
                    try {
                        yield promises_1.default.unlink(archivo.path);
                    }
                    catch (error) {
                        if ((error === null || error === void 0 ? void 0 : error.code) !== 'ENOENT') {
                            console.log('No se pudo eliminar archivo temporal:', archivo.path, error);
                        }
                    }
                }
            }
            catch (error) {
                console.log('Error general al limpiar archivos temporales:', error);
            }
        });
    }
}
exports.inicializacionBaseDatosControlador = new InicializacionBaseDatosControlador();
exports.default = exports.inicializacionBaseDatosControlador;
