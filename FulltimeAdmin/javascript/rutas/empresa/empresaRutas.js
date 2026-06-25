"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresaControlador_1 = __importDefault(require("../../controlador/empresa/empresaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class EmpresaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/registro-empresa', verificarToken_1.TokenValidation, empresaControlador_1.default.RegistrarDatosEmpresa);
        this.router.put('/actualizar-empresa-form-uno', verificarToken_1.TokenValidation, empresaControlador_1.default.ActualizarDatosEmpresa);
        this.router.post('/eliminar-empresa', verificarToken_1.TokenValidation, empresaControlador_1.default.EliminarEmpresa);
        this.router.get('/zonas-horarias', verificarToken_1.TokenValidation, empresaControlador_1.default.ObtenerZonasHorarias);
        this.router.get('/verEmpresa/:id', verificarToken_1.TokenValidation, empresaControlador_1.default.ListarEmpresaId);
        this.router.get('/empresas', verificarToken_1.TokenValidation, empresaControlador_1.default.ObtenerEmpresas);
    }
}
const EMPRESA_RUTAS = new EmpresaRutas();
exports.default = EMPRESA_RUTAS.router;
