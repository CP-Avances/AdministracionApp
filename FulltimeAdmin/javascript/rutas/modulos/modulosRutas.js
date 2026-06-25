"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const modulosControlador_1 = __importDefault(require("../../controlador/modulos/modulosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ModulosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/buscar-modulos', verificarToken_1.TokenValidation, (req, res) => modulosControlador_1.default.ObtenerModulos(req, res));
        this.router.get('/modulos-activos/:id_empresa', verificarToken_1.TokenValidation, (req, res) => modulosControlador_1.default.ObtenerModulosActivos(req, res));
        this.router.put('/licencia-modulos/guardar', verificarToken_1.TokenValidation, (req, res) => modulosControlador_1.default.GuardarLicenciaModulos(req, res));
        this.router.get('/modulos-licencia/:id_empresa', verificarToken_1.TokenValidation, (req, res) => modulosControlador_1.default.ObtenerTodosModulosLicencia(req, res));
    }
}
const MODULOS_RUTAS = new ModulosRutas();
exports.default = MODULOS_RUTAS.router;
