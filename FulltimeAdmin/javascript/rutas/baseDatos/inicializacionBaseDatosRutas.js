"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inicializacionBaseDatosControlador_1 = __importDefault(require("../../controlador/baseDatos/inicializacionBaseDatosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const uploadScriptsBd_1 = require("../../middleware/uploadScriptsBd");
class InicializacionBaseDatosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/crear-base', verificarToken_1.TokenValidation, (req, res) => inicializacionBaseDatosControlador_1.default.CrearBaseDatos(req, res));
        this.router.post('/ejecutar-scripts', verificarToken_1.TokenValidation, uploadScriptsBd_1.UploadScriptsBd.fields([
            { name: 'script_tablas', maxCount: 1 },
            { name: 'script_vistas', maxCount: 1 },
            { name: 'script_datos_iniciales', maxCount: 1 }
        ]), (req, res) => inicializacionBaseDatosControlador_1.default.EjecutarScriptsInicializacion(req, res));
        this.router.get('/historial/:id_empresa', verificarToken_1.TokenValidation, (req, res) => inicializacionBaseDatosControlador_1.default.ObtenerHistorialInicializacion(req, res));
    }
}
const INICIALIZACION_BASE_DATOS_RUTAS = new InicializacionBaseDatosRutas();
exports.default = INICIALIZACION_BASE_DATOS_RUTAS.router;
