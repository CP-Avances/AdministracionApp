"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licenciaControlador_1 = __importDefault(require("../../controlador/licencia/licenciaControlador"));
class LicenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/registro-licencia', licenciaControlador_1.default.RegistrarLicencia);
        this.router.get('/licencias', licenciaControlador_1.default.ObtenerLicencias);
        this.router.get('/licencias-empresas', licenciaControlador_1.default.ObtenerLicenciasEmpresas);
        this.router.get('/licencias-empresas/:id', licenciaControlador_1.default.BuscarLicenciaPorId);
        this.router.put('/actualizar-licencia', licenciaControlador_1.default.ActualizarLicencia);
        this.router.post('/eliminar-licencia', licenciaControlador_1.default.EliminarLicencia);
    }
}
const LICENCIA_RUTAS = new LicenciaRutas();
exports.default = LICENCIA_RUTAS.router;
