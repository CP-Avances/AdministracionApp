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
exports.empresaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class EmpresaControlador {
    ObtenerEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
                SELECT 
                empresa_id, empresa_codigo, empresa_descripcion, hora_extra, accion_personal, 
                alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, 
                estado, instalacion 
                FROM empresa ORDER BY estado DESC
                `);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        return res.jsonp(EMPRESAS.rows);
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
    RegistrarEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_codigo_ = req.body.empresa_codigo;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let numero_relojes_ = req.body.numero_relojes;
            let instalacion_ = req.body.instalacion;
            let hora_extra_ = req.body.hora_extra;
            let accion_personal_ = req.body.accion_personal;
            let alimentacion_ = req.body.alimentacion;
            let permisos_ = req.body.permisos;
            let geolocalizacion_ = req.body.geolocalizacion;
            let vacaciones_ = req.body.vacaciones;
            let app_movil_ = req.body.app_movil;
            let timbre_web_ = req.body.timbre_web;
            let zona_horaria_ = req.body.zona_horaria;
            try {
                let codigo_empresa_mod = empresa_codigo_;
                const response = yield database_1.default.query(`
                INSERT INTO empresa (empresa_codigo, empresa_descripcion, numero_relojes, hora_extra, 
                accion_personal, alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, 
                zona_horaria, instalacion)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
                `, [codigo_empresa_mod, empresa_descripcion_, numero_relojes_, hora_extra_, accion_personal_,
                    alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_,
                    zona_horaria_, instalacion_]);
                const [registro_empresa] = response.rows;
                if (registro_empresa) {
                    return res.status(200).jsonp({ message: 'ok' });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    ActualizarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_id_ = req.body.empresa_id;
            let empresa_codigo_ = req.body.empresa_codigo;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let hora_extra_ = req.body.hora_extra;
            let accion_personal_ = req.body.accion_personal;
            let alimentacion_ = req.body.alimentacion;
            let permisos_ = req.body.permisos;
            let geolocalizacion_ = req.body.geolocalizacion;
            let vacaciones_ = req.body.vacaciones;
            let app_movil_ = req.body.app_movil;
            let timbre_web_ = req.body.timbre_web;
            let estado_ = req.body.estado;
            let zona_horaria_ = req.body.zona_horaria;
            try {
                let empresa_codigo_mod = empresa_codigo_;
                yield database_1.default.query(`
                UPDATE empresa SET empresa_codigo = $2, empresa_descripcion = $3, hora_extra = $4, 
                accion_personal = $5, alimentacion = $6, permisos = $7, geolocalizacion = $8, 
                vacaciones = $9, app_movil = $10, timbre_web = $11, 
                estado = $12, zona_horaria = $13
                WHERE empresa_id = $1
                `, [empresa_id_, empresa_codigo_mod, empresa_descripcion_, hora_extra_, accion_personal_,
                    alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_,
                    estado_, zona_horaria_]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: error });
            }
        });
    }
    ActualizarEmpresaFormUno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_id_ = req.body.empresa_id;
            let empresa_codigo_ = req.body.empresa_codigo;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let empresa_numero_relojes_ = req.body.numero_relojes;
            let empresa_estado_ = req.body.estado;
            let empresa_zona_horaria_ = req.body.zona_horaria;
            let empresa_instalacion_ = req.body.instalacion;
            try {
                let empresa_codigo_mod = empresa_codigo_;
                yield database_1.default.query(`
                UPDATE empresa SET empresa_codigo = $2, empresa_descripcion = $3, 
                numero_relojes = $4, estado = $5, zona_horaria = $6, instalacion = $7
                WHERE empresa_id = $1
                `, [empresa_id_, empresa_codigo_mod, empresa_descripcion_,
                    empresa_numero_relojes_, empresa_estado_, empresa_zona_horaria_, empresa_instalacion_]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: error });
            }
        });
    }
    EliminarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let empresa_id_ = req.body.empresa_id;
                yield database_1.default.query(`
                DELETE FROM empresa WHERE empresa_id = $1
                `, [empresa_id_]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    ListarEmpresaId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPRESA = yield database_1.default.query(`
            SELECT * FROM empresa WHERE empresa_id = $1
            `, [id]);
            if (EMPRESA.rowCount != 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ActualizarEmpresaModulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_id_ = req.body.empresa_id;
            let empresa_modulos_permisos_ = req.body.empresa_modulos_permisos_;
            let empresa_modulos_vacaciones_ = req.body.empresa_modulos_vacaciones_;
            let empresa_modulos_hora_extra_ = req.body.empresa_modulos_hora_extra_;
            let empresa_modulos_geolocalizacion_ = req.body.empresa_modulos_geolocalizacion_;
            let empresa_modulos_timbre_web_ = req.body.empresa_modulos_timbre_web_;
            let empresa_modulos_app_movil_ = req.body.empresa_modulos_app_movil_;
            let empresa_modulos_accion_personal_ = req.body.empresa_modulos_accion_personal_;
            let empresa_modulos_alimentacion_ = req.body.empresa_modulos_alimentacion_;
            try {
                yield database_1.default.query(`
                UPDATE empresa SET hora_extra = $2, accion_personal = $3, alimentacion = $4,
                 permisos = $5, geolocalizacion = $6, vacaciones = $7, app_movil = $8, timbre_web = $9 
                WHERE empresa_id = $1
                `, [empresa_id_, empresa_modulos_hora_extra_, empresa_modulos_accion_personal_,
                    empresa_modulos_alimentacion_, empresa_modulos_permisos_,
                    empresa_modulos_geolocalizacion_, empresa_modulos_vacaciones_,
                    empresa_modulos_app_movil_, empresa_modulos_timbre_web_]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: error });
            }
        });
    }
    ObtenerZonasHorarias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ZONAS = yield database_1.default.query(`
                SELECT * FROM zonas_horarias ORDER BY nombre_general ASC
                `);
                if (ZONAS.rowCount !== null) {
                    if (ZONAS.rowCount > 0) {
                        return res.jsonp(ZONAS.rows);
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
}
exports.empresaControlador = new EmpresaControlador;
exports.default = exports.empresaControlador;
