"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const rsa_keys_service_1 = __importStar(require("../llaves/rsa-keys.service"));
class EmpresaControlador {
    ObtenerEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
                SELECT empresa_id, empresa_codigo, empresa_direccion, empresa_descripcion, hora_extra, accion_personal, alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, movil_direccion, movil_descripcion FROM empresa ORDER BY 1
                `);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        for (const empresa of EMPRESAS.rows) {
                            empresa.empresa_codigo = rsa_keys_service_1.FUNCIONES_LLAVES.desencriptarLogin(empresa.empresa_codigo);
                        }
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
            let empresa_direccion_ = req.body.empresa_direccion;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let hora_extra_ = req.body.hora_extra;
            let accion_personal_ = req.body.accion_personal;
            let alimentacion_ = req.body.alimentacion;
            let permisos_ = req.body.permisos;
            let geolocalizacion_ = req.body.geolocalizacion;
            let vacaciones_ = req.body.vacaciones;
            let app_movil_ = req.body.app_movil;
            let timbre_web_ = req.body.timbre_web;
            let movil_direccion_ = req.body.movil_direccion;
            let movil_descripcion_ = req.body.movil_descripcion;
            try {
                let codigo_empresa_mod = rsa_keys_service_1.default.encriptarLogin(empresa_codigo_);
                const response = yield database_1.default.query(`
                INSERT INTO empresa (empresa_codigo, empresa_direccion, empresa_descripcion, hora_extra, accion_personal, alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, movil_direccion, movil_descripcion)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
                `, [codigo_empresa_mod, empresa_direccion_, empresa_descripcion_, hora_extra_, accion_personal_, alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_, movil_direccion_, movil_descripcion_]);
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
            let empresa_direccion_ = req.body.empresa_direccion;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let hora_extra_ = req.body.hora_extra;
            let accion_personal_ = req.body.accion_personal;
            let alimentacion_ = req.body.alimentacion;
            let permisos_ = req.body.permisos;
            let geolocalizacion_ = req.body.geolocalizacion;
            let vacaciones_ = req.body.vacaciones;
            let app_movil_ = req.body.app_movil;
            let timbre_web_ = req.body.timbre_web;
            let movil_direccion_ = req.body.movil_direccion;
            let movil_descripcion_ = req.body.movil_descripcion;
            try {
                let empresa_codigo_mod = rsa_keys_service_1.default.encriptarLogin(empresa_codigo_);
                yield database_1.default.query(`
                UPDATE empresa SET empresa_codigo = $2, empresa_direccion = $3, empresa_descripcion = $4, hora_extra = $5, accion_personal = $6, alimentacion = $7, permisos = $8, geolocalizacion = $9, vacaciones = $10, app_movil = $11, timbre_web = $12, movil_direccion = $13, movil_descripcion = $14 
                WHERE empresa_id = $1
                `, [empresa_id_, empresa_codigo_mod, empresa_direccion_, empresa_descripcion_, hora_extra_, accion_personal_, alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_, movil_direccion_, movil_descripcion_]);
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
}
exports.empresaControlador = new EmpresaControlador;
exports.default = exports.empresaControlador;
