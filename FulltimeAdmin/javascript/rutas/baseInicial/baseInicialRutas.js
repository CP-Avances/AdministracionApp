"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baseInicialControlador_1 = __importDefault(require("../../controlador/baseInicial/baseInicialControlador"));
class BaseInicialRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/base-informacion', baseInicialControlador_1.default.ObtenerDatosBaseInicial);
    }
}
const BASEINICIAL_RUTAS = new BaseInicialRutas();
exports.default = BASEINICIAL_RUTAS.router;
