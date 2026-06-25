"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const limitesUsuariosControlador_1 = __importDefault(require("../../../controlador/limites/usuarios/limitesUsuariosControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
class LimiteUsuariosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/registrar', verificarToken_1.TokenValidation, (req, res) => limitesUsuariosControlador_1.default.RegistrarLicenciaLimite(req, res));
        this.router.put('/actualizar', verificarToken_1.TokenValidation, (req, res) => limitesUsuariosControlador_1.default.ActualizarLicenciaLimite(req, res));
        this.router.get('/limites-activos/:id_empresa', verificarToken_1.TokenValidation, (req, res) => limitesUsuariosControlador_1.default.ObtenerLimiteLicenciaActiva(req, res));
        this.router.get('/limites-totales/:id_empresa', verificarToken_1.TokenValidation, (req, res) => limitesUsuariosControlador_1.default.ObtenerTodosLimitesLicencia(req, res));
    }
}
const LIMITE_USUARIOS_RUTAS = new LimiteUsuariosRutas();
exports.default = LIMITE_USUARIOS_RUTAS.router;
