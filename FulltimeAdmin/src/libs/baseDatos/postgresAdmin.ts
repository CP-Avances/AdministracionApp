import { Client } from 'pg';

export function CrearClientePostgresAdmin(): Client {
    return new Client({
        host: process.env.PG_ADMIN_HOST,
        port: Number(process.env.PG_ADMIN_PORT ?? 5432),
        user: process.env.PG_ADMIN_USER,
        password: process.env.PG_ADMIN_PASSWORD,
        database: process.env.PG_ADMIN_DATABASE ?? 'postgres'
    });
}

export function CrearClientePostgresBase(nombreBase: string): Client {
    return new Client({
        host: process.env.PG_ADMIN_HOST,
        port: Number(process.env.PG_ADMIN_PORT ?? 5432),
        user: process.env.PG_ADMIN_USER,
        password: process.env.PG_ADMIN_PASSWORD,
        database: nombreBase
    });
}