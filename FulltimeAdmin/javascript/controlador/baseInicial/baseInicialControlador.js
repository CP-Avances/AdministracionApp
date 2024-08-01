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
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseInicialControlador = void 0;
const database_1 = require("../../database");
class BaseInicialControlador {
    ObtenerDatosBaseInicial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let datos_base = {
                    base: database_1.dbConfig.database,
                    host: database_1.dbConfig.host,
                    puerto: database_1.dbConfig.port,
                    usuario: database_1.dbConfig.user
                };
                res.status(200).jsonp(datos_base);
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
}
exports.baseInicialControlador = new BaseInicialControlador;
exports.default = exports.baseInicialControlador;
