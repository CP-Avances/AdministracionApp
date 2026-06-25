"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licenciaMovimientoControlador_1 = __importDefault(require("../../controlador/historial/licenciaMovimientoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class LicenciaMovimientosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/:id_empresa', verificarToken_1.TokenValidation, licenciaMovimientoControlador_1.default.ObtenerMovimientosLicencia);
    }
}
const LICENCIA_MOVIMIENTOS_RUTAS = new LicenciaMovimientosRutas();
exports.default = LICENCIA_MOVIMIENTOS_RUTAS.router;
