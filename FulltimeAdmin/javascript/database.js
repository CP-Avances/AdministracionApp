"use strict";
// CONEXION CON LA BASE DE DATOS POSTGRESQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = exports.pool = void 0;
const pg_pool_1 = __importDefault(require("pg-pool"));
const dbConfig = {
    user: 'fulltime', // postgres
    host: '192.168.0.156',
    port: 5432,
    database: 'fulltime4_pruebas_empresa',
    password: 'fulltime'
};
exports.dbConfig = dbConfig;
const pool = new pg_pool_1.default(dbConfig);
exports.pool = pool;
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log("Error durante la conexión", err);
    }
    else {
        console.log("Conexión exitosa");
    }
});
exports.default = pool;
