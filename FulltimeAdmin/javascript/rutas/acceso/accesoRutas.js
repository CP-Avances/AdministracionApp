"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accesoControlador_1 = __importDefault(require("../../controlador/acceso/accesoControlador"));
class AccesoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/actualizar-accessweb', accesoControlador_1.default.ActualizarAccesoWeb);
    }
}
const ACCESO_RUTAS = new AccesoRutas();
exports.default = ACCESO_RUTAS.router;
