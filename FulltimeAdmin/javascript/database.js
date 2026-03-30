"use strict";
// CONEXION CON LA BASE DE DATOS POSTGRESQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = exports.pool = void 0;
const pg_pool_1 = __importDefault(require("pg-pool"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
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
