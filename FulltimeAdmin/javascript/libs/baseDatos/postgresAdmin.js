"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearClientePostgresBase = exports.CrearClientePostgresAdmin = void 0;
const pg_1 = require("pg");
function CrearClientePostgresAdmin() {
    var _a, _b;
    return new pg_1.Client({
        host: process.env.PG_ADMIN_HOST,
        port: Number((_a = process.env.PG_ADMIN_PORT) !== null && _a !== void 0 ? _a : 5432),
        user: process.env.PG_ADMIN_USER,
        password: process.env.PG_ADMIN_PASSWORD,
        database: (_b = process.env.PG_ADMIN_DATABASE) !== null && _b !== void 0 ? _b : 'postgres'
    });
}
exports.CrearClientePostgresAdmin = CrearClientePostgresAdmin;
function CrearClientePostgresBase(nombreBase) {
    var _a;
    return new pg_1.Client({
        host: process.env.PG_ADMIN_HOST,
        port: Number((_a = process.env.PG_ADMIN_PORT) !== null && _a !== void 0 ? _a : 5432),
        user: process.env.PG_ADMIN_USER,
        password: process.env.PG_ADMIN_PASSWORD,
        database: nombreBase
    });
}
exports.CrearClientePostgresBase = CrearClientePostgresBase;
