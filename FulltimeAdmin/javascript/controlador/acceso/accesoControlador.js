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
exports.accesoControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const pg_pool_1 = __importDefault(require("pg-pool"));
const rsa_keys_service_1 = require("../llaves/rsa-keys.service");
class AccesoControlador {
    ActualizarAccesoWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id_empresa_bdd_ = req.body.id_empresa_bdd;
                let web_access = req.body.web_access;
                const EMPRESA = yield database_1.default.query(`
                SELECT 
                    id_empresa_bdd, 
                    id_empresa, 
                    empresa_bdd_nombre, 
                    empresa_bdd_host, 
                    empresa_bdd_puerto, 
                    empresa_bdd_descripcion, 
                    empresa_bdd_usuario, 
                    empresa_bdd_contrasena 
                FROM empresa_bdd 
                WHERE id_empresa_bdd = $1
                `, [id_empresa_bdd_]);
                if (EMPRESA.rowCount != 0) {
                    let id_empresa_bdd_database = EMPRESA.rows[0].id_empresa_bdd;
                    let id_empresa_database = EMPRESA.rows[0].id_empresa;
                    let empresa_bdd_nombre_database = EMPRESA.rows[0].empresa_bdd_nombre;
                    let empresa_bdd_host_database = EMPRESA.rows[0].empresa_bdd_host;
                    let empresa_bdd_password_database = rsa_keys_service_1.FUNCIONES_LLAVES.desencriptarDatos(EMPRESA.rows[0].empresa_bdd_contrasena);
                    let empresa_bdd_port_database = EMPRESA.rows[0].empresa_bdd_puerto;
                    let empresa_bdd_user_database = EMPRESA.rows[0].empresa_bdd_usuario;
                    const dbConfigWebAccess = {
                        user: empresa_bdd_user_database,
                        host: empresa_bdd_host_database,
                        port: Number(empresa_bdd_port_database),
                        database: empresa_bdd_nombre_database,
                        password: empresa_bdd_password_database
                    };
                    const poolAccess = new pg_pool_1.default(dbConfigWebAccess);
                    yield poolAccess.query(`
                        UPDATE eu_empleados SET web_access = $1
                    `, [web_access]);
                    res.jsonp({ message: 'Registros actualizados.' });
                    //res.status(500).jsonp({ message: 'error' });
                    //return { error: 'Error en la actualizacion de Acceso a la aplicacion web.'}
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: error });
            }
        });
    }
}
exports.accesoControlador = new AccesoControlador;
exports.default = exports.accesoControlador;
