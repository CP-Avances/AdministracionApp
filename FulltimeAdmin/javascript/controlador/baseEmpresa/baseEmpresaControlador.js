"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.baseEmpresaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const rsa_keys_service_1 = __importStar(require("../llaves/rsa-keys.service"));
class BaseEmpresaControlador {
    RegistrarEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id_empresa_ = req.body.id_empresa;
            let empresa_bdd_nombre_ = req.body.empresa_bdd_nombre;
            let empresa_bdd_host_ = req.body.empresa_bdd_host;
            let empresa_bdd_puerto_ = req.body.empresa_bdd_puerto;
            let empresa_bdd_descripcion_ = req.body.empresa_bdd_descripcion;
            let empresa_bdd_usuario_ = req.body.empresa_bdd_usuario;
            let empresa_bdd_contrasena_ = req.body.empresa_bdd_contrasena;
            try {
                let contrasenaEncriptada = rsa_keys_service_1.FUNCIONES_LLAVES.encriptarDatos(empresa_bdd_contrasena_);
                const response = yield database_1.default.query(`
                INSERT INTO empresa_bdd (id_empresa, empresa_bdd_nombre, empresa_bdd_host, empresa_bdd_puerto, empresa_bdd_descripcion, empresa_bdd_usuario, empresa_bdd_contrasena) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `, [id_empresa_, empresa_bdd_nombre_, empresa_bdd_host_, empresa_bdd_puerto_, empresa_bdd_descripcion_, empresa_bdd_usuario_, contrasenaEncriptada]);
                const [registro_empresa] = response.rows;
                if (registro_empresa) {
                    return res.status(200).jsonp({ message: 'ok' });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    ObtenerBaseEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
                SELECT 
                    empresa_bdd.id_empresa_bdd, 
                    empresa_bdd.id_empresa, 
                    empresa_bdd.empresa_bdd_nombre, 
                    empresa_bdd.empresa_bdd_host, 
                    empresa_bdd.empresa_bdd_puerto, 
                    empresa_bdd.empresa_bdd_descripcion, 
                    empresa.empresa_direccion, 
                    empresa.empresa_descripcion, 
                    empresa.movil_direccion, 
                    empresa.movil_descripcion 
                FROM empresa_bdd empresa_bdd 
                INNER JOIN empresa empresa ON empresa_bdd.id_empresa = empresa.empresa_id 
                ORDER BY empresa.empresa_direccion 
                `);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        return res.jsonp(EMPRESAS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    ObtenerBaseEmpresasInformacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
                SELECT 
                    pg_database.oid as num_proceso, 
                    pg_database.datname as nombre_bdd, 
                    pg_size_pretty(pg_database_size(pg_database.datname)) as tamano_bdd, 
                    empresa.empresa_id, 
                    empresa.empresa_descripcion, 
                    empresas_bdd.id_empresa_bdd, 
                    empresas_bdd.empresa_bdd_descripcion,
                    empresas_bdd.empresa_bdd_usuario,
                    empresas_bdd.empresa_bdd_contrasena 
                FROM pg_database pg_database 
                LEFT JOIN (SELECT * FROM empresa_bdd) AS empresas_bdd ON empresas_bdd.empresa_bdd_nombre = pg_database.datname 
                INNER JOIN (SELECT * FROM empresa) AS empresa ON empresa.empresa_id = empresas_bdd.id_empresa 
                WHERE pg_database.datname NOT IN ('postgres', 'template1', 'template0', 'ft_v4_login') 
                ORDER BY pg_database_size(pg_database.datname) DESC
                `);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        for (const empresa of EMPRESAS.rows) {
                            console.log(empresa.empresa_bdd_contrasena);
                            empresa.empresa_bdd_contrasena = rsa_keys_service_1.FUNCIONES_LLAVES.desencriptarDatos(empresa.empresa_bdd_contrasena).toString();
                            console.log(empresa.empresa_bdd_contrasena);
                        }
                        return res.jsonp(EMPRESAS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: error });
            }
        });
    }
    BuscarBaseEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let nombre_bdd_ = '%' + req.body.nombre_bdd + '%';
                let nombre_empresa_ = '%' + req.body.nombre_empresa + '%';
                const EMPRESAS = yield database_1.default.query(`
                SELECT 
                    pg_database.oid as num_proceso, 
                    pg_database.datname as nombre_bdd, 
                    pg_size_pretty(pg_database_size(pg_database.datname)) as tamano_bdd, 
                    empresa.empresa_id, 
                    empresa.empresa_descripcion, 
                    empresas_bdd.id_empresa_bdd, 
                    empresas_bdd.empresa_bdd_descripcion 
                FROM pg_database pg_database 
                LEFT JOIN (SELECT * FROM empresa_bdd) AS empresas_bdd ON empresas_bdd.empresa_bdd_nombre = pg_database.datname 
                INNER JOIN (SELECT * FROM empresa) AS empresa ON empresa.empresa_id = empresas_bdd.id_empresa 
                WHERE 
                    pg_database.datname NOT IN ($1, $2, $3, $4) AND 
                    (empresa.empresa_descripcion ILIKE $5 OR pg_database.datname ILIKE $6)
                ORDER BY pg_database_size(pg_database.datname) DESC
                `, ['postgres', 'template1', 'template0', 'ft_v4_login', nombre_bdd_, nombre_empresa_]);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        res.jsonp(EMPRESAS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: error });
            }
        });
    }
    ActualizarBaseEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id_empresa_bdd_ = req.body.id_empresa_bdd;
            let id_empresa_ = req.body.id_empresa;
            let empresa_bdd_nombre_ = req.body.empresa_bdd_nombre;
            let empresa_bdd_host_ = req.body.empresa_bdd_host;
            let empresa_bdd_puerto_ = req.body.empresa_bdd_puerto;
            let empresa_bdd_descripcion_ = req.body.empresa_bdd_descripcion;
            let empresa_bdd_usuario_ = req.body.empresa_bdd_usuario;
            let empresa_bdd_contrasena_ = req.body.empresa_bdd_contrasena;
            try {
                var contrasenaEncriptada = rsa_keys_service_1.default.encriptarDatos(empresa_bdd_contrasena_);
                console.log('_' + contrasenaEncriptada + '_');
                console.log('_' + rsa_keys_service_1.default.desencriptarDatos(contrasenaEncriptada) + '_');
                yield database_1.default.query(`
                UPDATE empresa_bdd SET id_empresa = $1, empresa_bdd_nombre = $2, empresa_bdd_host = $3, empresa_bdd_puerto = $4, empresa_bdd_descripcion = $5, empresa_bdd_usuario = $6, empresa_bdd_contrasena = $7  
                WHERE id_empresa_bdd = $8 
                `, [id_empresa_, empresa_bdd_nombre_, empresa_bdd_host_, empresa_bdd_puerto_, empresa_bdd_descripcion_, empresa_bdd_usuario_, contrasenaEncriptada, id_empresa_bdd_]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: error });
            }
        });
    }
    EliminarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id_empresa_bdd_ = req.body.id_empresa_bdd;
                yield database_1.default.query(`
                DELETE FROM empresa_bdd WHERE id_empresa_bdd = $1
                `, [id_empresa_bdd_]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
}
exports.baseEmpresaControlador = new BaseEmpresaControlador;
exports.default = exports.baseEmpresaControlador;
