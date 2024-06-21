"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginControlador = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class LoginControlador {
    ObtenerDatosBaseInicial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena } = req.body;
                //OBTENCION DE DIRECCION IP
                var requestIp = require('request-ip');
                var clientIp = requestIp.getClientIp(req);
                if (clientIp != null && clientIp != '' && clientIp != undefined) {
                    var ip_cliente = clientIp.split(':')[3];
                }
                let fechaHoy = new Date();
                if (usuario === 'admin' && contrasena === 'adminFulltime') {
                    const token = jsonwebtoken_1.default.sign({
                        _usuario: usuario, _ip_adress: ip_cliente, _fecha: fechaHoy
                    }, process.env.TOKEN_SECRET || 'llaveSecreta', {
                        expiresIn: 60 * 60 * 23, algorithm: 'HS512'
                    });
                    return res.status(200).jsonp({ mensaje: 'ok', token, ip_adress: ip_cliente });
                }
                else {
                    res.status(500).jsonp({ message: 'Credenciales Erroneas' });
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
}
exports.loginControlador = new LoginControlador;
exports.default = exports.loginControlador;
