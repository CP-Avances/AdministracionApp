"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baseEmpresaControlador_1 = __importDefault(require("../../controlador/baseEmpresa/baseEmpresaControlador"));
class BaseEmpresaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/registro-base-empresas', baseEmpresaControlador_1.default.RegistrarEmpresas);
        this.router.get('/base-empresas-informacion', baseEmpresaControlador_1.default.ObtenerBaseEmpresasInformacion);
        this.router.get('/base-empresas', baseEmpresaControlador_1.default.ObtenerBaseEmpresas);
        this.router.post('/buscar-empresas', baseEmpresaControlador_1.default.BuscarBaseEmpresas);
        this.router.get('/buscar-empresas/:id', baseEmpresaControlador_1.default.BuscarBaseEmpresasPorId);
        this.router.put('/actualizar-empresas', baseEmpresaControlador_1.default.ActualizarBaseEmpresa);
        this.router.post('/eliminar-empresas', baseEmpresaControlador_1.default.EliminarEmpresa);
    }
}
const BASE_EMPRESA_RUTAS = new BaseEmpresaRutas();
exports.default = BASE_EMPRESA_RUTAS.router;
