"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const limiteAlmacenamientoControlador_1 = __importDefault(require("../../../controlador/limites/almacenamiento/limiteAlmacenamientoControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const middlewareAutoTask_1 = require("../../../middleware/middlewareAutoTask");
class LimiteAlmacenamientoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.put('/guardar', verificarToken_1.TokenValidation, limiteAlmacenamientoControlador_1.default.GuardarLicenciaStorageUso);
        this.router.get('/activa/:id_empresa', verificarToken_1.TokenValidation, limiteAlmacenamientoControlador_1.default.ObtenerStorageLicenciaActiva);
        this.router.get('/todos/:id_empresa', verificarToken_1.TokenValidation, limiteAlmacenamientoControlador_1.default.ObtenerTodosStorageLicencia);
        this.router.post('/calcular-storage-empresa', verificarToken_1.TokenValidation, (req, res) => limiteAlmacenamientoControlador_1.default.CalcularStorageEmpresa(req, res));
        // SERVICIOS UTILIZADOS EN SERVIDOR AUTOTASK
        this.router.get('/autotask/storage/empresas-internas', middlewareAutoTask_1.AutotaskApiKey, (req, res) => limiteAlmacenamientoControlador_1.default.ObtenerEmpresasInternasStorage(req, res));
        this.router.put('/autotask/storage/guardar', middlewareAutoTask_1.AutotaskApiKey, (req, res) => limiteAlmacenamientoControlador_1.default.GuardarLicenciaStorageUso(req, res));
    }
}
const LIMITE_ALMACENAMIENTO_RUTAS = new LimiteAlmacenamientoRutas();
exports.default = LIMITE_ALMACENAMIENTO_RUTAS.router;
